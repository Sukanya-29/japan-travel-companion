from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import preferences, auth, translate, voicebridge, food_scanner
import uvicorn

app = FastAPI(
    title="Japan Travel Platform API",
    version="1.0.0",
    description="Backend for handling user preferences and database integration."
)

# CORS middleware taaki React frontend easily backend ke sath communicate kar sake
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(preferences.router)
app.include_router(translate.router)      # 👈 Add this
app.include_router(voicebridge.router)
app.include_router(food_scanner.router, prefix="/food-scanner", tags=["Food Scanner"])  

@app.get("/")
def read_root():
    return {"message": "Japan Travel Platform Backend is active and running! 🚀🇯🇵"}

if __name__ == "__main__":
    import os
    import sys
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    port = int(os.environ.get("PORT", 8000))
    print("\n" + "=" * 60)
    print(">> Japan Travel Platform Backend Server Starting...")
    print(f">> API Documentation: http://localhost:{port}/docs")
    print(f">> Food Scanner Endpoint: http://localhost:{port}/food-scanner/scan-image")
    print("=" * 60 + "\n")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)