from fastapi import APIRouter, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

logger = logging.getLogger(__name__)

def create_stats_router(db: AsyncIOMotorDatabase) -> APIRouter:
    router = APIRouter(prefix="/stats", tags=["statistics"])

    @router.get("/")
    async def get_platform_stats():
        """Get platform-wide statistics"""
        try:
            # Get total tournaments
            total_tournaments = await db.tournaments.count_documents({})
            
            # Get active tournaments (registration + active status)
            active_tournaments = await db.tournaments.count_documents({
                "status": {"$in": ["registration", "active"]}
            })
            
            # Get total users
            total_players = await db.users.count_documents({})
            
            # Calculate total prize pool (sum all non-empty prizes)
            # This is a simplified calculation - in a real app you'd want structured prize data
            tournaments_with_prizes = await db.tournaments.find({
                "prize": {"$ne": "", "$exists": True}
            }).to_list(1000)
            
            # Mock prize calculation (extract numbers from prize strings)
            total_prize_value = 0
            for tournament in tournaments_with_prizes:
                prize_str = tournament.get("prize", "")
                # Simple extraction: find dollar amounts
                import re
                amounts = re.findall(r'\$([0-9,]+)', prize_str)
                for amount in amounts:
                    try:
                        total_prize_value += int(amount.replace(',', ''))
                    except ValueError:
                        pass
            
            # Format prize pool
            if total_prize_value >= 1000:
                total_prize_pool = f"${total_prize_value:,}"
            else:
                total_prize_pool = f"${total_prize_value}"
            
            return {
                "totalTournaments": total_tournaments,
                "activeTournaments": active_tournaments,
                "totalPlayers": total_players,
                "totalPrizePool": total_prize_pool
            }
            
        except Exception as e:
            logger.error(f"Error fetching platform stats: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error fetching platform statistics"
            )

    return router