from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.User import UserProfile
from auth import get_current_user
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

def create_users_router(db: AsyncIOMotorDatabase) -> APIRouter:
    router = APIRouter(prefix="/users", tags=["users"])

    @router.get("/profile", response_model=dict)
    async def get_user_profile(current_user: dict = Depends(get_current_user)):
        """Get user profile with statistics and tournaments"""
        try:
            user_id = ObjectId(current_user["_id"])
            
            # Get user's tournaments
            user_tournaments = await db.tournaments.find({"organizer": user_id}).to_list(100)
            
            # Format tournaments
            formatted_tournaments = []
            for tournament in user_tournaments:
                tournament["_id"] = str(tournament["_id"])
                tournament["organizer"] = str(tournament["organizer"])
                tournament["participants"] = [str(p) for p in tournament.get("participants", [])]
                formatted_tournaments.append(tournament)
            
            # Calculate user statistics
            tournaments_created = len(user_tournaments)
            tournaments_participated = await db.tournaments.count_documents({
                "participants": user_id
            })
            
            # Mock tournaments won for now (would need match results system)  
            tournaments_won = min(3, tournaments_participated // 4)  # Mock: ~25% win rate
            
            stats = {
                "tournamentsCreated": tournaments_created,
                "tournamentsParticipated": tournaments_participated,
                "tournamentsWon": tournaments_won
            }
            
            return {
                "user": {
                    "id": current_user["_id"],
                    "username": current_user["username"],
                    "email": current_user["email"],
                    "avatar": current_user["avatar"],
                    "createdAt": current_user["createdAt"]
                },
                "stats": stats,
                "tournaments": formatted_tournaments
            }
            
        except Exception as e:
            logger.error(f"Error fetching user profile: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error fetching user profile"
            )

    return router