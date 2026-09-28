import uuid
import time
from typing import Dict, Any, List, Optional

class ScenarioEngine:
    """Manages hydrodynamic scenarios: Dam Break, Natural Lake / River Blockage, Normal/High Release, Water Surge."""

    _scenarios: Dict[str, Dict[str, Any]] = {}

    @classmethod
    def create_scenario(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        scenario_id = data.get("id") or f"SCENARIO-{uuid.uuid4().hex[:6].upper()}"
        sc_type = data.get("type", "dam-break")

        # Determine parameter provenance labels
        dam_obj = data.get("dam", {})
        dam_name = dam_obj.get("name", "Dam Structure")
        
        scenario_record = {
            "id": scenario_id,
            "name": data.get("name", f"{dam_name} – {sc_type.replace('-', ' ').title()}"),
            "datasetId": data.get("datasetId") or dam_obj.get("datasetId") or "CUSTOM-SCENARIO",
            "dam": dam_obj,
            "failureType": data.get("failureType", "instantaneous"),
            "failureTrigger": data.get("failureTrigger", "Extreme Inflow / PMF Exceedance"),
            "failureTriggerProvenance": "SCENARIO ASSUMPTION",
            "reservoirLevel": float(data.get("reservoirLevel", dam_obj.get("reservoirLevel", 830))),
            "reservoirLevelProvenance": "DATASET VALUE" if data.get("reservoirLevel") is None else "USER SUPPLIED",
            "breachWidth": float(data.get("breachWidth", 100)),
            "breachWidthProvenance": "SCENARIO ASSUMPTION",
            "breachFormationTime": float(data.get("breachFormationTime", 0.5)),
            "breachFormationTimeProvenance": "SCENARIO ASSUMPTION",
            "simulationDuration": float(data.get("simulationDuration", 6)),
            "manningCoefficient": float(data.get("manningCoefficient", 0.035)),
            "gridResolution": int(data.get("gridResolution", 30)),
            "timestep": int(data.get("timestep", 10)),
            
            # Natural Lake / River Blockage Parameters
            "naturalLake": {
                "lakeAreaKm2": data.get("lakeAreaKm2", 14.5),
                "estimatedStorageMCM": data.get("estimatedStorageMCM", 185.0),
                "breachLocation": data.get("breachLocation", "Rishikesh Valley Narrows"),
                "releaseCondition": data.get("releaseCondition", "Erosive Overtopping Breach"),
                "provenance": "SCENARIO ASSUMPTION"
            } if sc_type == "river-blockage" else None,

            # Normal / High Water Release Parameters
            "controlledRelease": {
                "gateCount": data.get("gateCount", 4),
                "dischargeCusecs": data.get("dischargeCusecs", 15000),
                "downstreamChannelCapacity": data.get("downstreamChannelCapacity", 12000),
                "isSpillwayOvertopping": sc_type == "high-release"
            } if sc_type in ["normal-release", "high-release"] else None,

            "status": "ready",
            "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }

        cls._scenarios[scenario_id] = scenario_record
        return scenario_record

    @classmethod
    def get_scenario(cls, scenario_id: str) -> Optional[Dict[str, Any]]:
        return cls._scenarios.get(scenario_id)

    @classmethod
    def list_scenarios(cls) -> List[Dict[str, Any]]:
        return list(cls._scenarios.values())
