from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

# Import route modules
from routes.auth import create_auth_router
from routes.tournaments import create_tournaments_router
from routes.users import create_users_router
from routes.stats import create_stats_router

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="TourneyHub API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "TourneyHub API is running"}

# Include all route modules
api_router.include_router(create_auth_router(db))
api_router.include_router(create_tournaments_router(db))
api_router.include_router(create_users_router(db))
api_router.include_router(create_stats_router(db))

# Include the main API router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Create database indexes on startup"""
    try:
        # Create indexes for better performance
        await db.users.create_index("email", unique=True)
        await db.users.create_index("username", unique=True)
        await db.tournaments.create_index("status")
        await db.tournaments.create_index("game")
        await db.tournaments.create_index("organizer")
        await db.tournaments.create_index("createdAt")
        
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.warning(f"Error creating indexes: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close database connection on shutdown"""
    client.close()
    logger.info("Database connection closed")