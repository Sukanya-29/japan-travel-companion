from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from database import supabase

router = APIRouter(prefix="/auth", tags=["Authentication"])

class UserSyncRequest(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = "Traveler"
    dietary: Optional[str] = "Vegetarian"
    travel_style: Optional[str] = "Balanced comfort"

@router.post("/sync-user")
def sync_user(user: UserSyncRequest):
    """
    Synchronizes user data from Supabase Auth (supports both Email/Password 
    and Google OAuth) into your custom user_preferences table.
    """
    try:
        # Check if the user already exists in your database table
        existing_user = supabase.table("user_preferences").select("*").eq("id", user.id).execute()
        
        if not existing_user.data:
            # First-time sign up: Insert user profile record into database
            new_record = {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "dietary": user.dietary,
                "travel_style": user.travel_style
            }
            response = supabase.table("user_preferences").insert(new_record).execute()
            return {
                "success": True,
                "message": "User successfully registered and synced to database!",
                "data": response.data
            }
        
        # Returning user login: Data already exists, just return success
        return {
            "success": True,
            "message": "User session active and data fetched successfully.",
            "data": existing_user.data[0]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile/{user_id}")
def get_user_profile(user_id: str):
    """
    Fetches saved user profile and preferences from database using their unique user_id.
    """
    try:
        response = supabase.table("user_preferences").select("*").eq("id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="User profile not found.")
        return {"success": True, "data": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))