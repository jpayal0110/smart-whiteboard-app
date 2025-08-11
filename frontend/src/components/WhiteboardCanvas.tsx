import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import { useWhiteboardStore } from '../hooks/useWhiteboardStore.ts';
import { ToolType, CanvasElement, Point, ShapeElement, TextElement, StickyNoteElement, ImageElement, StrokeElement } from '../types';

interface WhiteboardCanvasProps {
  onDraw: (drawingData: any) => void;
  currentTool: ToolType;
  toolProperties: any;
  canvasState: any;
  clearCanvasTrigger?: number; // Add this to trigger canvas clearing
}

const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  onDraw,
  currentTool,
  toolProperties,
  canvasState,
  clearCanvasTrigger,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);

  const {
    addElement,
    elements,
    setSelectedElements,
    clearSelection,
    createShape,
    createText,
    createStickyNote,
    createImage,
    updateElement,
    removeElement
  } = useWhiteboardStore();

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    // Set canvas element dimensions first
    const canvasElement = canvasRef.current;
    const canvasWidth = window.innerWidth - 32;
    const canvasHeight = window.innerHeight - 200;
    
    canvasElement.width = canvasWidth;
    canvasElement.height = canvasHeight;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
      renderOnAddRemove: true,
      skipTargetFind: false,
      enableRetinaScaling: true,
      allowTouchScrolling: true,

      fireRightClick: true,
      stopContextMenu: false,
    });

    fabricCanvasRef.current = canvas;

    // Simple console logs for drawing state
    console.log('Pen tool active - letting Fabric.js handle drawing');

    // Set up event listeners
    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', handleSelectionCleared);
    canvas.on('object:modified', handleObjectModified);
    canvas.on('object:removed', handleObjectRemoved);

    // Set up drawing event listeners
    canvas.on('mouse:down', handleFabricMouseDown);
    canvas.on('mouse:move', handleFabricMouseMove);
    canvas.on('mouse:up', handleFabricMouseUp);

    // Initialize drawing brush with proper configuration
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = toolProperties.strokeWidth || 2;
    canvas.freeDrawingBrush.color = toolProperties.color || '#000000';
    canvas.freeDrawingBrush.strokeLineCap = 'round';
    canvas.freeDrawingBrush.strokeLineJoin = 'round';
    // Additional brush settings for better drawing experience
    
    console.log('Initial brush setup:', {
      width: canvas.freeDrawingBrush.width,
      color: canvas.freeDrawingBrush.color,
      strokeLineCap: canvas.freeDrawingBrush.strokeLineCap,
      strokeLineJoin: canvas.freeDrawingBrush.strokeLineJoin
    });

        // Path creation event handler will be set up in the tool change effect

    // Handle window resize
    const handleResize = () => {
      if (canvasRef.current) {
        const canvasWidth = window.innerWidth - 32;
        const canvasHeight = window.innerHeight - 200;
        
        // Update canvas element dimensions
        canvasRef.current.width = canvasWidth;
        canvasRef.current.height = canvasHeight;
        
        // Update Fabric.js canvas dimensions
        canvas.setDimensions({
          width: canvasWidth,
          height: canvasHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, []);

  // Update canvas properties when tool changes
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;

    console.log('=== TOOL CHANGE DEBUG ===');
    console.log('Tool changed to:', currentTool);
    console.log('Tool properties:', toolProperties);
    console.log('Canvas state before tool change:', {
      isDrawingMode: canvas.isDrawingMode,
      objects: canvas.getObjects().length,
      freeDrawingBrush: !!canvas.freeDrawingBrush
    });

    // Set drawing mode
    const previousDrawingMode = canvas.isDrawingMode;
    canvas.isDrawingMode = currentTool === 'pen';
    console.log('Drawing mode changed from', previousDrawingMode, 'to:', canvas.isDrawingMode);

    if (currentTool === 'pen') {
      console.log('=== CONFIGURING PEN TOOL ===');
      
      if (canvas.freeDrawingBrush) {
        console.log('Brush before configuration:', {
          width: canvas.freeDrawingBrush.width,
          color: canvas.freeDrawingBrush.color,
          strokeLineCap: canvas.freeDrawingBrush.strokeLineCap,
          strokeLineJoin: canvas.freeDrawingBrush.strokeLineJoin
        });
        
        canvas.freeDrawingBrush.width = toolProperties.strokeWidth || 2;
        canvas.freeDrawingBrush.color = toolProperties.color || '#000000';
        canvas.freeDrawingBrush.strokeLineCap = 'round';
        canvas.freeDrawingBrush.strokeLineJoin = 'round';
        
        console.log('Brush after configuration:', {
          width: canvas.freeDrawingBrush.width,
          color: canvas.freeDrawingBrush.color,
          strokeLineCap: canvas.freeDrawingBrush.strokeLineCap,
          strokeLineJoin: canvas.freeDrawingBrush.strokeLineJoin
        });
        console.log('Drawing mode enabled:', canvas.isDrawingMode);
      } else {
        console.log('No freeDrawingBrush available - creating new one');
        // Create a new brush if it doesn't exist
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = toolProperties.strokeWidth || 2;
        canvas.freeDrawingBrush.color = toolProperties.color || '#000000';
        canvas.freeDrawingBrush.strokeLineCap = 'round';
        canvas.freeDrawingBrush.strokeLineJoin = 'round';
        console.log('Created new brush:', {
          width: canvas.freeDrawingBrush.width,
          color: canvas.freeDrawingBrush.color,
          strokeLineCap: canvas.freeDrawingBrush.strokeLineCap,
          strokeLineJoin: canvas.freeDrawingBrush.strokeLineJoin
        });
      }
      
      // Double-check drawing mode is enabled
      canvas.isDrawingMode = true;
      console.log('Drawing mode confirmed:', canvas.isDrawingMode);
      
      // Set up path creation event handler with current toolProperties
      canvas.on('path:created', (e: any) => {
        console.log('Path created - drawing completed');
        
        const path = e.path;
        
        // Just add an ID and let Fabric.js handle everything else
        path.id = `path_${Date.now()}_${Math.random()}`;
        
        // Fix the fill property - null fill causes rendering issues
        if (path.fill === null) {
          path.fill = '';
        }
        
        console.log('Path created with ID:', path.id);
        console.log('Path properties:', {
          stroke: path.stroke,
          strokeWidth: path.strokeWidth,
          fill: path.fill,
          visible: path.visible,
          opacity: path.opacity,
          path: (path as any).path,
          left: path.left,
          top: path.top,
          width: path.width,
          height: path.height
        });
        
        // Check if path has actual drawing data
        if ((path as any).path && (path as any).path.length > 0) {
          console.log('Path has drawing data:', (path as any).path.length, 'segments');
        } else {
          console.log('Path has NO drawing data - this is the problem!');
        }
        

        // Create path element for persistence
        const pathElement: StrokeElement = {
          id: path.id,
          type: 'stroke',
          position: { x: path.left || 0, y: path.top || 0 },
          width: path.width || 0,
          height: path.height || 0,
          stroke: path.stroke || toolProperties.color,
          strokeWidth: path.strokeWidth || toolProperties.strokeWidth,
          timestamp: Date.now(),
        };
        
        // Add to local state for persistence
        addElement(pathElement);
        
        // Notify other users
        onDraw({ 
          type: 'draw', 
          element: pathElement
        });
      });
      
      // Verify canvas state after pen tool setup
      console.log('Canvas state after pen tool setup:', {
        isDrawingMode: canvas.isDrawingMode,
        objects: canvas.getObjects().length,
        freeDrawingBrush: !!canvas.freeDrawingBrush,
        brushWidth: canvas.freeDrawingBrush?.width,
        brushColor: canvas.freeDrawingBrush?.color
      });
    } else {
      console.log('=== DISABLING DRAWING MODE ===');
      canvas.isDrawingMode = false;
      console.log('Drawing mode disabled');
      
      // When switching away from pen tool, redraw to show all persisted elements
      console.log('Switching away from pen tool - redrawing canvas');
      redrawCanvas();
    }

    // Set cursor based on tool
    const cursorMap: Record<ToolType, string> = {
      pen: 'crosshair',
      eraser: 'crosshair',
      select: 'default',
      rectangle: 'crosshair',
      circle: 'crosshair',
      triangle: 'crosshair',
      arrow: 'crosshair',
      line: 'crosshair',
      text: 'text',
      'sticky-note': 'crosshair',
      image: 'crosshair',
    };

    canvas.defaultCursor = cursorMap[currentTool] || 'default';
  }, [currentTool, toolProperties]);

  // Handle selection events
  const handleSelection = useCallback((e: any) => {
    const selectedObjects = e.selected || [];
    const selectedIds = selectedObjects.map((obj: any) => obj.id);
    setSelectedElements(selectedIds);
  }, [setSelectedElements]);

  const handleSelectionCleared = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const handleObjectModified = useCallback((e: any) => {
    const obj = e.target;
    if (obj && obj.id) {
      updateElement(obj.id, {
        position: { x: obj.left || 0, y: obj.top || 0 },
        width: obj.width,
        height: obj.height,
        rotation: obj.angle || 0,
        scaleX: obj.scaleX || 1,
        scaleY: obj.scaleY || 1,
      });
    }
  }, [updateElement]);

  const handleObjectRemoved = useCallback((e: any) => {
    const obj = e.target;
    if (obj && obj.id) {
      removeElement(obj.id);
    }
  }, [removeElement]);

  // Fabric.js mouse event handlers (moved to end after function declarations)

  // Helper functions
  const createPreviewShape = (tool: ToolType, start: Point, end: Point): fabric.Object | null => {
    switch (tool) {
      case 'rectangle':
        return new fabric.Rect({
          left: Math.min(start.x, end.x),
          top: Math.min(start.y, end.y),
          width: Math.abs(end.x - start.x),
          height: Math.abs(end.y - start.y),
          stroke: toolProperties.color,
          strokeWidth: toolProperties.strokeWidth,
          fill: 'transparent',
          selectable: false,
          evented: false,
        });
      case 'circle':
        const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        return new fabric.Circle({
          left: start.x - radius,
          top: start.y - radius,
          radius: radius,
          stroke: toolProperties.color,
          strokeWidth: toolProperties.strokeWidth,
          fill: 'transparent',
          selectable: false,
          evented: false,
        });
      case 'line':
        return new fabric.Line([start.x, start.y, end.x, end.y], {
          stroke: toolProperties.color,
          strokeWidth: toolProperties.strokeWidth,
          selectable: false,
          evented: false,
        });
      default:
        return null;
    }
  };



  const addTextElement = (position: Point) => {
    const text = prompt('Enter text:');
    if (text) {
      const textElement = createText(text, position);
      addFabricObject(textElement);
      onDraw({ type: 'text', element: textElement });
    }
  };

  const addStickyNoteElement = (position: Point) => {
    const text = prompt('Enter sticky note text:');
    if (text) {
      const stickyNote = createStickyNote(text, position);
      addFabricObject(stickyNote);
      onDraw({ type: 'sticky-note', element: stickyNote });
    }
  };

  const addFabricObject = (element: CanvasElement) => {
    // VERIFY: Always use the current canvas reference
    const currentCanvas = fabricCanvasRef.current;
    if (!currentCanvas) {
      console.error('Canvas reference is null in addFabricObject!');
      return;
    }
    
    console.log('Adding fabric object to canvas:', {
      elementType: element.type,
      elementId: element.id,
      canvasObjects: currentCanvas.getObjects().length
    });
    
    let fabricObject: fabric.Object;

    switch (element.type) {
      case 'stroke':
        // For stroke elements, we need to preserve the actual path data
        // Since we don't store the full path data in our state, we'll skip recreating strokes
        // The paths should remain on the canvas from the original drawing
        console.log('Skipping stroke recreation - paths should remain on canvas');
        return;
      case 'shape':
        fabricObject = createFabricShape(element as ShapeElement);
        break;
      case 'text':
        fabricObject = createFabricText(element as TextElement);
        break;
      case 'sticky-note':
        fabricObject = createFabricStickyNote(element as StickyNoteElement);
        break;
      case 'image':
        fabricObject = createFabricImage(element as ImageElement);
        break;
      default:
        console.log('Unknown element type:', element.type);
        return;
    }

    (fabricObject as any).id = element.id;
    currentCanvas.add(fabricObject);
    currentCanvas.renderAll();
    
    // VERIFY: Check if object was actually added
    const objectsAfter = currentCanvas.getObjects().length;
    console.log('Objects on canvas after adding:', objectsAfter);
    
    const addedObject = currentCanvas.getObjects().find(obj => (obj as any).id === element.id);
    console.log('Object successfully added:', addedObject ? 'YES' : 'NO');
  };

  const createFabricShape = (element: ShapeElement): fabric.Object => {
    const { position, width, height, stroke, strokeWidth, fill, shapeType } = element;

    switch (shapeType) {
      case 'rectangle':
        return new fabric.Rect({
          left: position.x,
          top: position.y,
          width: width || 100,
          height: height || 100,
          stroke,
          strokeWidth,
          fill: fill || 'transparent',
          selectable: true,
          evented: true,
        });
      case 'circle':
        return new fabric.Circle({
          left: position.x,
          top: position.y,
          radius: (width || 50) / 2,
          stroke,
          strokeWidth,
          fill: fill || 'transparent',
          selectable: true,
          evented: true,
        });
      case 'line':
        return new fabric.Line([position.x, position.y, (position.x + (width || 100)), position.y], {
          stroke,
          strokeWidth,
          selectable: true,
          evented: true,
        });
      default:
        return new fabric.Rect({
          left: position.x,
          top: position.y,
          width: width || 100,
          height: height || 100,
          stroke,
          strokeWidth,
          fill: fill || 'transparent',
          selectable: true,
          evented: true,
        });
    }
  };

  const createFabricText = (element: TextElement): fabric.Text => {
    const { position, text, fontSize, fontFamily, fontWeight, fontStyle, color, backgroundColor } = element;

    return new fabric.Text(text, {
      left: position.x,
      top: position.y,
      fontSize,
      fontFamily,
      fontWeight,
      fontStyle,
      fill: color,
      backgroundColor,
      selectable: true,
      evented: true,
      editable: true,
    });
  };

  const createFabricStickyNote = (element: StickyNoteElement): fabric.Group => {
    const { position, text, backgroundColor, fontSize, fontFamily, fontWeight, fontStyle, color, padding, width, height } = element;

    const rect = new fabric.Rect({
      width: width || 200,
      height: height || 150,
      fill: backgroundColor,
      stroke: '#000000',
      strokeWidth: 1,
    });

    const textObj = new fabric.Text(text, {
      fontSize,
      fontFamily,
      fontWeight,
      fontStyle,
      fill: color,
      left: padding || 12,
      top: padding || 12,
    });

    const group = new fabric.Group([rect, textObj], {
      left: position.x,
      top: position.y,
      selectable: true,
      evented: true,
    });

    return group;
  };

  const createFabricImage = (element: ImageElement): fabric.Object => {
    // For now, return a placeholder rectangle until we fix the image loading
    const placeholder = new fabric.Rect({
      left: element.position.x,
      top: element.position.y,
      width: element.width,
      height: element.height,
      fill: '#cccccc',
      stroke: '#999999',
      strokeWidth: 1,
      selectable: true,
      evented: true,
    });
    return placeholder;
  };

  const redrawCanvas = () => {
    // VERIFY: Always use the current canvas reference
    const currentCanvas = fabricCanvasRef.current;
    if (!currentCanvas) {
      console.error('Canvas reference is null in redrawCanvas!');
      return;
    }
    
    console.log('Redrawing canvas with elements:', elements.length);
    console.log('Canvas objects before redraw:', currentCanvas.getObjects().length);
    
    // Don't clear the canvas if we're in drawing mode to preserve drawn paths
    if (currentTool === 'pen') {
      console.log('Skipping canvas clear in drawing mode to preserve paths');
      return;
    }
    
    currentCanvas.clear();
    console.log('Canvas cleared, objects after clear:', currentCanvas.getObjects().length);
    
    // Redraw all elements except strokes (which should remain on canvas)
    elements.forEach(element => {
      if (element.type !== 'stroke') {
        addFabricObject(element);
      }
    });
    
    console.log('Canvas objects after redraw:', currentCanvas.getObjects().length);
  };

  // Redraw canvas when elements change
  useEffect(() => {
    // Only redraw if we're not in drawing mode to avoid clearing drawn paths
    if (currentTool === 'pen') {
      console.log('Skipping redraw in pen mode to preserve drawn paths');
      return;
    }
    
    // Only redraw if there are actually elements to redraw
    if (elements.length === 0) {
      return;
    }
    
    // Redraw canvas to show all elements except strokes (which remain on canvas)
    redrawCanvas();
  }, [elements, currentTool]);

  // Clear Fabric.js canvas when clearCanvasTrigger changes
  useEffect(() => {
    if (clearCanvasTrigger && fabricCanvasRef.current) {
      console.log('Clearing Fabric.js canvas due to clearCanvasTrigger');
      fabricCanvasRef.current.clear();
      fabricCanvasRef.current.requestRenderAll();
    }
  }, [clearCanvasTrigger]);

  // Fabric.js mouse event handlers
  const handleFabricMouseDown = useCallback((e: any) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const pointer = canvas.getPointer(e.e);
    const point = { x: pointer.x, y: pointer.y };

    // Don't interfere with drawing mode
    if (currentTool === 'pen') {
      console.log('Pen tool active - letting Fabric.js handle drawing');
      return;
    }

    if (currentTool === 'select') {
      // Let Fabric.js handle selection
      return;
    }

    if (['rectangle', 'circle', 'triangle', 'arrow', 'line'].includes(currentTool)) {
      setIsDrawing(true);
      setStartPoint(point);
      return;
    }

    if (currentTool === 'text') {
      addTextElement(point);
      return;
    }

    if (currentTool === 'sticky-note') {
      addStickyNoteElement(point);
      return;
    }
  }, [currentTool, addTextElement, addStickyNoteElement]);

  const handleFabricMouseMove = useCallback((e: any) => {
    // Don't interfere with drawing mode
    if (currentTool === 'pen') {
      return;
    }

    if (!isDrawing || !startPoint || !fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const pointer = canvas.getPointer(e.e);
    const currentPoint = { x: pointer.x, y: pointer.y };

    // Remove previous preview object if it exists
    const objects = canvas.getObjects();
    const previewObject = objects.find(obj => (obj as any).isPreview);
    if (previewObject) {
      canvas.remove(previewObject);
    }

    // Create preview shape as Fabric object
    const previewShape = createPreviewShape(currentTool, startPoint, currentPoint);
    if (previewShape) {
      (previewShape as any).isPreview = true;
      canvas.add(previewShape);
      canvas.renderAll();
    }
  }, [isDrawing, startPoint, currentTool]);

  const handleFabricMouseUp = useCallback((e: any) => {
    // Don't interfere with drawing mode
    if (currentTool === 'pen') {
      return;
    }

    if (!isDrawing || !startPoint || !fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const pointer = canvas.getPointer(e.e);
    const endPoint = { x: pointer.x, y: pointer.y };

    // Remove preview object
    const objects = canvas.getObjects();
    const previewObject = objects.find(obj => (obj as any).isPreview);
    if (previewObject) {
      canvas.remove(previewObject);
    }

    // For line tool, create a Fabric.js Line object directly
    if (currentTool === 'line') {
      const line = new fabric.Line([startPoint.x, startPoint.y, endPoint.x, endPoint.y], {
        stroke: toolProperties.color,
        strokeWidth: toolProperties.strokeWidth,
        selectable: true,
        evented: true,
      });

      (line as any).id = `line_${Date.now()}_${Math.random()}`;
      canvas.add(line);
      canvas.renderAll();

      // Add to our state
      const lineElement: ShapeElement = {
        id: (line as any).id,
        type: 'shape',
        shapeType: 'line',
        position: { x: startPoint.x, y: startPoint.y },
        width: Math.abs(endPoint.x - startPoint.x),
        height: Math.abs(endPoint.y - startPoint.y),
        stroke: toolProperties.color,
        strokeWidth: toolProperties.strokeWidth,
        timestamp: Date.now(),
      };

      addElement(lineElement);
      onDraw({ type: 'shape', element: lineElement });
    } else {
      // Create other shapes
      const size = {
        width: Math.abs(endPoint.x - startPoint.x),
        height: Math.abs(endPoint.y - startPoint.y),
      };

      const position = {
        x: Math.min(startPoint.x, endPoint.x),
        y: Math.min(startPoint.y, endPoint.y),
      };

      if (size.width > 5 && size.height > 5) {
        const shape = createShape(currentTool, position, size);
        addFabricObject(shape);
        onDraw({ type: 'shape', element: shape });
      }
    }

    setIsDrawing(false);
    setStartPoint(null);
    // Don't call redrawCanvas() here as it will clear the canvas
  }, [isDrawing, startPoint, currentTool, createShape, addFabricObject, onDraw, toolProperties, addElement]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className={`canvas border border-gray-300 rounded-lg shadow-lg ${!canvasState.grid ? 'no-grid' : ''}`}
      />

    </div>
  );
};

export default WhiteboardCanvas; 