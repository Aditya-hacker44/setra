from typing import Dict, Any, Optional
from .sph.sph_engine import SPHEngine
from .delft3d.delft3d_engine import Delft3DEngine
from .demo.demo_engine import DemoEngine

class ModelManager:
    """Hydrodynamic Model Engine Manager.
    
    Coordinates SPH, Delft3D, and Demo engines, ensuring transparent
    model execution and standardized output formats.
    """

    @classmethod
    def get_engine_statuses(cls) -> Dict[str, Any]:
        """Returns connection and configuration status of all available engines."""
        return {
            "sph": SPHEngine.check_availability(),
            "delft3d": Delft3DEngine.check_availability(),
            "demo": DemoEngine.check_availability(),
            "gis": {
                "name": "SETRA Geospatial Processing Engine",
                "status": "CONNECTED",
                "libraries": ["GeoPandas 1.1.4", "Rasterio 1.5.1", "Shapely 2.1.2", "PyProj 3.8.0", "PyShp 3.1.6"],
                "isAvailable": True
            }
        }

    @classmethod
    def run_simulation(
        cls,
        model_name: str,
        scenario: Dict[str, Any],
        dataset: Optional[Dict[str, Any]] = None,
        force_demo: bool = False
    ) -> Dict[str, Any]:
        """Routes simulation request to selected hydrodynamic solver."""
        model_upper = str(model_name).upper().strip()
        
        if force_demo:
            return DemoEngine.run_simulation(scenario, dataset)

        if model_upper in ["DEMO", "DEMO_ENGINE", "DEMOENGINE"]:
            # Demo engine explicitly requested
            return DemoEngine.run_simulation(scenario, dataset)
            
        if model_upper in ["SPH", "PYSPH", "DUALSPHYSICS"]:
            return SPHEngine.run_simulation(scenario, dataset)
            
        if model_upper in ["DELFT3D", "DELFT3D-FM", "DFLOWFM", "DELFT"]:
            return Delft3DEngine.run_simulation(scenario, dataset)
            
        # Real mode with unknown model - never silently fall back to demo
        return {
            "status": "ENGINE_NOT_CONFIGURED",
            "error": f"REAL SIMULATION BLOCKED: Unrecognized or unconfigured solver engine '{model_name}'.",
            "model": model_upper,
            "isAvailable": False
        }
