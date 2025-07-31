# Smart Whiteboard API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
Currently, the API doesn't require authentication for basic functionality. Future versions will include user authentication.

## Endpoints

### Health Check
**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "healthy",
  "message": "Smart Whiteboard API is running"
}
```

### Room Management

#### Create Room
**POST** `/rooms`

Create a new whiteboard room.

**Request Body:**
```json
{
  "room_name": "My Whiteboard Room"
}
```

**Response:**
```json
{
  "room_id": "uuid-string",
  "room_name": "My Whiteboard Room"
}
```

#### Get Room Info
**GET** `/rooms/{room_id}`

Get information about a specific room.

**Response:**
```json
{
  "id": "uuid-string",
  "name": "My Whiteboard Room",
  "created_at": "2024-01-01T00:00:00Z",
  "active_users": 3,
  "canvas_width": 1920,
  "canvas_height": 1080
}
```

### Canvas Operations

#### Save Canvas
**POST** `/canvas/save?room_id={room_id}`

Save the current canvas state.

**Request Body:**
```json
{
  "strokes": [
    {
      "points": [
        {"x": 100, "y": 100, "pressure": 1.0},
        {"x": 200, "y": 200, "pressure": 1.0}
      ],
      "color": "#000000",
      "width": 2.0,
      "tool": "pen",
      "timestamp": 1640995200000
    }
  ],
  "canvas_width": 1920,
  "canvas_height": 1080,
  "background_color": "#ffffff"
}
```

#### Get Canvas
**GET** `/canvas/{room_id}`

Retrieve the current canvas state.

**Response:**
```json
{
  "strokes": [...],
  "canvas_width": 1920,
  "canvas_height": 1080,
  "background_color": "#ffffff",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### AI Features

#### Shape Detection
**POST** `/ai/detect-shapes`

Detect and clean geometric shapes in drawing data.

**Request Body:**
```json
{
  "image_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "confidence_threshold": 0.7,
  "max_shapes": 10
}
```

**Response:**
```json
{
  "shapes": [
    {
      "type": "rectangle",
      "confidence": 0.85,
      "vertices": 4,
      "area": 10000
    }
  ],
  "confidence": 0.85,
  "processing_time": 0.15
}
```

#### OCR (Optical Character Recognition)
**POST** `/ai/ocr`

Extract text from drawing data.

**Request Body:**
```json
{
  "image_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "language": "eng",
  "confidence_threshold": 0.6
}
```

**Response:**
```json
{
  "text": "Hello World",
  "confidence": 0.92,
  "bounding_boxes": [
    {
      "text": "Hello",
      "confidence": 95,
      "bbox": {
        "x": 100,
        "y": 100,
        "width": 50,
        "height": 20
      }
    }
  ],
  "processing_time": 0.25
}
```

#### Canvas Analysis
**POST** `/ai/analyze?room_id={room_id}`

Analyze canvas activity and generate insights.

**Response:**
```json
{
  "total_strokes": 150,
  "active_users": 3,
  "drawing_time": 45.5,
  "heatmap_data": {
    "width": 1920,
    "height": 1080,
    "data": [[0, 10, 20, ...], ...]
  },
  "shape_count": {
    "rectangle": 5,
    "circle": 3,
    "triangle": 2,
    "line": 8
  },
  "color_usage": {
    "#000000": 45,
    "#FF0000": 20,
    "#00FF00": 15,
    "#0000FF": 20
  }
}
```

### File Upload

#### Upload Image
**POST** `/upload`

Upload an image to the whiteboard.

**Request:**
- Content-Type: `multipart/form-data`
- Body: File upload with key `file`

**Response:**
```json
{
  "image_url": "/uploads/filename.png"
}
```

### Analytics

#### Get Room Analytics
**GET** `/analytics/{room_id}`

Get analytics and insights for a specific room.

**Response:**
```json
{
  "total_strokes": 150,
  "active_users": 3,
  "drawing_time": 45.5,
  "heatmap_data": {...},
  "shape_count": {...},
  "color_usage": {...}
}
```

## WebSocket Events

### Connection Events
- `connect` - Client connected
- `disconnect` - Client disconnected

### Room Events
- `join_room` - Join a room
- `leave_room` - Leave a room
- `user_joined_room` - User joined room
- `user_left_room` - User left room

### Drawing Events
- `draw_data` - Send drawing data
- `drawing_update` - Receive drawing updates
- `clear_canvas` - Clear canvas
- `canvas_cleared` - Canvas was cleared

## Error Responses

All endpoints may return the following error format:

```json
{
  "detail": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Currently, there are no rate limits implemented. Future versions will include rate limiting for API endpoints.

## CORS

The API supports CORS for the following origins:
- `http://localhost:3001`
- `http://127.0.0.1:3001`
- `http://localhost:5173`
- `http://127.0.0.1:5173` 