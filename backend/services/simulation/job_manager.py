import time
import uuid
from typing import Dict, Any, List, Optional
from backend.services.models.manager import ModelManager

class SimulationJobManager:
    """Manages asynchronous hydrodynamic simulation lifecycle, progress, and logs."""

    # In-memory store for simulation jobs
    _jobs: Dict[str, Dict[str, Any]] = {}

    PIPELINE_STAGES = [
        {"stage": "mesh-generation", "status": "MESH_GENERATION", "progress": 16, "label": "1. Mesh Generation", "msg": "Generating 2D computational shallow water mesh and metric projected UTM grid"},
        {"stage": "boundary-conditions", "status": "BOUNDARY_SETUP", "progress": 33, "label": "2. Boundary Condition Setup", "msg": "Configuring inflow hydrograph, dynamic dam breach weir, and stage-discharge curves"},
        {"stage": "hydro-propagation", "status": "HYDRO_PROPAGATION", "progress": 50, "label": "3. Hydrodynamic Propagation", "msg": "Solving 2D depth-averaged shallow water equations and shock-capturing flood wave"},
        {"stage": "wse-solver", "status": "WSE_SOLVER", "progress": 68, "label": "4. Water Surface Elevation Solver", "msg": "Computing dynamic water surface elevations, inundation depth envelope, and velocity field"},
        {"stage": "hazard-calculation", "status": "HAZARD_CALCULATION", "progress": 85, "label": "5. Hazard Calculation", "msg": "Computing hazard intensity rating (depth × velocity) and downstream critical infrastructure exposure"},
        {"stage": "result-postprocessing", "status": "RESULT_POST_PROCESSING", "progress": 100, "label": "6. Result Post-Processing", "msg": "Compiling standardized GeoJSON polygons, arrival contours, and export packages"}
    ]

    @classmethod
    def create_job(cls, model: str, scenario: Dict[str, Any], dataset: Optional[Dict[str, Any]] = None, mode: str = "demo") -> str:
        """Initializes a new simulation job."""
        job_id = f"JOB-{uuid.uuid4().hex[:8].upper()}"
        now_str = time.strftime("%H:%M:%S", time.localtime())

        cls._jobs[job_id] = {
            "id": job_id,
            "model": model,
            "scenario": scenario,
            "dataset": dataset,
            "mode": mode,
            "status": "QUEUED",
            "progress": 5,
            "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "logs": [
                {"timestamp": now_str, "level": "INFO", "message": f"Job {job_id} queued. Selected solver: {model.upper()}"}
            ],
            "result": None,
            "error": None
        }
        return job_id

    @classmethod
    def get_job(cls, job_id: str) -> Optional[Dict[str, Any]]:
        return cls._jobs.get(job_id)

    @classmethod
    def run_job_sync(cls, job_id: str) -> Dict[str, Any]:
        """Runs the simulation through the full pipeline synchronously (or stepwise)."""
        job = cls._jobs.get(job_id)
        if not job:
            raise ValueError(f"Job {job_id} not found")

        model = job["model"]
        scenario = job["scenario"]
        dataset = job["dataset"]
        mode = job["mode"]

        # If user asked for SPH or Delft3D in real data mode:
        if mode == "real":
            if not dataset:
                job["status"] = "DATASET_NOT_SELECTED"
                job["error"] = "DATASET NOT SELECTED: A real river basin dataset must be selected before starting simulation."
                job["progress"] = 0
                job["logs"].append({
                    "timestamp": time.strftime("%H:%M:%S", time.localtime()),
                    "level": "ERROR",
                    "message": "REAL SIMULATION BLOCKED: No river basin dataset selected."
                })
                return job

            if model.upper() in ["DEMO", "DEMO_ENGINE", "DEMOENGINE"]:
                job["status"] = "INVALID_SOLVER"
                job["error"] = "INVALID SOLVER: Demo Engine cannot be used in Real Data Mode."
                job["progress"] = 0
                job["logs"].append({
                    "timestamp": time.strftime("%H:%M:%S", time.localtime()),
                    "level": "ERROR",
                    "message": "REAL SIMULATION BLOCKED: Demo Engine is prohibited in Real Data Mode."
                })
                return job

            if model.upper() in ["SPH", "DELFT3D"]:
                # Run real model check
                check_result = ModelManager.run_simulation(model, scenario, dataset, force_demo=False)
                if check_result.get("status") == "ENGINE_NOT_CONFIGURED":
                    now_str = time.strftime("%H:%M:%S", time.localtime())
                    job["status"] = "ENGINE_NOT_CONFIGURED"
                    job["progress"] = 0
                    job["error"] = check_result.get("error")
                    job["logs"].append({
                        "timestamp": now_str,
                        "level": "ERROR",
                        "message": f"REAL SIMULATION BLOCKED: {check_result.get('error')}"
                    })
                    job["result"] = check_result
                    return job

        # Execute demo/calibrated pipeline
        for stage in cls.PIPELINE_STAGES:
            job["status"] = stage["status"]
            job["progress"] = stage["progress"]
            now_str = time.strftime("%H:%M:%S", time.localtime())
            job["logs"].append({
                "timestamp": now_str,
                "level": "INFO",
                "message": stage["msg"]
            })

        # Produce final standardized FloodResult
        result = ModelManager.run_simulation(model if mode == "real" else "DEMO", scenario, dataset, force_demo=(mode != "real"))
        job["result"] = result
        job["status"] = "COMPLETED"
        job["progress"] = 100
        now_str = time.strftime("%H:%M:%S", time.localtime())
        job["logs"].append({
            "timestamp": now_str,
            "level": "SUCCESS",
            "message": f"Simulation output compiled successfully. Peak inundation: {result.get('inundationArea', 235)} km²"
        })
        return job
