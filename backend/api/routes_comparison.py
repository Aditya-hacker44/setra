from fastapi import APIRouter
from typing import Dict, Any, List

router = APIRouter(prefix="/comparison", tags=["Comparison"])

@router.post("")
def compare_scenarios(payload: Dict[str, Any]):
    """Compares metrics between multiple scenarios or models without fabricating data."""
    scenarios = payload.get("scenarios", [])
    models = payload.get("models", [])

    metrics = [
        {"metric": "Inundation Area (km²)", "unit": "km²"},
        {"metric": "Maximum Water Depth", "unit": "m"},
        {"metric": "Maximum Flow Velocity", "unit": "m/s"},
        {"metric": "Peak Discharge Outflow", "unit": "m³/s"},
        {"metric": "Flood Arrival Time", "unit": "hrs"},
        {"metric": "Population Exposed", "unit": "persons"},
        {"metric": "Building Structures Exposed", "unit": "units"},
        {"metric": "Roads Inundated", "unit": "km"},
        {"metric": "Bridges at Risk", "unit": "bridges"},
        {"metric": "Critical Infrastructure", "unit": "facilities"}
    ]

    comparison_table = []
    for m in metrics:
        name = m["metric"]
        row: Dict[str, Any] = {"metric": f"{name} ({m['unit']})"}
        for idx, sc in enumerate(scenarios):
            res = sc.get("result", {}) or {}
            key = f"scenario{chr(65 + idx)}"
            if name == "Inundation Area (km²)":
                row[key] = res.get("inundationArea", "N/A")
            elif name == "Maximum Water Depth":
                row[key] = res.get("maxDepth", "N/A")
            elif name == "Maximum Flow Velocity":
                row[key] = res.get("maxVelocity", "N/A")
            elif name == "Peak Discharge Outflow":
                row[key] = res.get("peakDischarge", "N/A")
            elif name == "Flood Arrival Time":
                row[key] = res.get("arrivalTime", "N/A")
            elif name == "Population Exposed":
                row[key] = res.get("populationAffected", "N/A")
            elif name == "Building Structures Exposed":
                row[key] = res.get("buildingsAffected", "N/A")
            elif name == "Roads Inundated":
                row[key] = res.get("roadsAffected", "N/A")
            elif name == "Bridges at Risk":
                row[key] = res.get("bridgesAffected", "N/A")
            elif name == "Critical Infrastructure":
                row[key] = res.get("criticalInfrastructureAffected", "N/A")
        comparison_table.append(row)

    return {
        "metrics": comparison_table,
        "scenariosCount": len(scenarios),
        "scientificNotice": "All comparison metrics are extracted directly from computed simulation results."
    }
