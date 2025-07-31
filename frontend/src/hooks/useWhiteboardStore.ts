import { create } from 'zustand';
import { 
  WhiteboardState, 
  ToolType, 
  ToolProperties, 
  CanvasElement, 
  CanvasState,
  ShapeElement,
  TextElement,
  StickyNoteElement,
  ImageElement,
  Point
} from '../types';

const defaultToolProperties: ToolProperties = {
  color: '#000000',
  backgroundColor: '#ffffff',
  strokeWidth: 2,
  fontSize: 16,
  fontFamily: 'Arial',
  fontWeight: 'normal',
  fontStyle: 'normal',
  opacity: 1,
};

const defaultCanvasState: CanvasState = {
  zoom: 1,
  pan: { x: 0, y: 0 },
  grid: true,
  snapToGrid: false,
  gridSize: 20,
  selectedElements: [],
};

export const useWhiteboardStore = create<WhiteboardState>((set, get) => ({
  // Initial state
  currentTool: 'pen',
  toolProperties: defaultToolProperties,
  elements: [],
  canvasState: defaultCanvasState,
  isDrawing: false,
  selectedElement: undefined,
  selectedElements: [],
  
  // Actions
  setCurrentTool: (tool: ToolType) => {
    console.log('Setting current tool in store:', tool);
    set({ currentTool: tool });
  },
  
  setToolProperties: (properties: Partial<ToolProperties>) => 
    set((state) => ({
      toolProperties: { ...state.toolProperties, ...properties }
    })),
  
  addElement: (element: CanvasElement) => 
    set((state) => ({
      elements: [...state.elements, element]
    })),
  
  updateElement: (id: string, updates: Partial<CanvasElement>) =>
    set((state) => ({
      elements: state.elements.map(element =>
        element.id === id ? { ...element, ...updates } : element
      )
    })),
  
  removeElement: (id: string) =>
    set((state) => ({
      elements: state.elements.filter(element => element.id !== id),
      selectedElements: state.selectedElements.filter(elementId => elementId !== id)
    })),
  
  clearCanvas: () => set({ 
    elements: [], 
    selectedElements: [],
    selectedElement: undefined 
  }),
  
  setSelectedElements: (elementIds: string[]) => set({ selectedElements: elementIds }),
  
  setCanvasState: (state: Partial<CanvasState>) =>
    set((currentState) => ({
      canvasState: { ...currentState.canvasState, ...state }
    })),
  
  setIsDrawing: (drawing: boolean) => set({ isDrawing: drawing }),
  
  setSelectedElement: (element?: CanvasElement) => set({ selectedElement: element }),

  // Helper methods for creating specific elements
  createShape: (shapeType: string, position: { x: number; y: number }, size: { width: number; height: number }) => {
    const { toolProperties } = get();
    const shape: ShapeElement = {
      id: `shape_${Date.now()}_${Math.random()}`,
      type: 'shape',
      shapeType: shapeType as any,
      position,
      width: size.width,
      height: size.height,
      stroke: toolProperties.color,
      strokeWidth: toolProperties.strokeWidth,
      fill: toolProperties.backgroundColor,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      timestamp: Date.now(),
    };
    get().addElement(shape);
    return shape;
  },

  createText: (text: string, position: { x: number; y: number }) => {
    const { toolProperties } = get();
    const textElement: TextElement = {
      id: `text_${Date.now()}_${Math.random()}`,
      type: 'text',
      text,
      position,
      fontSize: toolProperties.fontSize,
      fontFamily: toolProperties.fontFamily,
      fontWeight: toolProperties.fontWeight,
      fontStyle: toolProperties.fontStyle,
      color: toolProperties.color,
      backgroundColor: toolProperties.backgroundColor,
      padding: 8,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      timestamp: Date.now(),
    };
    get().addElement(textElement);
    return textElement;
  },

  createStickyNote: (text: string, position: { x: number; y: number }) => {
    const { toolProperties } = get();
    const stickyNote: StickyNoteElement = {
      id: `sticky_${Date.now()}_${Math.random()}`,
      type: 'sticky-note',
      text,
      position,
      backgroundColor: '#ffff99', // Default yellow
      fontSize: toolProperties.fontSize,
      fontFamily: toolProperties.fontFamily,
      fontWeight: toolProperties.fontWeight,
      fontStyle: toolProperties.fontStyle,
      color: '#000000',
      padding: 12,
      width: 200,
      height: 150,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      timestamp: Date.now(),
    };
    get().addElement(stickyNote);
    return stickyNote;
  },

  createImage: (src: string, position: { x: number; y: number }, size: { width: number; height: number }) => {
    const imageElement: ImageElement = {
      id: `image_${Date.now()}_${Math.random()}`,
      type: 'image',
      src,
      position,
      width: size.width,
      height: size.height,
      originalWidth: size.width,
      originalHeight: size.height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      timestamp: Date.now(),
    };
    get().addElement(imageElement);
    return imageElement;
  },

  // Selection and grouping methods
  selectElement: (elementId: string) => {
    const { elements } = get();
    const element = elements.find(el => el.id === elementId);
    if (element) {
      set({ 
        selectedElements: [elementId],
        selectedElement: element 
      });
    }
  },

  selectMultipleElements: (elementIds: string[]) => {
    const { elements } = get();
    const selectedElements = elements.filter(el => elementIds.includes(el.id));
    set({ 
      selectedElements: elementIds,
      selectedElement: selectedElements.length === 1 ? selectedElements[0] : undefined
    });
  },

  clearSelection: () => set({ 
    selectedElements: [],
    selectedElement: undefined 
  }),

  // Undo/Redo functionality (basic implementation)
  undo: () => {
    const { elements } = get();
    if (elements.length > 0) {
      const newElements = elements.slice(0, -1);
      set({ elements: newElements });
    }
  },

  // Zoom and pan methods
  zoomIn: () => {
    const { canvasState } = get();
    const newZoom = Math.min(canvasState.zoom * 1.2, 5);
    get().setCanvasState({ zoom: newZoom });
  },

  zoomOut: () => {
    const { canvasState } = get();
    const newZoom = Math.max(canvasState.zoom / 1.2, 0.1);
    get().setCanvasState({ zoom: newZoom });
  },

  resetZoom: () => {
    get().setCanvasState({ zoom: 1, pan: { x: 0, y: 0 } });
  },

  // Grid methods
  toggleGrid: () => {
    const { canvasState } = get();
    get().setCanvasState({ grid: !canvasState.grid });
  },

  toggleSnapToGrid: () => {
    const { canvasState } = get();
    get().setCanvasState({ snapToGrid: !canvasState.snapToGrid });
  },
})); 