import uuid
import json
import os
import aiofiles
from typing import Dict, Any, Optional
from datetime import datetime
from fastapi import UploadFile

from app.models.drawing import DrawingData, CanvasAnalytics
from app.core.config import settings

class CanvasService:
    """Service for managing canvas state and rooms"""
    
    def __init__(self):
        self.rooms: Dict[str, Dict[str, Any]] = {}
        self.canvas_data: Dict[str, DrawingData] = {}
        self.analytics: Dict[str, CanvasAnalytics] = {}
    
    def create_room(self, room_name: str) -> str:
        """Create a new whiteboard room"""
        room_id = str(uuid.uuid4())
        
        self.rooms[room_id] = {
            'id': room_id,
            'name': room_name,
            'created_at': datetime.now().isoformat(),
            'active_users': 0,
            'canvas_width': settings.DEFAULT_CANVAS_WIDTH,
            'canvas_height': settings.DEFAULT_CANVAS_HEIGHT
        }
        
        # Initialize empty canvas
        self.canvas_data[room_id] = DrawingData(
            canvas_width=settings.DEFAULT_CANVAS_WIDTH,
            canvas_height=settings.DEFAULT_CANVAS_HEIGHT
        )
        
        return room_id
    
    def get_room_info(self, room_id: str) -> Dict[str, Any]:
        """Get room information"""
        if room_id not in self.rooms:
            raise Exception("Room not found")
        
        return self.rooms[room_id]
    
    def save_canvas(self, room_id: str, drawing_data: DrawingData) -> None:
        """Save canvas state"""
        if room_id not in self.rooms:
            raise Exception("Room not found")
        
        self.canvas_data[room_id] = drawing_data
        
        # Update room analytics
        self._update_room_analytics(room_id, drawing_data)
    
    def get_canvas(self, room_id: str) -> DrawingData:
        """Get canvas state"""
        if room_id not in self.canvas_data:
            raise Exception("Canvas not found")
        
        return self.canvas_data[room_id]
    
    async def upload_image(self, file: UploadFile) -> str:
        """Upload an image to the whiteboard"""
        try:
            # Create upload directory if it doesn't exist
            os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
            
            # Generate unique filename
            file_extension = os.path.splitext(file.filename or "")[1]
            filename = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(settings.UPLOAD_DIR, filename)
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            # Return file URL
            return f"/uploads/{filename}"
            
        except Exception as e:
            raise Exception(f"Failed to upload image: {str(e)}")
    
    def get_room_analytics(self, room_id: str) -> CanvasAnalytics:
        """Get room analytics"""
        if room_id not in self.analytics:
            # Return mock analytics if not available
            return CanvasAnalytics(
                total_strokes=0,
                active_users=0,
                drawing_time=0.0,
                heatmap_data={'width': 1920, 'height': 1080, 'data': []},
                shape_count={},
                color_usage={}
            )
        
        return self.analytics[room_id]
    
    def _update_room_analytics(self, room_id: str, drawing_data: DrawingData) -> None:
        """Update room analytics based on drawing data"""
        if room_id not in self.analytics:
            self.analytics[room_id] = CanvasAnalytics(
                total_strokes=0,
                active_users=1,
                drawing_time=0.0,
                heatmap_data={'width': 1920, 'height': 1080, 'data': []},
                shape_count={},
                color_usage={}
            )
        
        analytics = self.analytics[room_id]
        
        # Update stroke count
        analytics.total_strokes = len(drawing_data.strokes)
        
        # Update color usage
        color_usage = {}
        for stroke in drawing_data.strokes:
            color = stroke.color
            color_usage[color] = color_usage.get(color, 0) + 1
        
        analytics.color_usage = color_usage
        
        # Update shape count
        shape_count = {}
        for stroke in drawing_data.strokes:
            if stroke.shape_type:
                shape_name = stroke.shape_type.value
                shape_count[shape_name] = shape_count.get(shape_name, 0) + 1
        
        analytics.shape_count = shape_count
        
        # Update drawing time (mock calculation)
        analytics.drawing_time = len(drawing_data.strokes) * 0.1  # 0.1 seconds per stroke
        
        self.analytics[room_id] = analytics
    
    def join_room(self, room_id: str, user_id: str) -> None:
        """User joins a room"""
        if room_id not in self.rooms:
            raise Exception("Room not found")
        
        self.rooms[room_id]['active_users'] += 1
    
    def leave_room(self, room_id: str, user_id: str) -> None:
        """User leaves a room"""
        if room_id in self.rooms:
            self.rooms[room_id]['active_users'] = max(0, self.rooms[room_id]['active_users'] - 1)
    
    def delete_room(self, room_id: str) -> None:
        """Delete a room and its data"""
        if room_id in self.rooms:
            del self.rooms[room_id]
        
        if room_id in self.canvas_data:
            del self.canvas_data[room_id]
        
        if room_id in self.analytics:
            del self.analytics[room_id] 