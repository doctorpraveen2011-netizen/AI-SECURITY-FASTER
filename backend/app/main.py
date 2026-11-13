import app.core.compat
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.core.seed import seed_database

# Routers
from app.api.dashboard import router as dashboard_router
from app.api.auth import router as auth_router
from app.api.models import router as models_router
from app.api.agent import router as agent_router
from app.api.tests import router as tests_router
from app.api.risks import router as risks_router
from app.api.mitigations import router as mitigations_router
from app.api.mcp import router as mcp_router
from app.api.wazuh import router as wazuh_router
from app.api.reports import router as reports_router
from app.api.audit import router as audit_router

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise-Grade Automated AI Red Teaming & Blue Teaming Platform",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(dashboard_router)
app.include_router(auth_router)
app.include_router(models_router)
app.include_router(agent_router)
app.include_router(tests_router)
app.include_router(risks_router)
app.include_router(mitigations_router)
app.include_router(mcp_router)
app.include_router(wazuh_router)
app.include_router(reports_router)
app.include_router(audit_router)

@app.get("/api/health")
@app.get("/health")
@app.get("/")
def healthcheck():
    return {
        "status": "HEALTHY",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

# Live WebSocket Hub
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast({"type": "EVENT", "data": data})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
