from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
import uvicorn

from app.database import create_db_and_tables
from app.models import Bid
from app.api import bidding_router, clearing_router, pnl_router, market_data_router

app = FastAPI(
    title="Virtual Energy Trading Platform API",
    description="API for the Virtual Energy Trading Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    create_db_and_tables()

# Include API routers
app.include_router(bidding_router)
app.include_router(clearing_router)
app.include_router(pnl_router)
app.include_router(market_data_router)

@app.get("/")
async def root():
    return {"message": "Virtual Energy Trading Platform API"}

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "Virtual Energy Trading Platform API"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
