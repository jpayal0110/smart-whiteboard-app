import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import { useWhiteboardStore } from '../hooks/useWhiteboardStore.ts';
import { ToolType, CanvasElement, Point, ShapeElement, TextElement, StickyNoteElement, ImageElement } from '../types';

interface WhiteboardCanvasProps {
  onDraw: (drawingData: any) => void;
  currentTool: ToolType;
  toolProperties: any;
  canvasState: any;
}

const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  onDraw,
  currentTool,
  toolProperties,
  canvasState,
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

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth - 32,
      height: window.innerHeight - 200,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

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

    // Initialize drawing brush
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = 2;
    canvas.freeDrawingBrush.color = '#000000';

    // Listen for path creation (when drawing is complete)
    canvas.on('path:created', (e: any) => {
      console.log('Path created:', e.path);
      const path = e.path;
      path.id = `path_${Date.now()}_${Math.random()}`;
      
      // Don't add to our state - let Fabric.js manage the paths
      // Just notify other users about the drawing
      onDraw({ type: 'draw', element: {
        id: path.id,
        type: 'stroke',
        position: { x: path.left || 0, y: path.top || 0 },
        width: path.width || 0,
        height: path.height || 0,
        timestamp: Date.now(),
      }});
    });

    // Handle window resize
    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth - 32,
        height: window.innerHeight - 200,
      });
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
    
    console.log('Tool changed to:', currentTool);
    console.log('Tool properties:', toolProperties);
    
    // Set drawing mode
    canvas.isDrawingMode = currentTool === 'pen';
    console.log('Drawing mode set to:', canvas.isDrawingMode);
    
    if (currentTool === 'pen') {
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.width = toolProperties.strokeWidth;
        canvas.freeDrawingBrush.color = toolProperties.color;
        console.log('Brush configured:', {
          width: canvas.freeDrawingBrush.width,
          color: canvas.freeDrawingBrush.color
        });
      } else {
        console.log('No freeDrawingBrush available');
      }
    } else {
      canvas.isDrawingMode = false;
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
  const drawShapePreview = (tool: ToolType, start: Point, end: Point) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const ctx = canvas.getContext();

    ctx.strokeStyle = toolProperties.color;
    ctx.lineWidth = toolProperties.strokeWidth;
    ctx.fillStyle = toolProperties.backgroundColor;

    switch (tool) {
      case 'rectangle':
        ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        break;
      case 'circle':
        const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        ctx.beginPath();
        ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      case 'line':
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        break;
      case 'arrow':
        drawArrow(ctx, start, end);
        break;
      case 'triangle':
        drawTriangle(ctx, start, end);
        break;
    }
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
    const headLength = 15;
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 6), end.y - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - headLength * Math.cos(angle + Math.PI / 6), end.y - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  const drawTriangle = (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
    const width = end.x - start.x;
    const height = end.y - start.y;

    ctx.beginPath();
    ctx.moveTo(start.x + width / 2, start.y);
    ctx.lineTo(start.x, start.y + height);
    ctx.lineTo(start.x + width, start.y + height);
    ctx.closePath();
    ctx.stroke();
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
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    let fabricObject: fabric.Object;

    switch (element.type) {
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
    canvas.add(fabricObject);
    canvas.renderAll();
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

  const createFabricImage = (element: ImageElement): fabric.Image => {
    return new fabric.Image(element.src, {
      left: element.position.x,
      top: element.position.y,
      width: element.width,
      height: element.height,
      selectable: true,
      evented: true,
    });
  };

  const redrawCanvas = () => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    
    // Only clear and redraw if we're not in drawing mode
    // This preserves drawn paths
    if (currentTool !== 'pen') {
      canvas.clear();
      
      // Redraw all elements
      elements.forEach(element => {
        addFabricObject(element);
      });
    }
  };

  // Redraw canvas when elements change
  useEffect(() => {
    redrawCanvas();
  }, [elements]);

  // Fabric.js mouse event handlers
  const handleFabricMouseDown = useCallback((e: any) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const pointer = canvas.getPointer(e.e);
    const point = { x: pointer.x, y: pointer.y };

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
    if (!isDrawing || !startPoint || !fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const pointer = canvas.getPointer(e.e);
    const currentPoint = { x: pointer.x, y: pointer.y };

    // Clear previous preview
    canvas.clear();

    // Draw preview shape
    drawShapePreview(currentTool, startPoint, currentPoint);
  }, [isDrawing, startPoint, currentTool]);

  const handleFabricMouseUp = useCallback((e: any) => {
    if (!isDrawing || !startPoint || !fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const pointer = canvas.getPointer(e.e);
    const endPoint = { x: pointer.x, y: pointer.y };

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
      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <button
          onClick={() => useWhiteboardStore.getState().zoomIn()}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => useWhiteboardStore.getState().zoomOut()}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50"
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={() => useWhiteboardStore.getState().resetZoom()}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50"
          title="Reset Zoom"
        >
          ⌂
        </button>
      </div>
    </div>
  );
};

export default WhiteboardCanvas; 