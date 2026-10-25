"""
Translation router — YOUR part of the project.
All endpoints here will be available at /translate/...
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests

router = APIRouter(
    prefix="/translate",
    tags=["Translation"],
)


class TranslationRequest(BaseModel):
    text: str
    source_language: str = "en"
    target_language: str = "ja"


@router.post("/")
def translate_text(request: TranslationRequest):
    """Translate text from one language to another using MyMemory API."""
    if not request.text.strip():
        raise HTTPException(
            status_code=400,
            detail="Please enter some text to translate."
        )

    try:
        response = requests.get(
            "https://api.mymemory.translated.net/get",
            params={
                "q": request.text,
                "langpair": f"{request.source_language}|{request.target_language}"
            },
            timeout=15
        )
        response.raise_for_status()
        data = response.json()

        if data.get("responseStatus") != 200:
            raise ValueError(
                data.get("responseDetails", "Translation service failed")
            )

        translated_text = data["responseData"]["translatedText"]

        return {
            "original_text": request.text,
            "translated_text": translated_text,
            "source_language": request.source_language,
            "target_language": request.target_language
        }

    except Exception as error:
        print("Translation error:", repr(error))
        raise HTTPException(
            status_code=502,
            detail="Translation service failed. Check the backend terminal."
        )
