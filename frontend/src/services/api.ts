import { 
  RoomInfo, 
  DrawingData, 
  ShapeDetectionResult, 
  OCRResult, 
  CanvasAnalytics,
  CreateRoomResponse,
  ApiResponse 
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/v1`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Room Management
  async createRoom(roomName: string): Promise<CreateRoomResponse> {
    return this.request<CreateRoomResponse>('/rooms', {
      method: 'POST',
      body: JSON.stringify({ room_name: roomName }),
    });
  }

  async getRoomInfo(roomId: string): Promise<RoomInfo> {
    return this.request<RoomInfo>(`/rooms/${roomId}`);
  }

  // Canvas Operations
  async saveCanvas(roomId: string, drawingData: DrawingData): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/canvas/save?room_id=${roomId}`, {
      method: 'POST',
      body: JSON.stringify(drawingData),
    });
  }

  async getCanvas(roomId: string): Promise<DrawingData> {
    return this.request<DrawingData>(`/canvas/${roomId}`);
  }

  // AI Features
  async detectShapes(imageData: string, confidenceThreshold: number = 0.7): Promise<ShapeDetectionResult> {
    return this.request<ShapeDetectionResult>('/ai/detect-shapes', {
      method: 'POST',
      body: JSON.stringify({
        image_data: imageData,
        confidence_threshold: confidenceThreshold,
      }),
    });
  }

  async performOCR(imageData: string, language: string = 'eng'): Promise<OCRResult> {
    return this.request<OCRResult>('/ai/ocr', {
      method: 'POST',
      body: JSON.stringify({
        image_data: imageData,
        language: language,
      }),
    });
  }

  async analyzeCanvas(roomId: string): Promise<CanvasAnalytics> {
    return this.request<CanvasAnalytics>(`/ai/analyze?room_id=${roomId}`, {
      method: 'POST',
    });
  }

  // File Upload
  async uploadImage(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseUrl}/upload`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  }

  // Analytics
  async getRoomAnalytics(roomId: string): Promise<CanvasAnalytics> {
    return this.request<CanvasAnalytics>(`/analytics/${roomId}`);
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>('/health');
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService; 