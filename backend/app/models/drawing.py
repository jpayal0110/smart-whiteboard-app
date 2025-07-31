from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum

class ToolType(str, Enum):
    PEN = "pen"
    ERASER = "eraser"
    SHAPE = "shape"
    TEXT = "text"

class ShapeType(str, Enum):
    RECTANGLE = "rectangle"
    CIRCLE = "circle"
    TRIANGLE = "triangle"
    LINE = "line"
    ARROW = "arrow"

class DrawingPoint(BaseModel):
    x: float
    y: float
    pressure: Optional[float] = 1.0

class DrawingStroke(BaseModel):
    points: List[DrawingPoint]
    color: str = "#000000"
    width: float = 2.0
    tool: ToolType = ToolType.PEN
    shape_type: Optional[ShapeType] = None

class DrawingData(BaseModel):
    strokes: List[DrawingStroke] = []
    canvas_width: int = 1920
    canvas_height: int = 1080
    background_color: str = "#ffffff"
    timestamp: Optional[str] = None

class ShapeDetectionRequest(BaseModel):
    image_data: str  # Base64 encoded image
    confidence_threshold: float = 0.7
    max_shapes: int = 10

class OCRRequest(BaseModel):
    image_data: str  # Base64 encoded image
    language: str = "eng"
    confidence_threshold: float = 0.6

class ShapeDetectionResult(BaseModel):
    shapes: List[Dict[str, Any]]
    confidence: float
    processing_time: float

class OCRResult(BaseModel):
    text: str
    confidence: float
    bounding_boxes: List[Dict[str, Any]]
    processing_time: float

class CanvasAnalytics(BaseModel):
    total_strokes: int
    active_users: int
    drawing_time: float
    heatmap_data: Dict[str, Any]
    shape_count: Dict[str, int]
    color_usage: Dict[str, int] 