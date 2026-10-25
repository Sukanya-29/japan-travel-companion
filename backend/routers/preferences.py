from fastapi import APIRouter, HTTPException, Depends
from schemas import UserPreferencesCreate, UserPreferencesResponse
from database import supabase
from .auth_dependency import get_current_user_id

router = APIRouter(prefix="/api/preferences", tags=["Preferences"])

# Per day cost mapping (Without flights and hotels)
BUDGET_RATES_PER_DAY = {
    "Affordable": 4000,
    "Medium": 8000,
    "Luxury": 20000
}

@router.post("/", response_model=UserPreferencesResponse)
def save_or_update_preferences(pref: UserPreferencesCreate, user_id: str = Depends(get_current_user_id)):
    try:
        tier = pref.budget_tier.capitalize()
        if tier not in BUDGET_RATES_PER_DAY:
            raise HTTPException(status_code=400, detail="Invalid budget tier selected. Choose Affordable, Medium, or Luxury.")
        
        # Calculate total estimated budget based on trip duration days
        per_day_cost = BUDGET_RATES_PER_DAY[tier]
        total_estimated_budget = per_day_cost * pref.trip_duration_days

        data_to_upsert = {
            "user_id": user_id,
            "dietary_preference": pref.dietary_preference,
            "budget_tier": tier,
            "budget_total_inr": total_estimated_budget, # Automatically calculated total
            "interests": pref.interests,
            "trip_duration_days": pref.trip_duration_days,
        }

        # Supabase Upsert operation
        response = supabase.table("user_preferences").upsert(data_to_upsert, on_conflict="user_id").execute()

        return {
            "success": True,
            "message": f"Preferences saved successfully! Calculated total budget for {pref.trip_duration_days} days is ₹{total_estimated_budget}.",
            "data": response.data[0] if response.data else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=UserPreferencesResponse)
def get_user_preferences(user_id: str = Depends(get_current_user_id)):
    try:
        response = supabase.table("user_preferences").select("*").eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Preferences not found for this user.")

        return {
            "success": True,
            "message": "Preferences fetched successfully!",
            "data": response.data[0]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))