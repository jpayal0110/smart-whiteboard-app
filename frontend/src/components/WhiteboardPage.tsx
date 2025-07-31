import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import WhiteboardCanvas from './WhiteboardCanvas.tsx';
import Toolbar from './Toolbar.tsx';
import Sidebar from './Sidebar.tsx';
import { useWhiteboardStore } from '../hooks/useWhiteboardStore.ts';
import { ToolType, ToolProperties, CanvasState, CanvasElement } from '../types';

const WhiteboardPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState(1);
  const [showSidebar, setShowSidebar] = useState(false);
  const [roomName, setRoomName] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  const {
    currentTool,
    toolProperties,
    canvasState,
    elements,
    setCurrentTool,
    setToolProperties,
    setCanvasState,
    clearCanvas,
    addElement,
    undo,
    createImage,
    createText,
  } = useWhiteboardStore();

  useEffect(() => {
    setUserName(localStorage.getItem('userName') || '');
  }, []);

  useEffect(() => {
    if (!roomId) {
      toast.error('No room ID provided');
      navigate('/');
      return;
    }

    // Initialize Socket.IO connection
    socketRef.current = io('http://localhost:8000', {
      transports: ['websocket'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      toast.success('Connected to room!');

      // Join the room
      socket.emit('join_room', { room: roomId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      toast.error('Disconnected from room');
    });

    socket.on('user_joined_room', (data) => {
      setActiveUsers(data.active_users);
      toast.success('Someone joined the room!');
    });

    socket.on('user_left_room', (data) => {
      setActiveUsers(data.active_users);
      toast('Someone left the room');
    });

    socket.on('drawing_update', (data) => {
      // Handle incoming drawing data from other users
      console.log('Received drawing update:', data);
      if (data.element) {
        addElement(data.element);
      }
    });

    socket.on('canvas_cleared', (data) => {
      clearCanvas();
      toast('Canvas was cleared by another user');
    });

    fetch(`http://localhost:8000/api/v1/rooms/${roomId}`)
      .then(res => res.json())
      .then(data => {
        setRoomName(data.name || 'Untitled Room');
      })
      .catch(() => setRoomName('Untitled Room'));

    return () => {
      if (socket) {
        socket.emit('leave_room', { room: roomId });
        socket.disconnect();
      }
    };
  }, [roomId, navigate, clearCanvas, addElement]);

  const handleDraw = (drawingData: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('draw_data', {
        ...drawingData,
        room: roomId,
      });
    }
  };

  const handleToolChange = (tool: ToolType) => {
    console.log('Handling tool change:', tool);
    setCurrentTool(tool);
  };

  const handlePropertyChange = (property: keyof ToolProperties, value: any) => {
    setToolProperties({ [property]: value });
  };

  const handleClearCanvas = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('clear_canvas', { room: roomId });
    }
    clearCanvas();
  };

  const handleUndo = () => {
    undo();
  };

  const handleRedo = () => {
    // TODO: Implement redo functionality
    toast('Redo functionality coming soon!');
  };

  const handleInsertImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const imageElement = createImage(src, { x: 100, y: 100 }, {
          width: img.width,
          height: img.height,
        });
        handleDraw({ type: 'image', element: imageElement });
        toast.success('Image added to canvas!');
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleInsertEmoji = (emoji: string) => {
    const textElement = createText(emoji, { x: 100, y: 100 });
    handleDraw({ type: 'text', element: textElement });
    toast.success('Emoji added to canvas!');
  };

  const handleInsertFile = (file: File) => {
    if (file.type === 'application/pdf') {
      toast.success('PDF file added! (Preview coming soon)');
    } else {
      toast.success('File added to canvas!');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Home
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-xl font-semibold text-gray-900">
              Room: {roomName}
            </h1>
            <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full">
              {userName || 'Anonymous'}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Active Users */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {activeUsers} user{activeUsers !== 1 ? 's' : ''} online
              </span>
            </div>

            {/* Share Room Button */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Room link copied to clipboard!');
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Share Room
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar
            onClose={() => setShowSidebar(false)}
            roomId={roomId || ''}
            onInsertImage={handleInsertImage}
            onInsertEmoji={handleInsertEmoji}
            onInsertFile={handleInsertFile}
          />
        )}

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <Toolbar
            currentTool={currentTool}
            toolProperties={toolProperties}
            onToolChange={handleToolChange}
            onPropertyChange={handlePropertyChange}
            onClearCanvas={handleClearCanvas}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />

          {/* Canvas */}
          <div className="flex-1 p-4">
            <WhiteboardCanvas
              onDraw={handleDraw}
              currentTool={currentTool}
              toolProperties={toolProperties}
              canvasState={canvasState}
            />
          </div>
        </div>
      </div>

      {/* Connection Status Toast */}
      {!isConnected && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          Connecting to room...
        </div>
      )}
    </div>
  );
};

export default WhiteboardPage; 