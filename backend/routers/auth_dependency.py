from fastapi import Header, HTTPException
from database import supabase

async def get_current_user_id(authorization: str = Header(None)) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing!")
    
    try:
        # Bearer token extract karo
        token = authorization.split(" ")[1]
        
        # Supabase se token verify karke user ki details nikalo
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid authentication token!")
            
        return user_id
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")