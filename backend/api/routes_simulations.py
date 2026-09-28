from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any, Optional
from backend.services.simulation.job_manager import SimulationJobManager
from backend.services.models.sph.sph_engine import SPHEngine
from backend.services.models.delft3d.delft3d_engine import Delft3DEngine
from backend.services.impact.hadr_analyzer import HADRAnalyzer
from backend.services.validation.satellite_service import SatelliteValidationService

router = APIRouter(prefix="/simulations", tags=["Simulations"])

@router.post("/run")
def run_simulation(payload: Dict[str, Any]):
    """Initiates a simulation job using the specified hydrodynamic model."""
    model = payload.get("model", "DEMO")
    scenario = payload.get("scenario", {})
    dataset = payload.get("dataset")
    mode = payload.get("mode", "demo")  # 'demo' or 'real'

    if not scenario:
        raise HTTPException(status_code=400, detail="Scenario payload is required")

    if mode == "real":
        if not dataset:
            raise HTTPException(
                status_code=400, 
                detail="DATASET NOT SELECTED: A real river basin dataset must be selected before starting simulation."
            )
        if str(model).upper() in ["DEMO", "DEMO_ENGINE", "DEMOENGINE"]:
            raise HTTPException(
                status_code=400,
                detail="INVALID SOLVER: Demo Engine cannot be used in Real Data Mode. Only native SPH or Delft3D engines are supported."
            )

    job_id = SimulationJobManager.create_job(model, scenario, dataset, mode)
    completed_job = SimulationJobManager.run_job_sync(job_id)

    # Attach HADR and Satellite validation automatically to result
    if completed_job.get("result") and completed_job["status"] == "COMPLETED":
        res = completed_job["result"]
        res["impactData"] = HADRAnalyzer.analyze_impact(res, dataset)
        res["validationData"] = SatelliteValidationService.perform_validation(res, dataset, force_demo=(mode != "real"))

    return completed_job

@router.get("/{job_id}")
def get_simulation_job(job_id: str):
    job = SimulationJobManager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Simulation job not found")
    return job

@router.get("/{job_id}/status")
def get_simulation_status(job_id: str):
    job = SimulationJobManager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Simulation job not found")
    return {
        "id": job["id"],
        "status": job["status"],
        "progress": job["progress"],
        "logs": job["logs"],
        "error": job.get("error")
    }

@router.get("/{job_id}/results")
def get_simulation_results(job_id: str):
    job = SimulationJobManager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Simulation job not found")
    if job.get("result"):
        return job["result"]
    raise HTTPException(status_code=400, detail=f"Simulation results not yet ready. Current status: {job['status']}")

@router.post("/models/sph/run")
def run_sph_direct(payload: Dict[str, Any]):
    """Direct SPH model execution endpoint."""
    scenario = payload.get("scenario", {})
    dataset = payload.get("dataset")
    return SPHEngine.run_simulation(scenario, dataset)

@router.post("/models/delft3d/run")
def run_delft3d_direct(payload: Dict[str, Any]):
    """Direct Delft3D model execution endpoint."""
    scenario = payload.get("scenario", {})
    dataset = payload.get("dataset")
    return Delft3DEngine.run_simulation(scenario, dataset)
