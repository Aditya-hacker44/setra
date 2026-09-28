from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.api.routes_datasets import router as datasets_router
from backend.api.routes_scenarios import router as scenarios_router
from backend.api.routes_simulations import router as simulations_router
from backend.api.routes_comparison import router as comparison_router
from backend.api.routes_validation import router as validation_router
from backend.api.routes_export import router as export_router
from backend.api.routes_models import router as models_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Smart India Hackathon 2026 (Problem Statement 26161) Level-3 Hydrodynamic Simulation Platform"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(datasets_router, prefix=settings.API_PREFIX)
app.include_router(scenarios_router, prefix=settings.API_PREFIX)
app.include_router(simulations_router, prefix=settings.API_PREFIX)
app.include_router(comparison_router, prefix=settings.API_PREFIX)
app.include_router(validation_router, prefix=settings.API_PREFIX)
app.include_router(export_router, prefix=settings.API_PREFIX)
app.include_router(models_router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "platform": settings.APP_NAME,
        "version": settings.VERSION,
        "problemStatement": "26161 – Dam Break Inundation Modelling Using Hydrodynamic Modelling of any River",
        "authority": "National Dam Safety Authority / Central Water Commission",
        "docs": "/docs",
        "status": "OPERATIONAL"
    }

@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "gisEngine": "OPERATIONAL",
        "fastApi": "ACTIVE"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
