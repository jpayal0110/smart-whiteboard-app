import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import NameModal from './NameModal.tsx';
import {
  PencilIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const HomePage: React.FC = () => {
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | 'create' | 'join'>(null);


  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }
    if (!userName) {
      setPendingAction('create');
      setShowNameModal(true);
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ room_name: roomName }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Room created successfully!');
        navigate(`/whiteboard/${data.room_id}`);
      } else {
        throw new Error('Failed to create room');
      }
    } catch (error) {
      toast.error('Failed to create room. Please try again.');
      console.error('Error creating room:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      toast.error('Please enter a room ID');
      return;
    }
    if (!userName) {
      setPendingAction('join');
      setShowNameModal(true);
      return;
    }

    setIsJoining(true);
    try {
      // Verify room exists by trying to get room info
      const response = await fetch(`http://localhost:8000/api/v1/rooms/${roomId}`);
      if (response.ok) {
        toast.success('Joining room...');
        navigate(`/whiteboard/${roomId}`);
      } else {
        toast.error('Room not found. Please check the room ID.');
      }
    } catch (error) {
      toast.error('Failed to join room. Please try again.');
      console.error('Error joining room:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleNameSubmit = (name: string) => {
    setUserName(name);
    localStorage.setItem('userName', name);
    setShowNameModal(false);
    
    // Execute the pending action after setting the name
    if (pendingAction === 'create') {
      setPendingAction(null);
      handleCreateRoom();
    } else if (pendingAction === 'join') {
      setPendingAction(null);
      handleJoinRoom();
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                <PencilIcon className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Smart Whiteboard
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AI-powered collaborative whiteboard for seamless real-time drawing,
              shape detection, and handwriting recognition.
            </p>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-8 mb-20"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Collaboration</h3>
            <p className="text-gray-600">
              Draw together with multiple users in real-time using WebSocket technology.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <SparklesIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Features</h3>
            <p className="text-gray-600">
              Shape detection, OCR, and smart suggestions enhance your drawing experience.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <PencilIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Tools</h3>
            <p className="text-gray-600">
              Professional drawing tools with color picker, shapes, and eraser.
            </p>
          </div>

        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-0"
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to start drawing?
          </h3>
          <p className="text-gray-600 mb-6">
            Join thousands of users creating amazing content together.
          </p>
          {/* <button
            onClick={handleJoinRandomRoom}
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            Get Started Now
            <ArrowRightIcon className="h-5 w-5 ml-2" />
          </button> */}
        </motion.div>
        {/* Create Room Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Start Collaborating
          </h2>

          <div className="max-w-md mx-auto space-y-6">
            <div>
              <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-2">
                Room Name
              </label>
              <input
                type="text"
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
              />
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isCreating ? (
                <>
                  <div className="spinner mr-2"></div>
                  Creating Room...
                </>
              ) : (
                <>
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Create New Room
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-2">
                Room ID
              </label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID to join..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
              />
            </div>

            <button
              onClick={handleJoinRoom}
              disabled={isJoining}
              className="w-full bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isJoining ? (
                <>
                  <div className="spinner mr-2"></div>
                  Joining Room...
                </>
              ) : (
                'Join Room'
              )}
            </button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 Smart Whiteboard. Built with React, FastAPI, and AI.
          </p>
        </div>
      </footer>
      <NameModal 
        isOpen={showNameModal} 
        onSubmit={handleNameSubmit} 
        pendingAction={pendingAction}
        setPendingAction={setPendingAction}
      />
    </div>
  );
};

export default HomePage; 