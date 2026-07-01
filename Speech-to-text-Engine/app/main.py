from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
import httpx
import os
from typing import Optional

app = FastAPI(
    title="Audio Transcription API",
    description="Transcribe audio files using Whisper via Modal endpoint",
    version="1.0.0"
)
# Configuration
MODAL_ENDPOINT = os.getenv(
    "MODAL_ENDPOINT", 
    "https://tusuubiravictor--whisper-endpoint-small-v1-transcriber-t-a8453a.modal.run"
)
TIMEOUT_SECONDS = 120  # Adjust based on audio length

@app.post("/transcribe", response_class=JSONResponse)
async def transcribe_audio(
    file: UploadFile = File(..., description="Audio file (WAV, MP3, M4A, etc.)"),
    language: Optional[str] = Form("en", description="Language code (default: 'en')")
):
    """
    Transcribe uploaded audio file using Whisper.
    
    Returns:
        JSON with transcription, confidence, and metadata
    """
    # Validate file type
    allowed_extensions = {".wav", ".mp3", ".m4a", ".flac", ".ogg", ".webm"}
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type: {file_ext}. Allowed: {allowed_extensions}"
        )
    
    # Read file content
    try:
        audio_content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read file: {str(e)}")
    
    # Forward to Modal endpoint
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
            files = {"wav": (file.filename, audio_content, file.content_type or "audio/wav")}
            data = {"language": language}
            
            response = await client.post(
                MODAL_ENDPOINT,
                files=files,
                data=data
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Modal endpoint error: {response.text}"
                )
                
            result = response.json()
            
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Service unavailable: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    
    # Format and return response
    return {
        "success": True,
        "filename": file.filename,
        "language": language,
        "transcription": result.get("transcription", ""),
        "confidence": result.get("confidences", [None])[0],
        "segments": result.get("segments", []),
        "compression_ratio": result.get("compression_ratios", [None])[0]
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "audio-transcription-api"}


@app.get("/")
async def root():
    """API documentation redirect"""
    return {
        "message": "Audio Transcription API",
        "docs": "/docs",
        "endpoints": {
            "POST /transcribe": "Upload audio for transcription",
            "GET /health": "Health check"
        }
    }