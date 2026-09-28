import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, Dict, Any
from backend.data.datasets import INDIAN_DATASETS
from backend.services.gis.validation import DataValidationService
from backend.config import settings

router = APIRouter(prefix="/datasets", tags=["Datasets"])

@router.get("")
def list_datasets():
    """Returns list of open-source Indian dam and river datasets."""
    summary_list = []
    for k, v in INDIAN_DATASETS.items():
        summary_list.append({
            "id": v["id"],
            "name": v["name"],
            "location": v["location"],
            "state": v["state"],
            "dam": v["dam"],
            "elevationRange": v["elevationRange"],
            "demResolution": v["demResolution"],
            "coverageArea": v["coverageArea"],
            "riverLength": v["riverLength"],
            "layers": v["layers"],
            "isRealDataDemonstration": v.get("isRealDataDemonstration", True),
            "citation": v.get("citation", "")
        })
    return summary_list

@router.get("/{dataset_id}")
def get_dataset(dataset_id: str):
    """Retrieves full dataset with GIS layers and hydrological telemetry."""
    if dataset_id in INDIAN_DATASETS:
        return INDIAN_DATASETS[dataset_id]
    raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")

@router.post("/validate")
def validate_dataset(dataset: Dict[str, Any]):
    """Runs geospatial and hydrological QA/QC quality panel check."""
    report = DataValidationService.validate_full_dataset(dataset)
    return report

@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    datasetName: str = Form(...),
    damName: str = Form(...),
    riverName: str = Form(...)
):
    """Handles upload of user-provided DEM, Shapefile, or GeoJSON datasets."""
    filename = file.filename or "uploaded_dataset"
    file_path = os.path.join(settings.UPLOADS_DIR, filename)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    new_id = f"DATASET-USER-{len(INDIAN_DATASETS) + 1}"
    record = {
        "id": new_id,
        "name": datasetName,
        "location": "Custom Uploaded Basin",
        "state": "User Specified",
        "dam": {
            "name": damName,
            "river": riverName,
            "basin": f"{riverName} Basin",
            "height": 100.0,
            "reservoirLevel": 350.0,
            "maxReservoirLevel": 355.0,
            "reservoirVolume": 1200.0,
            "lat": 25.0,
            "lng": 80.0
        },
        "elevationRange": "User DEM Elevation",
        "demResolution": "Custom Ingested Raster",
        "coverageArea": "Computed Extent",
        "riverLength": "Custom Reach",
        "layers": {
            "dem": True,
            "riverNetwork": True,
            "damData": True,
            "hydrologicalData": True,
            "population": False,
            "buildings": False,
            "roads": False,
            "bridges": False,
            "criticalInfrastructure": False,
            "satelliteData": False
        },
        "isRealDataDemonstration": True,
        "filePath": file_path
    }
    INDIAN_DATASETS[new_id] = record
    return {
        "success": True,
        "datasetId": new_id,
        "filename": filename,
        "dataset": record
    }
