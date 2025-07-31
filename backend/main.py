from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
from app.core.config import settings
from app.api.routes import api_router

# Create FastAPI app
app = FastAPI(
    title="Smart Whiteboard API",
    description="AI-powered collaborative whiteboard backend",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=settings.CORS_ORIGINS
)

# Create Socket.IO app
socket_app = socketio.ASGIApp(sio, app)

# Socket.IO event handlers
@sio.event
async def connect(sid, environ):
    """Handle client connection"""
    print(f"Client connected: {sid}")
    await sio.emit('user_connected', {'sid': sid}, skip_sid=sid)

@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    print(f"Client disconnected: {sid}")
    await sio.emit('user_disconnected', {'sid': sid}, skip_sid=sid)

@sio.event
async def join_room(sid, data):
    """Handle room joining"""
    room = data.get('room')
    if room:
        await sio.enter_room(sid, room)
        await sio.emit('user_joined_room', {
            'sid': sid,
            'room': room
        }, room=room, skip_sid=sid)

@sio.event
async def leave_room(sid, data):
    """Handle room leaving"""
    room = data.get('room')
    if room:
        await sio.leave_room(sid, room)
        await sio.emit('user_left_room', {
            'sid': sid,
            'room': room
        }, room=room, skip_sid=sid)

@sio.event
async def draw_data(sid, data):
    """Handle drawing data from clients"""
    room = data.get('room')
    if room:
        # Process drawing data with AI if needed
        processed_data = await process_drawing_data(data)
        await sio.emit('drawing_update', processed_data, room=room, skip_sid=sid)

@sio.event
async def clear_canvas(sid, data):
    """Handle canvas clearing"""
    room = data.get('room')
    if room:
        await sio.emit('canvas_cleared', {'room': room}, room=room, skip_sid=sid)

async def process_drawing_data(data):
    """Process drawing data with AI enhancements"""
    # TODO: Implement AI processing
    # - Shape detection
    # - OCR for text
    # - Analytics tracking
    return data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(socket_app, host="0.0.0.0", port=8000, reload=False) 