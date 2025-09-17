from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.User import UserCreate, UserLogin, UserResponse, TokenResponse
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from bson import ObjectId
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

def create_auth_router(db: AsyncIOMotorDatabase) -> APIRouter:
    router = APIRouter(prefix="/auth", tags=["authentication"])

    @router.post("/register", response_model=TokenResponse)
    async def register(user_data: UserCreate):
        """Register a new user"""
        try:
            # Check if user already exists
            existing_user = await db.users.find_one({
                "$or": [
                    {"email": user_data.email},
                    {"username": user_data.username}
                ]
            })
            
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email or username already registered"
                )
            
            # Hash password
            hashed_password = get_password_hash(user_data.password)
            
            # Create user document
            user_doc = {
                "_id": ObjectId(),
                "username": user_data.username,
                "email": user_data.email,
                "password": hashed_password,
                "avatar": f"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces",
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
            
            # Insert user
            result = await db.users.insert_one(user_doc)
            
            # Create access token
            access_token = create_access_token(data={"sub": str(result.inserted_id)})
            
            # Prepare response
            user_response = UserResponse(
                _id=str(result.inserted_id),
                username=user_data.username,
                email=user_data.email,
                avatar=user_doc["avatar"],
                createdAt=user_doc["createdAt"]
            )
            
            return TokenResponse(user=user_response, token=access_token)
            
        except Exception as e:
            logger.error(f"Registration error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error creating user account"
            )

    @router.post("/login", response_model=TokenResponse)
    async def login(user_credentials: UserLogin):
        """Login user"""
        try:
            # Find user by email
            user = await db.users.find_one({"email": user_credentials.email})
            
            if not user or not verify_password(user_credentials.password, user["password"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect email or password"
                )
            
            # Create access token
            access_token = create_access_token(data={"sub": str(user["_id"])})
            
            # Prepare response
            user_response = UserResponse(
                _id=str(user["_id"]),
                username=user["username"],
                email=user["email"],
                avatar=user["avatar"],
                createdAt=user["createdAt"]
            )
            
            return TokenResponse(user=user_response, token=access_token)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Login error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error during login"
            )

    @router.get("/me", response_model=UserResponse)
    async def get_current_user_info(current_user: dict = Depends(get_current_user)):
        """Get current user information"""
        return UserResponse(
            _id=current_user["_id"],
            username=current_user["username"],  
            email=current_user["email"],
            avatar=current_user["avatar"],
            createdAt=current_user["createdAt"]
        )

    return router