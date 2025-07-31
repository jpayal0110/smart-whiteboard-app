import cv2
import numpy as np
import pytesseract
from PIL import Image
import base64
import io
import time
from typing import Dict, List, Any, Optional
import json

from app.models.drawing import ShapeDetectionResult, OCRResult, CanvasAnalytics

class AIService:
    """AI service for shape detection, OCR, and analytics"""
    
    def __init__(self):
        self.shape_detection_enabled = True
        self.ocr_enabled = True
        self.analytics_enabled = True
    
    async def detect_shapes(self, image_data: str, confidence_threshold: float = 0.7) -> ShapeDetectionResult:
        """Detect and clean shapes in drawing data"""
        start_time = time.time()
        
        try:
            # Decode base64 image
            image_bytes = base64.b64decode(image_data.split(',')[1] if ',' in image_data else image_data)
            image = Image.open(io.BytesIO(image_bytes))
            image_np = np.array(image)
            
            # Convert to grayscale
            gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
            
            # Apply threshold
            _, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
            
            # Find contours
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            shapes = []
            for contour in contours:
                # Approximate contour to polygon
                epsilon = 0.02 * cv2.arcLength(contour, True)
                approx = cv2.approxPolyDP(contour, epsilon, True)
                
                # Determine shape type
                shape_info = self._classify_shape(approx)
                if shape_info['confidence'] >= confidence_threshold:
                    shapes.append(shape_info)
            
            processing_time = time.time() - start_time
            
            return ShapeDetectionResult(
                shapes=shapes,
                confidence=sum(s['confidence'] for s in shapes) / len(shapes) if shapes else 0,
                processing_time=processing_time
            )
            
        except Exception as e:
            raise Exception(f"Shape detection failed: {str(e)}")
    
    def _classify_shape(self, contour) -> Dict[str, Any]:
        """Classify contour as a specific shape"""
        vertices = len(contour)
        
        if vertices == 3:
            return {
                'type': 'triangle',
                'confidence': 0.9,
                'vertices': vertices,
                'area': cv2.contourArea(contour)
            }
        elif vertices == 4:
            # Check if it's a rectangle
            x, y, w, h = cv2.boundingRect(contour)
            aspect_ratio = float(w) / h
            if 0.8 <= aspect_ratio <= 1.2:
                return {
                    'type': 'square',
                    'confidence': 0.85,
                    'vertices': vertices,
                    'area': cv2.contourArea(contour)
                }
            else:
                return {
                    'type': 'rectangle',
                    'confidence': 0.8,
                    'vertices': vertices,
                    'area': cv2.contourArea(contour)
                }
        elif vertices > 8:
            # Check if it's a circle
            area = cv2.contourArea(contour)
            perimeter = cv2.arcLength(contour, True)
            circularity = 4 * np.pi * area / (perimeter * perimeter) if perimeter > 0 else 0
            
            if circularity > 0.8:
                return {
                    'type': 'circle',
                    'confidence': circularity,
                    'vertices': vertices,
                    'area': area
                }
        
        return {
            'type': 'unknown',
            'confidence': 0.5,
            'vertices': vertices,
            'area': cv2.contourArea(contour)
        }
    
    async def perform_ocr(self, image_data: str, language: str = "eng") -> OCRResult:
        """Perform OCR on drawing data"""
        start_time = time.time()
        
        try:
            # Decode base64 image
            image_bytes = base64.b64decode(image_data.split(',')[1] if ',' in image_data else image_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Preprocess image for better OCR
            image_np = np.array(image)
            gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
            
            # Apply threshold to get black text on white background
            _, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)
            
            # Convert back to PIL Image
            processed_image = Image.fromarray(thresh)
            
            # Perform OCR
            text = pytesseract.image_to_string(processed_image, lang=language)
            
            # Get bounding boxes
            data = pytesseract.image_to_data(processed_image, lang=language, output_type=pytesseract.Output.DICT)
            
            bounding_boxes = []
            for i, conf in enumerate(data['conf']):
                if int(conf) > 60:  # Confidence threshold
                    bounding_boxes.append({
                        'text': data['text'][i],
                        'confidence': int(conf),
                        'bbox': {
                            'x': data['left'][i],
                            'y': data['top'][i],
                            'width': data['width'][i],
                            'height': data['height'][i]
                        }
                    })
            
            processing_time = time.time() - start_time
            
            return OCRResult(
                text=text.strip(),
                confidence=sum(bb['confidence'] for bb in bounding_boxes) / len(bounding_boxes) if bounding_boxes else 0,
                bounding_boxes=bounding_boxes,
                processing_time=processing_time
            )
            
        except Exception as e:
            raise Exception(f"OCR failed: {str(e)}")
    
    async def analyze_canvas(self, room_id: str) -> CanvasAnalytics:
        """Analyze canvas activity and generate insights"""
        try:
            # This would typically fetch data from a database
            # For now, return mock data
            analytics = CanvasAnalytics(
                total_strokes=150,
                active_users=3,
                drawing_time=45.5,
                heatmap_data={
                    'width': 1920,
                    'height': 1080,
                    'data': self._generate_mock_heatmap()
                },
                shape_count={
                    'rectangle': 5,
                    'circle': 3,
                    'triangle': 2,
                    'line': 8
                },
                color_usage={
                    '#000000': 45,
                    '#FF0000': 20,
                    '#00FF00': 15,
                    '#0000FF': 20
                }
            )
            
            return analytics
            
        except Exception as e:
            raise Exception(f"Canvas analysis failed: {str(e)}")
    
    def _generate_mock_heatmap(self) -> List[List[int]]:
        """Generate mock heatmap data"""
        import random
        heatmap = []
        for _ in range(108):  # Height / 10
            row = []
            for _ in range(192):  # Width / 10
                row.append(random.randint(0, 100))
            heatmap.append(row)
        return heatmap 