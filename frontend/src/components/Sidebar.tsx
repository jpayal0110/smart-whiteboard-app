import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  XMarkIcon,
  PhotoIcon,
  DocumentIcon,
  FaceSmileIcon,
  FolderIcon,
  DocumentTextIcon,
  DocumentArrowUpIcon,
} from '@heroicons/react/24/outline';
import { SidebarProps } from '../types';

const Sidebar: React.FC<SidebarProps> = ({
  onClose,
  roomId,
  onInsertImage,
  onInsertEmoji,
  onInsertFile,
}) => {
  const [activeTab, setActiveTab] = useState<'insert' | 'files' | 'settings'>('insert');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        onInsertImage(file);
      } else {
        onInsertFile(file);
      }
    });
  }, [onInsertImage, onInsertFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.md'],
    },
  });

  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
    '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧',
    '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
    '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '💩', '👻', '💀',
    '☠️', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽',
  ];

  const handleEmojiClick = (emoji: string) => {
    onInsertEmoji(emoji);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl border-l border-gray-200 z-40">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Insert & Tools</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('insert')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'insert'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Insert
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'files'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Files
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Settings
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'insert' && (
            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Upload Files</h3>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragActive
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  {isDragActive ? (
                    <p className="text-blue-600">Drop files here...</p>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-2">
                        Drag & drop files here, or click to select
                      </p>
                      <p className="text-xs text-gray-500">
                        Supports: Images, PDFs, Text files
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Insert Buttons */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Insert</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <PhotoIcon className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="text-sm text-gray-700">Image</span>
                  </button>
                  <button
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <DocumentIcon className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="text-sm text-gray-700">Document</span>
                  </button>
                </div>
              </div>

              {/* Emojis */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Emojis</h3>
                <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => handleEmojiClick(emoji)}
                      className="p-2 text-lg hover:bg-gray-100 rounded transition-colors"
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hidden file inputs */}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onInsertImage(file);
                }}
              />
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.txt,.md,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onInsertFile(file);
                }}
              />
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Recent Files</h3>
              <div className="space-y-2">
                <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                  <DocumentTextIcon className="h-8 w-8 text-blue-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Meeting Notes.pdf</p>
                    <p className="text-xs text-gray-500">Added 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                  <PhotoIcon className="h-8 w-8 text-green-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Diagram.png</p>
                    <p className="text-xs text-gray-500">Added 1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Canvas Settings</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grid Size
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-lg">
                  <option value="10">10px</option>
                  <option value="20" selected>20px</option>
                  <option value="50">50px</option>
                  <option value="100">100px</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Show Grid</span>
                <button className="w-10 h-6 bg-gray-200 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform"></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Snap to Grid</span>
                <button className="w-10 h-6 bg-gray-200 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform"></div>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canvas Background
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {['#ffffff', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280'].map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded border-2 border-gray-300"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 