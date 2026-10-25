from pydantic import BaseModel, Field
from typing import List, Optional

class UserPreferencesCreate(BaseModel):
    dietary_preference: List[str] = Field(
        ..., 
        example=["Vegetarian", "Eggetarian"],
        description="Options: Vegetarian, Non-Vegetarian, Strict Jain, Eggetarian"
    )
    budget_tier: str = Field(
        ..., 
        example="Medium", 
        description="Selected category: Affordable, Medium, or Luxury"
    )
    interests: List[str] = Field(
        ..., 
        example=["Temple / Religious", "Pop Culture / Anime"],
        description="Selected interests from dataset categories"
    )
    trip_duration_days: int = Field(
        ..., 
        example=4, 
        description="Trip duration in days"
    )

class UserPreferencesResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None