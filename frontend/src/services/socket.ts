import { io, Socket } from 'socket.io-client';
import { DrawingStroke, SocketDrawingData, SocketClearData } from '../types';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8000';

export interface SocketEventHandlers {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onUserJoined?: (data: { sid: string; room: string }) => void;
  onUserLeft?: (data: { sid: string; room: string }) => void;
  onDrawingUpdate?: (data: SocketDrawingData) => void;
  onCanvasCleared?: (data: SocketClearData) => void;
  onError?: (error: any) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private eventHandlers: SocketEventHandlers = {};
  private isConnected = false;

  connect(handlers: SocketEventHandlers = {}) {
    this.eventHandlers = handlers;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Connected to Socket.IO server');
      this.eventHandlers.onConnect?.();
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Disconnected from Socket.IO server');
      this.eventHandlers.onDisconnect?.();
    });

    this.socket.on('user_joined_room', (data) => {
      console.log('User joined room:', data);
      this.eventHandlers.onUserJoined?.(data);
    });

    this.socket.on('user_left_room', (data) => {
      console.log('User left room:', data);
      this.eventHandlers.onUserLeft?.(data);
    });

    this.socket.on('drawing_update', (data) => {
      console.log('Received drawing update:', data);
      this.eventHandlers.onDrawingUpdate?.(data);
    });

    this.socket.on('canvas_cleared', (data) => {
      console.log('Canvas cleared:', data);
      this.eventHandlers.onCanvasCleared?.(data);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.eventHandlers.onError?.(error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinRoom(roomId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_room', { room: roomId });
      console.log('Joined room:', roomId);
    }
  }

  leaveRoom(roomId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_room', { room: roomId });
      console.log('Left room:', roomId);
    }
  }

  sendDrawingData(drawingData: SocketDrawingData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('draw_data', drawingData);
    }
  }

  clearCanvas(roomId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('clear_canvas', { room: roomId });
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Utility method to get socket instance (for advanced usage)
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService; 