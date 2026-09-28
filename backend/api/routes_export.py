from fastapi import APIRouter, Response, HTTPException
from backend.services.simulation.job_manager import SimulationJobManager
from backend.services.export.shp_exporter import SHPExporter
from backend.services.export.kml_exporter import KMLExporter
from backend.services.export.geojson_exporter import GeoJSONExporter
from backend.services.export.csv_exporter import CSVExporter
from backend.services.models.demo.demo_engine import DemoEngine
from backend.data.datasets import INDIAN_DATASETS

router = APIRouter(prefix="/export", tags=["Export"])

def _resolve_sim_and_scenario(simulation_id: str):
    job = SimulationJobManager.get_job(simulation_id)
    if job and job.get("result"):
        return job["result"], job["scenario"]
    
    # Fallback to default Tehri instantaneous simulation if direct export requested
    tehri = INDIAN_DATASETS["DATASET-IN-TEHRI"]
    sc = {
        "id": "SCENARIO-UK-001",
        "name": "Tehri Dam – Instantaneous Failure",
        "type": "dam-break",
        "dam": tehri["dam"],
        "reservoirLevel": 830,
        "breachWidth": 100,
        "breachFormationTime": 0.5,
        "simulationDuration": 6
    }
    res = DemoEngine.run_simulation(sc, tehri)
    return res, sc

@router.get("/{simulation_id}/shp")
def export_shp(simulation_id: str):
    """Generates and downloads a real zipped ESRI Shapefile (.shp, .shx, .dbf, .prj)."""
    res, sc = _resolve_sim_and_scenario(simulation_id)
    zip_bytes = SHPExporter.export_flood_shapefile(res, sc)

    filename = f"SETRA_{sc.get('id', 'SIM')}_Flood_Extent_SHP.zip"
    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("/{simulation_id}/kml")
def export_kml(simulation_id: str):
    """Generates and downloads standard OGC KML 2.2 for Google Earth."""
    res, sc = _resolve_sim_and_scenario(simulation_id)
    kml_str = KMLExporter.export_flood_kml(res, sc)

    filename = f"SETRA_{sc.get('id', 'SIM')}_Flood_Extent.kml"
    return Response(
        content=kml_str,
        media_type="application/vnd.google-earth.kml+xml",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("/{simulation_id}/geojson")
def export_geojson(simulation_id: str):
    """Generates and downloads GeoJSON FeatureCollection."""
    res, sc = _resolve_sim_and_scenario(simulation_id)
    geojson_str = GeoJSONExporter.export_flood_geojson(res, sc)

    filename = f"SETRA_{sc.get('id', 'SIM')}_Flood_Extent.geojson"
    return Response(
        content=geojson_str,
        media_type="application/geo+json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("/{simulation_id}/csv")
def export_csv(simulation_id: str):
    """Generates and downloads CSV tabular summary."""
    res, sc = _resolve_sim_and_scenario(simulation_id)
    csv_str = CSVExporter.export_summary_csv(res, sc)

    filename = f"SETRA_{sc.get('id', 'SIM')}_Flood_Summary.csv"
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
