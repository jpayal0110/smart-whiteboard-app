// Color utility functions
export class ColorUtils {
  // Predefined color palette
  static readonly PRESET_COLORS = [
    '#000000', // Black
    '#FFFFFF', // White
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#800080', // Purple
    '#008000', // Dark Green
    '#000080', // Navy
    '#800000', // Maroon
    '#808000', // Olive
    '#FFC0CB', // Pink
    '#A52A2A', // Brown
  ];

  /**
   * Validate if a string is a valid hex color
   */
  static isValidHexColor(color: string): boolean {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  }

  /**
   * Convert hex color to RGB
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    if (!this.isValidHexColor(hex)) return null;

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;

    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }

  /**
   * Convert RGB to hex color
   */
  static rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => {
      const hex = n.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * Convert hex color to HSL
   */
  static hexToHsl(hex: string): { h: number; s: number; l: number } | null {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return null;

    const { r, g, b } = rgb;
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case rNorm:
          h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
          break;
        case gNorm:
          h = (bNorm - rNorm) / d + 2;
          break;
        case bNorm:
          h = (rNorm - gNorm) / d + 4;
          break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  /**
   * Convert HSL to hex color
   */
  static hslToHex(h: number, s: number, l: number): string {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return this.rgbToHex(
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255)
    );
  }

  /**
   * Get contrasting color (black or white) for a given background color
   */
  static getContrastColor(backgroundColor: string): string {
    const rgb = this.hexToRgb(backgroundColor);
    if (!rgb) return '#000000';

    const { r, g, b } = rgb;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  }

  /**
   * Lighten a color by a percentage
   */
  static lightenColor(hex: string, percent: number): string {
    const hsl = this.hexToHsl(hex);
    if (!hsl) return hex;

    const newL = Math.min(100, hsl.l + percent);
    return this.hslToHex(hsl.h, hsl.s, newL);
  }

  /**
   * Darken a color by a percentage
   */
  static darkenColor(hex: string, percent: number): string {
    const hsl = this.hexToHsl(hex);
    if (!hsl) return hex;

    const newL = Math.max(0, hsl.l - percent);
    return this.hslToHex(hsl.h, hsl.s, newL);
  }

  /**
   * Saturate a color by a percentage
   */
  static saturateColor(hex: string, percent: number): string {
    const hsl = this.hexToHsl(hex);
    if (!hsl) return hex;

    const newS = Math.min(100, hsl.s + percent);
    return this.hslToHex(hsl.h, newS, hsl.l);
  }

  /**
   * Desaturate a color by a percentage
   */
  static desaturateColor(hex: string, percent: number): string {
    const hsl = this.hexToHsl(hex);
    if (!hsl) return hex;

    const newS = Math.max(0, hsl.s - percent);
    return this.hslToHex(hsl.h, newS, hsl.l);
  }

  /**
   * Generate a random color
   */
  static generateRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  /**
   * Generate a color palette based on a base color
   */
  static generateColorPalette(baseColor: string, count: number = 5): string[] {
    const hsl = this.hexToHsl(baseColor);
    if (!hsl) return this.PRESET_COLORS.slice(0, count);

    const palette: string[] = [];
    const hueStep = 360 / count;

    for (let i = 0; i < count; i++) {
      const hue = (hsl.h + i * hueStep) % 360;
      palette.push(this.hslToHex(hue, hsl.s, hsl.l));
    }

    return palette;
  }

  /**
   * Get color name from hex (basic implementation)
   */
  static getColorName(hex: string): string {
    const colorMap: Record<string, string> = {
      '#000000': 'Black',
      '#FFFFFF': 'White',
      '#FF0000': 'Red',
      '#00FF00': 'Green',
      '#0000FF': 'Blue',
      '#FFFF00': 'Yellow',
      '#FF00FF': 'Magenta',
      '#00FFFF': 'Cyan',
      '#FFA500': 'Orange',
      '#800080': 'Purple',
      '#008000': 'Dark Green',
      '#000080': 'Navy',
      '#800000': 'Maroon',
      '#808000': 'Olive',
      '#FFC0CB': 'Pink',
      '#A52A2A': 'Brown',
    };

    return colorMap[hex.toUpperCase()] || 'Custom';
  }

  /**
   * Check if two colors are similar (within a threshold)
   */
  static areColorsSimilar(color1: string, color2: string, threshold: number = 30): boolean {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return false;

    const diff = Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );

    return diff <= threshold;
  }

  /**
   * Convert color to CSS rgba format
   */
  static hexToRgba(hex: string, alpha: number = 1): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return 'rgba(0, 0, 0, 1)';

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }
} 