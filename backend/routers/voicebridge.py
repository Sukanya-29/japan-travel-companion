"""
VoiceBridge router — handles local audio processing and voice bridging features.
All endpoints here will be available at /voicebridge/...
"""

from fastapi import APIRouter, File, HTTPException, UploadFile

router = APIRouter(
    prefix="/voicebridge",
    tags=["VoiceBridge"],
)


@router.post("/process-audio")
async def process_audio(file: UploadFile = File(...)):
    """Accepts an audio file and processes it locally via VoiceBridge."""
    
    # Validate that the uploaded file is an audio format
    if not file.content_type.startswith("audio/"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Please upload an audio file (e.g., .wav, .mp3)."
        )

    try:
        # Read the uploaded audio bytes
        audio_bytes = await file.read()
        
        # --- Add your local audio processing / model logic here ---
        file_size_kb = len(audio_bytes) / 1024

        return {
            "filename": file.filename,
            "size_kb": round(file_size_kb, 2),
            "status": "Audio successfully received and processed locally by VoiceBridge!",
        }

    except Exception as error:
        print("VoiceBridge processing error:", repr(error))
        raise HTTPException(
            status_code=502,
            detail="VoiceBridge processing failed. Check the backend terminal."
        )


@router.get("/status")
def check_voicebridge_status():
    """Check if the VoiceBridge module is active."""
    return {
        "status": "online",
        "mode": "local"
    }