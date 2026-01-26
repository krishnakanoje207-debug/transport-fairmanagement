from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
from app.config.settings import settings
from app.config.database import Database
from app.routes import auth, user, trip, location, qr, weather, peak_hour

# Configure logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown"""
    # Startup
    logger.info("Starting up application...")
    await Database.connect_db()
    logger.info("Database connected successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")
    await Database.close_db()
    logger.info("Database connection closed")

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Transport Route and Fare Management System API",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Global exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error": str(exc) if settings.DEBUG else "An error occurred"
        }
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    db_status = await Database.ping()
    return {
        "status": "healthy" if db_status else "unhealthy",
        "database": "connected" if db_status else "disconnected",
        "version": settings.APP_VERSION
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Transport Route Management System API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health"
    }

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(user.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(trip.router, prefix="/api/v1/trips", tags=["Trips"])
app.include_router(location.router, prefix="/api/v1/locations", tags=["Locations"])
app.include_router(qr.router, prefix="/api/v1/qr", tags=["QR Codes"])
app.include_router(weather.router, prefix="/api/v1/weather", tags=["Weather"])
app.include_router(peak_hour.router, prefix="/api/v1/peak-hours", tags=["Peak Hours"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )