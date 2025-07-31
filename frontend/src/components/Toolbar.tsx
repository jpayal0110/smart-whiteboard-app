import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import {
  PencilIcon,
  TrashIcon,
  Square3Stack3DIcon,
  EyeDropperIcon,
  Square2StackIcon,
  CircleStackIcon,
  PlayIcon,
  ArrowUpIcon,
  MinusIcon,
  DocumentTextIcon,
  DocumentTextIcon as TypeIcon,
  PhotoIcon,
  CursorArrowRaysIcon,
  MagnifyingGlassIcon,
  MagnifyingGlassMinusIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon as UndoIcon,
  ArrowUturnRightIcon as RedoIcon,
  ViewColumnsIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { ToolType, ToolProperties } from '../types';

interface ToolbarProps {
  currentTool: ToolType;
  toolProperties: ToolProperties;
  onToolChange: (tool: ToolType) => void;
  onPropertyChange: (property: keyof ToolProperties, value: any) => void;
  onClearCanvas: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  toolProperties,
  onToolChange,
  onPropertyChange,
  onClearCanvas,
  onUndo,
  onRedo,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTextProperties, setShowTextProperties] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);

  const tools = [
    { id: 'select', icon: CursorArrowRaysIcon, label: 'Select' },
    { id: 'pen', icon: PencilIcon, label: 'Pen' },
    { id: 'eraser', icon: TrashIcon, label: 'Eraser' },
    { id: 'rectangle', icon: Square2StackIcon, label: 'Rectangle' },
    { id: 'circle', icon: CircleStackIcon, label: 'Circle' },
    { id: 'triangle', icon: PlayIcon, label: 'Triangle' },
    { id: 'arrow', icon: ArrowUpIcon, label: 'Arrow' },
    { id: 'line', icon: MinusIcon, label: 'Line' },
    { id: 'text', icon: TypeIcon, label: 'Text' },
    { id: 'sticky-note', icon: DocumentTextIcon, label: 'Sticky Note' },
    { id: 'image', icon: PhotoIcon, label: 'Image' },
  ];

  const brushSizes = [1, 2, 4, 8, 16, 32];
  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48];
  const fontFamilies = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'];

  const handleToolClick = (toolId: string) => {
    console.log('Tool clicked:', toolId);
    console.log('Current tool before change:', currentTool);
    onToolChange(toolId as ToolType);
    console.log('Tool change called');
  };

  const handleColorChange = (color: string) => {
    onPropertyChange('color', color);
    setShowColorPicker(false);
  };

  const handleBackgroundColorChange = (color: string) => {
    onPropertyChange('backgroundColor', color);
  };

  const handleBrushSizeChange = (size: number) => {
    onPropertyChange('strokeWidth', size);
  };

  const handleFontSizeChange = (size: number) => {
    onPropertyChange('fontSize', size);
  };

  const handleFontFamilyChange = (family: string) => {
    onPropertyChange('fontFamily', family);
  };

  const handleFontWeightChange = (weight: string) => {
    onPropertyChange('fontWeight', weight);
  };

  const handleFontStyleChange = (style: string) => {
    onPropertyChange('fontStyle', style);
  };

  const isShapeTool = ['rectangle', 'circle', 'triangle', 'arrow', 'line'].includes(currentTool);
  const isTextTool = ['text', 'sticky-note'].includes(currentTool);

  // Handle click outside to close color picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node) &&
        colorButtonRef.current &&
        !colorButtonRef.current.contains(event.target as Node)
      ) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker]);

  return (
    <div className="toolbar bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 shadow-lg overflow-visible">
      {/* Debug: Show current tool */}
      <div className="text-xs mb-2">Current Tool: {currentTool}</div>
      <div className="flex items-center justify-between">
        {/* Left side - Tools */}
        <div className="flex items-center space-x-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`tool-button p-2 rounded-lg transition-all duration-200 ${
                currentTool === tool.id
                  ? 'bg-white bg-opacity-20 border-2 border-white border-opacity-50'
                  : 'hover:bg-white hover:bg-opacity-10'
              }`}
              title={tool.label}
            >
              <tool.icon className="h-5 w-5" />
            </button>
          ))}
        </div>

        {/* Center - Properties */}
        <div className="flex items-center space-x-4">
          {/* Color Picker */}
          <div className="relative color-picker-container inline-block">
            <button
              ref={colorButtonRef}
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-8 h-8 rounded border-2 border-white border-opacity-50"
              style={{ backgroundColor: toolProperties.color }}
              title="Color"
            />
            {showColorPicker && (
              <>
                {/* Backdrop overlay */}
                <div className="fixed inset-0 z-[9998]" onClick={() => setShowColorPicker(false)} />
                {/* Color picker */}
                <div 
                  ref={colorPickerRef}
                  className="absolute z-[9999] bg-white p-2 rounded-lg shadow-lg border border-gray-200"
                  style={{
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: '8px'
                  }}
                >
                  <HexColorPicker color={toolProperties.color} onChange={handleColorChange} />
                </div>
              </>
            )}
          </div>

          {/* Background Color (for shapes) */}
          {isShapeTool && (
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-8 h-8 rounded border-2 border-white border-opacity-50"
                style={{ backgroundColor: toolProperties.backgroundColor }}
                title="Background Color"
              />
            </div>
          )}

          {/* Stroke Width */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Size:</span>
            <div className="flex space-x-1">
              {brushSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => handleBrushSizeChange(size)}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    toolProperties.strokeWidth === size
                      ? 'border-white bg-white'
                      : 'border-white border-opacity-50 hover:border-opacity-75'
                  }`}
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                  }}
                  title={`${size}px`}
                />
              ))}
            </div>
          </div>

          {/* Text Properties */}
          {isTextTool && (
            <div className="flex items-center space-x-2">
              <select
                value={toolProperties.fontSize}
                onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                className="bg-white bg-opacity-20 text-white border border-white border-opacity-30 rounded px-2 py-1 text-sm"
              >
                {fontSizes.map((size) => (
                  <option key={size} value={size} className="text-black">
                    {size}px
                  </option>
                ))}
              </select>

              <select
                value={toolProperties.fontFamily}
                onChange={(e) => handleFontFamilyChange(e.target.value)}
                className="bg-white bg-opacity-20 text-white border border-white border-opacity-30 rounded px-2 py-1 text-sm"
              >
                {fontFamilies.map((family) => (
                  <option key={family} value={family} className="text-black">
                    {family}
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleFontWeightChange(toolProperties.fontWeight === 'bold' ? 'normal' : 'bold')}
                className={`p-1 rounded ${
                  toolProperties.fontWeight === 'bold' ? 'bg-white bg-opacity-20' : 'hover:bg-white hover:bg-opacity-10'
                }`}
                title="Bold"
              >
                <strong>B</strong>
              </button>

              <button
                onClick={() => handleFontStyleChange(toolProperties.fontStyle === 'italic' ? 'normal' : 'italic')}
                className={`p-1 rounded ${
                  toolProperties.fontStyle === 'italic' ? 'bg-white bg-opacity-20' : 'hover:bg-white hover:bg-opacity-10'
                }`}
                title="Italic"
              >
                <em>I</em>
              </button>
            </div>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onUndo}
            className="tool-button p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            title="Undo"
          >
            <UndoIcon className="h-5 w-5" />
          </button>

          <button
            onClick={onRedo}
            className="tool-button p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            title="Redo"
          >
            <RedoIcon className="h-5 w-5" />
          </button>

          <button
            onClick={onClearCanvas}
            className="tool-button p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            title="Clear Canvas"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Click outside to close color picker */}
      {showColorPicker && (
        <div
          className="color-picker-overlay"
          onClick={() => setShowColorPicker(false)}
        />
      )}
    </div>
  );
};

export default Toolbar; 