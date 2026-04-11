"""
SafeRoute - Main Application
FastAPI backend with all routes, CORS, WebSocket
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .config.database import Database
from .config.settings import settings
from .routes import auth, user, trip, location, qr, weather, peak_hour, admin, partner, messaging, places
import json


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("=" * 60)
    print("🚀 Starting SafeRoute Backend v2.0 on PORT 8001")
    print("=" * 60)
    await Database.connect_db()
    print(f"✅ Backend ready: http://localhost:8001")
    print(f"✅ API Docs: http://localhost:8001/docs")
    print(f"✅ CORS origins: {settings.cors_origins}")
    yield
    await Database.close_db()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "port": 8001,
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    try:
        db = Database.get_database()
        await db.command("ping")
        db_status = "connected"
    except Exception:
        db_status = "error"
    return {
        "status": "healthy" if db_status == "connected" else "unhealthy",
        "database": db_status,
        "version": settings.APP_VERSION,
    }


# ─── Include all routers ───
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(user.router, prefix="/api/v1/user", tags=["User"])
app.include_router(trip.router, prefix="/api/v1/trip", tags=["Trip"])
app.include_router(location.router, prefix="/api/v1/location", tags=["Location"])
app.include_router(qr.router, prefix="/api/v1/qr", tags=["QR Code"])
app.include_router(weather.router, prefix="/api/v1/weather", tags=["Weather"])
app.include_router(peak_hour.router, prefix="/api/v1/peak-hour", tags=["Peak Hour"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(partner.router, prefix="/api/v1/partner", tags=["Travel Partner"])
app.include_router(messaging.router, prefix="/api/v1/messaging", tags=["Messaging"])
app.include_router(places.router, prefix="/api/v1/places", tags=["Places"])


# ─── WebSocket for real-time tracking ───
class ConnectionManager:
    def __init__(self):
        self.active: dict = {}  # trip_id -> [websocket, ...]

    async def connect(self, ws: WebSocket, trip_id: str):
        await ws.accept()
        if trip_id not in self.active:
            self.active[trip_id] = []
        self.active[trip_id].append(ws)

    def disconnect(self, ws: WebSocket, trip_id: str):
        if trip_id in self.active:
            self.active[trip_id] = [w for w in self.active[trip_id] if w != ws]

    async def broadcast(self, trip_id: str, data: dict):
        if trip_id in self.active:
            dead = []
            for ws in self.active[trip_id]:
                try:
                    await ws.send_json(data)
                except Exception:
                    dead.append(ws)
            for ws in dead:
                self.active[trip_id].remove(ws)


ws_manager = ConnectionManager()


@app.websocket("/ws/trip/{trip_id}")
async def ws_trip(websocket: WebSocket, trip_id: str):
    await ws_manager.connect(websocket, trip_id)
    try:
        while True:
            data = await websocket.receive_text()
            parsed = json.loads(data)
            # Broadcast location update to all watchers
            await ws_manager.broadcast(trip_id, parsed)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, trip_id)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
