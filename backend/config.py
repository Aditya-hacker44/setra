import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))

class Settings:
    APP_NAME: str = "SETRA Hydrodynamic Flood Modelling API"
    VERSION: str = "3.0.0"
    API_PREFIX: str = "/api"
    
    # Engine Executable Paths
    SPH_ENGINE_PATH: str = os.getenv("SPH_ENGINE_PATH", "")
    DELFT3D_PATH: str = os.getenv("DELFT3D_PATH", "")
    
    # Google Earth Engine Credentials
    GEE_PROJECT_ID: str = os.getenv("GEE_PROJECT_ID", "")
    GEE_SERVICE_ACCOUNT: str = os.getenv("GEE_SERVICE_ACCOUNT", "")
    GEE_PRIVATE_KEY_PATH: str = os.getenv("GEE_PRIVATE_KEY_PATH", "")
    
    # Data Storage Root
    BASE_DIR: str = os.path.dirname(os.path.abspath(__file__))
    DATA_ROOT: str = os.getenv("DATA_ROOT", os.path.join(BASE_DIR, "data"))
    EXPORTS_DIR: str = os.path.join(BASE_DIR, "exports")
    UPLOADS_DIR: str = os.path.join(BASE_DIR, "uploads")

settings = Settings()

# Ensure directories exist
os.makedirs(settings.EXPORTS_DIR, exist_ok=True)
os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
