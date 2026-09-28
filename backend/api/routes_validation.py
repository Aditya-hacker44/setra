from fastapi import APIRouter
from typing import Dict, Any
from backend.services.validation.satellite_service import SatelliteValidationService

router = APIRouter(prefix="/validation", tags=["Validation"])

@router.post("/satellite")
def validate_with_satellite(payload: Dict[str, Any]):
    """Performs satellite cross-validation against GEE Sentinel-1 SAR or calibrated baseline."""
    sim_result = payload.get("simulationResult", {})
    dataset = payload.get("dataset")
    force_demo = payload.get("forceDemo", False)

    return SatelliteValidationService.perform_validation(sim_result, dataset, force_demo)

@router.get("/status")
def get_gee_status():
    """Returns Google Earth Engine connection status."""
    return SatelliteValidationService.check_gee_status()
