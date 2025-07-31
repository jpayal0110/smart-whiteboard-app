from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from typing import List, Optional
import json
from pydantic import BaseModel

from app.services.ai_service import AIService
from app.services.canvas_service import CanvasService
from app.models.drawing import DrawingData, ShapeDetectionRequest, OCRRequest

# Request models
class CreateRoomRequest(BaseModel):
    room_name: str

# Create router
api_router = APIRouter()

# Initialize services
ai_service = AIService()
canvas_service = CanvasService()

@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Smart Whiteboard API is running"}

@api_router.post("/rooms")
async def create_room(request: CreateRoomRequest):
    """Create a new whiteboard room"""
    try:
        room_id = canvas_service.create_room(request.room_name)
        return {"room_id": room_id, "room_name": request.room_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/rooms/{room_id}")
async def get_room_info(room_id: str):
    """Get room information"""
    try:
        room_info = canvas_service.get_room_info(room_id)
        return room_info
    except Exception as e:
        raise HTTPException(status_code=404, detail="Room not found")

@api_router.post("/ai/detect-shapes")
async def detect_shapes(request: ShapeDetectionRequest):
    """Detect and clean shapes in drawing data"""
    try:
        result = await ai_service.detect_shapes(request.image_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Shape detection failed: {str(e)}")

@api_router.post("/ai/ocr")
async def perform_ocr(request: OCRRequest):
    """Perform OCR on drawing data"""
    try:
        result = await ai_service.perform_ocr(request.image_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")

@api_router.post("/ai/analyze")
async def analyze_canvas(room_id: str):
    """Analyze canvas activity and generate insights"""
    try:
        analytics = await ai_service.analyze_canvas(room_id)
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Canvas analysis failed: {str(e)}")

@api_router.post("/canvas/save")
async def save_canvas(room_id: str, drawing_data: DrawingData):
    """Save canvas state"""
    try:
        canvas_service.save_canvas(room_id, drawing_data)
        return {"message": "Canvas saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save canvas: {str(e)}")

@api_router.get("/canvas/{room_id}")
async def get_canvas(room_id: str):
    """Get canvas state"""
    try:
        canvas_data = canvas_service.get_canvas(room_id)
        return canvas_data
    except Exception as e:
        raise HTTPException(status_code=404, detail="Canvas not found")

@api_router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image to the whiteboard"""
    try:
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        image_url = await canvas_service.upload_image(file)
        return {"image_url": image_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@api_router.get("/analytics/{room_id}")
async def get_room_analytics(room_id: str):
    """Get room analytics and insights"""
    try:
        analytics = canvas_service.get_room_analytics(room_id)
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}") 