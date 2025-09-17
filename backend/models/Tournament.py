from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class TournamentStatus(str, Enum):
    REGISTRATION = "registration"
    ACTIVE = "active" 
    COMPLETED = "completed"

class TournamentBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    game: str = Field(..., min_length=1)
    description: str = Field(..., min_length=10)
    rules: str = ""
    maxParticipants: int = Field(..., ge=2, le=128)
    prize: str = ""
    startDate: datetime
    endDate: datetime
    registrationDeadline: datetime
    judges: List[str] = []

class TournamentCreate(TournamentBase):
    pass

class TournamentResponse(TournamentBase):
    id: str = Field(alias="_id")
    organizer: str  # user ID
    organizerName: str
    participants: List[str] = []  # user IDs
    status: TournamentStatus = TournamentStatus.REGISTRATION
    createdAt: datetime
    updatedAt: datetime

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class TournamentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    rules: Optional[str] = None
    status: Optional[TournamentStatus] = None

class TournamentJoinResponse(BaseModel):
    message: str
    tournament: TournamentResponse