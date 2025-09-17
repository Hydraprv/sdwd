from fastapi import APIRouter, HTTPException, status, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.Tournament import (
    TournamentCreate, 
    TournamentResponse, 
    TournamentStatus,
    TournamentJoinResponse
)
from auth import get_current_user
from bson import ObjectId
from datetime import datetime
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

def create_tournaments_router(db: AsyncIOMotorDatabase) -> APIRouter:
    router = APIRouter(prefix="/tournaments", tags=["tournaments"])

    @router.get("/", response_model=dict)
    async def get_tournaments(
        game: Optional[str] = Query(None),
        status: Optional[str] = Query(None),
        search: Optional[str] = Query(None)
    ):
        """Get all tournaments with optional filtering"""
        try:
            # Build query
            query = {}
            
            if game and game != "all":
                query["game"] = game
                
            if status and status != "all":
                query["status"] = status
                
            if search:
                query["$or"] = [
                    {"name": {"$regex": search, "$options": "i"}},
                    {"game": {"$regex": search, "$options": "i"}},
                    {"organizerName": {"$regex": search, "$options": "i"}}
                ]
            
            # Get tournaments
            cursor = db.tournaments.find(query).sort("createdAt", -1)
            tournaments = await cursor.to_list(100)
            
            # Convert ObjectIds and format response
            formatted_tournaments = []
            for tournament in tournaments:
                tournament["_id"] = str(tournament["_id"])
                tournament["organizer"] = str(tournament["organizer"])
                
                # Convert participant ObjectIds to strings
                tournament["participants"] = [str(p) for p in tournament.get("participants", [])]
                
                formatted_tournaments.append(tournament)
            
            return {"tournaments": formatted_tournaments}
            
        except Exception as e:
            logger.error(f"Error fetching tournaments: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error fetching tournaments"
            )

    @router.post("/", response_model=dict)
    async def create_tournament(
        tournament_data: TournamentCreate,
        current_user: dict = Depends(get_current_user)
    ):
        """Create a new tournament"""
        try:
            # Validate dates
            if tournament_data.registrationDeadline >= tournament_data.startDate:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Registration deadline must be before tournament start date"
                )
                
            if tournament_data.endDate <= tournament_data.startDate:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="End date must be after start date"
                )
            
            # Create tournament document
            tournament_doc = {
                "_id": ObjectId(),
                "name": tournament_data.name,
                "game": tournament_data.game,
                "description": tournament_data.description,
                "rules": tournament_data.rules,
                "organizer": ObjectId(current_user["_id"]),
                "organizerName": current_user["username"],
                "participants": [],
                "maxParticipants": tournament_data.maxParticipants,
                "status": TournamentStatus.REGISTRATION,
                "startDate": tournament_data.startDate,
                "endDate": tournament_data.endDate,
                "registrationDeadline": tournament_data.registrationDeadline,
                "prize": tournament_data.prize,
                "judges": tournament_data.judges,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
            
            # Insert tournament
            result = await db.tournaments.insert_one(tournament_doc)
            
            # Prepare response
            tournament_doc["_id"] = str(result.inserted_id)
            tournament_doc["organizer"] = str(tournament_doc["organizer"])
            
            return {"tournament": tournament_doc}
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating tournament: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error creating tournament"
            )

    @router.get("/{tournament_id}", response_model=dict)
    async def get_tournament(tournament_id: str):
        """Get tournament by ID"""
        try:
            if not ObjectId.is_valid(tournament_id):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid tournament ID"
                )
            
            tournament = await db.tournaments.find_one({"_id": ObjectId(tournament_id)})
            
            if not tournament:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Tournament not found"
                )
            
            # Format response
            tournament["_id"] = str(tournament["_id"])
            tournament["organizer"] = str(tournament["organizer"])
            tournament["participants"] = [str(p) for p in tournament.get("participants", [])]
            
            return {"tournament": tournament}
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching tournament: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error fetching tournament"
            )

    @router.post("/{tournament_id}/join", response_model=TournamentJoinResponse)
    async def join_tournament(
        tournament_id: str,
        current_user: dict = Depends(get_current_user)
    ):
        """Join a tournament"""
        try:
            if not ObjectId.is_valid(tournament_id):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid tournament ID"
                )
            
            tournament = await db.tournaments.find_one({"_id": ObjectId(tournament_id)})
            
            if not tournament:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Tournament not found"
                )
            
            # Check if tournament is open for registration
            if tournament["status"] != TournamentStatus.REGISTRATION:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Tournament is not open for registration"
                )
            
            user_id = ObjectId(current_user["_id"])
            
            # Check if user is already registered
            if user_id in tournament.get("participants", []):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="You are already registered for this tournament"
                )
            
            # Check if tournament is full
            if len(tournament.get("participants", [])) >= tournament["maxParticipants"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Tournament is full"
                )
            
            # Add user to participants
            await db.tournaments.update_one(
                {"_id": ObjectId(tournament_id)},
                {
                    "$push": {"participants": user_id},
                    "$set": {"updatedAt": datetime.utcnow()}
                }
            )
            
            # Get updated tournament
            updated_tournament = await db.tournaments.find_one({"_id": ObjectId(tournament_id)})
            
            # Format response
            updated_tournament["_id"] = str(updated_tournament["_id"])
            updated_tournament["organizer"] = str(updated_tournament["organizer"])
            updated_tournament["participants"] = [str(p) for p in updated_tournament.get("participants", [])]
            
            return TournamentJoinResponse(
                message="Successfully joined tournament!",
                tournament=updated_tournament
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error joining tournament: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error joining tournament"
            )

    return router