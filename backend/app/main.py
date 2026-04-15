from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.models import engine, Base
from app.api import auth, targets, scans, vulnerabilities

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="Autonomous AI Red Team Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Welcome to the Autonomous Red Team Platform API",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["Authentication"])
app.include_router(targets.router, prefix=f"{settings.API_V1_PREFIX}/targets", tags=["Targets"])
app.include_router(scans.router, prefix=f"{settings.API_V1_PREFIX}/scans", tags=["Scans"])
app.include_router(vulnerabilities.router, prefix=f"{settings.API_V1_PREFIX}/vulnerabilities", tags=["Vulnerabilities"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
