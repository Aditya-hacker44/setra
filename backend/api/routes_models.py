from fastapi import APIRouter
from backend.services.models.manager import ModelManager
from backend.services.validation.satellite_service import SatelliteValidationService

router = APIRouter(prefix="/models", tags=["Modelling Engines"])

@router.get("/status")
def get_all_engine_statuses():
    """Returns real diagnostic and connectivity statuses for all 5 computational engines."""
    statuses = ModelManager.get_engine_statuses()
    statuses["gee"] = SatelliteValidationService.check_gee_status()
    return statuses
