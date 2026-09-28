import csv
import io
from typing import Dict, Any, Optional

class CSVExporter:
    """Exports scenario parameters, hydrodynamic time-series, and HADR exposure to CSV."""

    @classmethod
    def export_summary_csv(
        cls,
        simulation_result: Dict[str, Any],
        scenario: Dict[str, Any],
        validation: Optional[Dict[str, Any]] = None
    ) -> str:
        output = io.StringIO()
        writer = csv.writer(output)

        dam = scenario.get("dam", {})
        writer.writerow(["SETRA HYDRODYNAMIC FLOOD MODELLING & RISK ASSESSMENT", "", ""])
        writer.writerow(["NATIONAL DAM SAFETY AUTHORITY / CWC GUIDELINES", "", ""])
        writer.writerow(["Generated Timestamp", simulation_result.get("timestamp", ""), ""])
        writer.writerow([])

        writer.writerow(["SCENARIO CONFIGURATION", "", ""])
        writer.writerow(["Scenario ID", scenario.get("id", ""), ""])
        writer.writerow(["Scenario Name", scenario.get("name", ""), ""])
        writer.writerow(["Dam Structure", dam.get("name", ""), ""])
        writer.writerow(["River Basin", f"{dam.get('river', '')} ({dam.get('basin', '')})", ""])
        writer.writerow(["Failure Mode", scenario.get("failureType", "Instantaneous"), ""])
        writer.writerow(["Reservoir Level", f"{scenario.get('reservoirLevel', '')} m MSL", ""])
        writer.writerow(["Breach Width", f"{scenario.get('breachWidth', '')} m", ""])
        writer.writerow(["Breach Formation Time", f"{scenario.get('breachFormationTime', '')} hrs", ""])
        writer.writerow(["Simulation Duration", f"{scenario.get('simulationDuration', '')} hrs", ""])
        writer.writerow(["Manning Roughness (n)", f"{scenario.get('manningCoefficient', 0.035)}", ""])
        writer.writerow([])

        writer.writerow(["HYDRODYNAMIC METRICS", "", ""])
        writer.writerow(["Model Engine", simulation_result.get("model", "DEMO ENGINE"), ""])
        writer.writerow(["Peak Inundation Area", simulation_result.get("inundationArea", 235), "km²"])
        writer.writerow(["Max Flood Depth", simulation_result.get("maxDepth", 8.4), "m"])
        writer.writerow(["Max Flow Velocity", simulation_result.get("maxVelocity", 6.2), "m/s"])
        writer.writerow(["Earliest Arrival Time", simulation_result.get("arrivalTime", 3.4), "hrs"])
        writer.writerow(["Peak Breach Outflow", simulation_result.get("peakDischarge", 18500), "m³/s"])
        writer.writerow([])

        writer.writerow(["HADR IMPACT ASSESSMENT", "", ""])
        writer.writerow(["Total Population Exposed", simulation_result.get("populationAffected", 210000), "persons"])
        writer.writerow(["Building Structures Affected", simulation_result.get("buildingsAffected", 12450), "units"])
        writer.writerow(["Highway & Road Inundation", simulation_result.get("roadsAffected", 87), "km"])
        writer.writerow(["Bridges at Risk", simulation_result.get("bridgesAffected", 14), "structures"])
        writer.writerow(["Critical Facilities Exposed", simulation_result.get("criticalInfrastructureAffected", 7), "facilities"])
        writer.writerow([])

        if validation:
            writer.writerow(["SATELLITE CROSS-VALIDATION (SENTINEL-1 SAR)", "", ""])
            writer.writerow(["Predicted Model Extent", validation.get("predictedArea", 235), "km²"])
            writer.writerow(["Observed Satellite Extent", validation.get("observedArea", 221), "km²"])
            writer.writerow(["Spatial Overlap", validation.get("overlap", 198), "km²"])
            writer.writerow(["Agreement Index", f"{validation.get('agreement', 84)}%", ""])
            writer.writerow(["Critical Success Index (CSI / IoU)", validation.get("csi", 0.76), "-"])
            writer.writerow([])

        writer.writerow(["DISCLAIMER", "PROTOTYPE DEMONSTRATION DATA", "SIH 2026 EVALUATION"])

        return output.getvalue()
