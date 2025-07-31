import { Point, DrawingStroke, ToolType } from '../types';

// Canvas utility functions
export class CanvasUtils {
  /**
   * Get mouse position relative to canvas
   */
  static getMousePos(canvas: HTMLCanvasElement, event: MouseEvent): Point {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  /**
   * Get touch position relative to canvas
   */
  static getTouchPos(canvas: HTMLCanvasElement, event: TouchEvent): Point {
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }

  /**
   * Calculate distance between two points
   */
  static distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Interpolate points between two points for smooth drawing
   */
  static interpolatePoints(p1: Point, p2: Point, steps: number = 5): Point[] {
    const points: Point[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      points.push({
        x: p1.x + (p2.x - p1.x) * t,
        y: p1.y + (p2.y - p1.y) * t,
        pressure: p1.pressure !== undefined && p2.pressure !== undefined
          ? p1.pressure + (p2.pressure - p1.pressure) * t
          : undefined,
      });
    }
    return points;
  }

  /**
   * Draw a stroke on canvas context
   */
  static drawStroke(
    context: CanvasRenderingContext2D,
    stroke: DrawingStroke,
    smooth: boolean = true
  ) {
    if (stroke.points.length === 0) return;

    context.strokeStyle = stroke.color;
    context.lineWidth = stroke.width;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    context.beginPath();

    if (smooth && stroke.points.length > 1) {
      // Use quadratic curves for smooth lines
      context.moveTo(stroke.points[0].x, stroke.points[0].y);
      
      for (let i = 1; i < stroke.points.length - 1; i++) {
        const current = stroke.points[i];
        const next = stroke.points[i + 1];
        const cpx = (current.x + next.x) / 2;
        const cpy = (current.y + next.y) / 2;
        context.quadraticCurveTo(current.x, current.y, cpx, cpy);
      }
      
      if (stroke.points.length > 1) {
        const last = stroke.points[stroke.points.length - 1];
        context.lineTo(last.x, last.y);
      }
    } else {
      // Simple line drawing
      context.moveTo(stroke.points[0].x, stroke.points[0].y);
      stroke.points.forEach(point => {
        context.lineTo(point.x, point.y);
      });
    }

    context.stroke();
  }

  /**
   * Clear canvas
   */
  static clearCanvas(canvas: HTMLCanvasElement, backgroundColor: string = '#ffffff') {
    const context = canvas.getContext('2d');
    if (!context) return;

    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * Redraw all strokes on canvas
   */
  static redrawCanvas(
    canvas: HTMLCanvasElement,
    strokes: DrawingStroke[],
    backgroundColor: string = '#ffffff'
  ) {
    const context = canvas.getContext('2d');
    if (!context) return;

    // Clear canvas
    this.clearCanvas(canvas, backgroundColor);

    // Redraw all strokes
    strokes.forEach(stroke => {
      this.drawStroke(context, stroke);
    });
  }

  /**
   * Convert canvas to image data URL
   */
  static canvasToDataURL(canvas: HTMLCanvasElement, format: string = 'image/png'): string {
    return canvas.toDataURL(format);
  }

  /**
   * Convert canvas to blob
   */
  static canvasToBlob(canvas: HTMLCanvasElement, format: string = 'image/png'): Promise<Blob> {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, format);
    });
  }

  /**
   * Download canvas as image
   */
  static downloadCanvas(canvas: HTMLCanvasElement, filename: string = 'whiteboard.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = this.canvasToDataURL(canvas);
    link.click();
  }

  /**
   * Resize canvas while preserving content
   */
  static resizeCanvas(
    canvas: HTMLCanvasElement,
    newWidth: number,
    newHeight: number
  ): void {
    const context = canvas.getContext('2d');
    if (!context) return;

    // Create temporary canvas to store current content
    const tempCanvas = document.createElement('canvas');
    const tempContext = tempCanvas.getContext('2d');
    if (!tempContext) return;

    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempContext.drawImage(canvas, 0, 0);

    // Resize original canvas
    canvas.width = newWidth;
    canvas.height = newHeight;

    // Redraw content scaled to new size
    context.drawImage(tempCanvas, 0, 0, newWidth, newHeight);
  }

  /**
   * Get canvas dimensions that fit within viewport
   */
  static getOptimalCanvasSize(
    maxWidth: number = window.innerWidth - 32,
    maxHeight: number = window.innerHeight - 200
  ): { width: number; height: number } {
    const aspectRatio = 16 / 9; // Default aspect ratio
    
    let width = maxWidth;
    let height = width / aspectRatio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return { width: Math.floor(width), height: Math.floor(height) };
  }

  /**
   * Apply pressure sensitivity to brush size
   */
  static getBrushSizeWithPressure(
    baseSize: number,
    pressure: number = 1.0,
    minSize: number = 1,
    maxSize: number = 50
  ): number {
    const size = baseSize * pressure;
    return Math.max(minSize, Math.min(maxSize, size));
  }

  /**
   * Create a new stroke with interpolated points
   */
  static createSmoothStroke(
    points: Point[],
    color: string,
    width: number,
    tool: ToolType
  ): DrawingStroke {
    const interpolatedPoints: Point[] = [];
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const distance = this.distance(current, next);
      
      if (distance > 5) {
        // Interpolate points if distance is large
        const steps = Math.floor(distance / 3);
        const interpolated = this.interpolatePoints(current, next, steps);
        interpolatedPoints.push(...interpolated);
      } else {
        interpolatedPoints.push(current);
      }
    }
    
    if (points.length > 0) {
      interpolatedPoints.push(points[points.length - 1]);
    }

    return {
      points: interpolatedPoints,
      color,
      width,
      tool,
      timestamp: Date.now(),
    };
  }
} 