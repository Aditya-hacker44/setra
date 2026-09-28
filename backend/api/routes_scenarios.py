from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from backend.services.scenarios.scenario_engine import ScenarioEngine

router = APIRouter(prefix="/scenarios", tags=["Scenarios"])

@router.get("")
def list_scenarios():
    return ScenarioEngine.list_scenarios()

@router.get("/{scenario_id}")
def get_scenario(scenario_id: str):
    sc = ScenarioEngine.get_scenario(scenario_id)
    if sc:
        return sc
    raise HTTPException(status_code=404, detail="Scenario not found")

@router.post("")
def create_scenario(payload: Dict[str, Any]):
    return ScenarioEngine.create_scenario(payload)
