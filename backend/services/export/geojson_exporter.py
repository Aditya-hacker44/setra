import json
from typing import Dict, Any

class GeoJSONExporter:
    """Exports standardized GeoJSON FeatureCollection."""

    @classmethod
    def export_flood_geojson(cls, simulation_result: Dict[str, Any], scenario: Dict[str, Any]) -> str:
        dam = scenario.get("dam", {})
        time_steps = simulation_result.get("timeSteps", [])
        last_step = time_steps[-1] if time_steps else None

        features = [
            {
                "type": "Feature",
                "properties": {
                    "feature": "Dam Axis",
                    "name": dam.get("name", "Dam Structure"),
                    "river": dam.get("river", "River"),
                    "heightM": dam.get("height", 0),
                    "reservoirLevelM": scenario.get("reservoirLevel", 0),
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [dam.get("lng", 78.4806), dam.get("lat", 30.3778)]
                }
            }
        ]

        if last_step and "floodExtentGeoJSON" in last_step:
            step_geom = last_step["floodExtentGeoJSON"]
            features.append({
                "type": "Feature",
                "properties": {
                    "feature": "Peak Inundation Extent",
                    "scenario": scenario.get("name", "Scenario"),
                    "timeH": last_step.get("time", 6),
                    "inundationAreaKm2": simulation_result.get("inundationArea", 235),
                    "maxDepthM": simulation_result.get("maxDepth", 8.4),
                    "maxVelocityMs": simulation_result.get("maxVelocity", 6.2),
                    "arrivalTimeHrs": simulation_result.get("arrivalTime", 3.4),
                    "model": simulation_result.get("model", "DEMO ENGINE")
                },
                "geometry": step_geom.get("geometry", {})
            })

        fc = {
            "type": "FeatureCollection",
            "metadata": {
                "platform": "SETRA Hydrodynamic Flood Modelling & Risk Assessment",
                "authority": "National Dam Safety Authority / CWC Reference",
                "model": simulation_result.get("model", "DEMO ENGINE"),
                "status": simulation_result.get("status", "COMPLETED"),
                "scenario": scenario.get("name", "Scenario"),
                "generatedAt": simulation_result.get("timestamp", "")
            },
            "features": features
        }
        return json.dumps(fc, indent=2)
