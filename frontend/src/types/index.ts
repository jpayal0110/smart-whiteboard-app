// Drawing and Canvas Types
export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export type ToolType = 'pen' | 'eraser' | 'rectangle' | 'circle' | 'triangle' | 'arrow' | 'line' | 'text' | 'sticky-note' | 'select' | 'image';

export type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'arrow' | 'line';

export interface DrawingStroke {
  points: Point[];
  color: string;
  width: number;
  tool: ToolType;
  shapeType?: ShapeType;
  timestamp: number;
}

// Enhanced element types for Fabric.js
export interface CanvasElement {
  id: string;
  type: 'stroke' | 'shape' | 'text' | 'image' | 'sticky-note';
  position: { x: number; y: number };
  width?: number;
  height?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  timestamp: number;
  createdBy?: string;
}

export interface ShapeElement extends CanvasElement {
  type: 'shape';
  shapeType: ShapeType;
  fill?: string;
  stroke: string;
  strokeWidth: number;
  points?: Point[]; // For custom shapes
}

export interface TextElement extends CanvasElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  color: string;
  backgroundColor?: string;
  padding?: number;
}

export interface StickyNoteElement extends CanvasElement {
  type: 'sticky-note';
  text: string;
  backgroundColor: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  color: string;
  padding: number;
}

export interface ImageElement extends CanvasElement {
  type: 'image';
  src: string;
  alt?: string;
  originalWidth: number;
  originalHeight: number;
}

export interface DrawingData {
  elements: CanvasElement[];
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  timestamp?: string;
}

// Socket Types
export interface SocketDrawingData {
  type: 'draw' | 'shape' | 'text' | 'image' | 'sticky-note' | 'update' | 'delete';
  element?: CanvasElement;
  stroke?: DrawingStroke;
  room: string;
  userId?: string;
}

export interface SocketClearData {
  type: 'clear';
  room: string;
  userId?: string;
}

// Tool Properties
export interface ToolProperties {
  color: string;
  backgroundColor?: string;
  strokeWidth: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  opacity: number;
}

// Selection and Grouping
export interface SelectionGroup {
  id: string;
  elements: string[]; // Array of element IDs
  bounds: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

// Canvas State
export interface CanvasState {
  zoom: number;
  pan: { x: number; y: number };
  grid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  selectedElements: string[];
  selectionGroup?: SelectionGroup;
}

// Room Types
export interface RoomInfo {
  id: string;
  name: string;
  createdAt: string;
  activeUsers: number;
  canvasWidth: number;
  canvasHeight: number;
}

export interface CreateRoomRequest {
  room_name: string;
}

export interface CreateRoomResponse {
  roomId: string;
  roomName: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// File Upload Types
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  type: string;
}

// UI State Types
export interface WhiteboardState {
  currentTool: ToolType;
  toolProperties: ToolProperties;
  elements: CanvasElement[];
  canvasState: CanvasState;
  isDrawing: boolean;
  selectedElement?: CanvasElement;
  selectedElements: string[];
  
  // Actions
  setCurrentTool: (tool: ToolType) => void;
  setToolProperties: (properties: Partial<ToolProperties>) => void;
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  clearCanvas: () => void;
  setSelectedElements: (elementIds: string[]) => void;
  setCanvasState: (state: Partial<CanvasState>) => void;
  setIsDrawing: (drawing: boolean) => void;
  setSelectedElement: (element?: CanvasElement) => void;
  
  // Helper methods
  createShape: (shapeType: string, position: { x: number; y: number }, size: { width: number; height: number }) => ShapeElement;
  createText: (text: string, position: { x: number; y: number }) => TextElement;
  createStickyNote: (text: string, position: { x: number; y: number }) => StickyNoteElement;
  createImage: (src: string, position: { x: number; y: number }, size: { width: number; height: number }) => ImageElement;
  selectElement: (elementId: string) => void;
  selectMultipleElements: (elementIds: string[]) => void;
  clearSelection: () => void;
  undo: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
}

// Component Props
export interface WhiteboardCanvasProps {
  onDraw: (drawingData: SocketDrawingData) => void;
  currentTool: ToolType;
  toolProperties: ToolProperties;
  canvasState: CanvasState;
}

export interface ToolbarProps {
  currentTool: ToolType;
  toolProperties: ToolProperties;
  onToolChange: (tool: ToolType) => void;
  onPropertyChange: (property: keyof ToolProperties, value: any) => void;
  onClearCanvas: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export interface SidebarProps {
  onClose: () => void;
  roomId: string;
  onInsertImage: (file: File) => void;
  onInsertEmoji: (emoji: string) => void;
  onInsertFile: (file: File) => void;
} 