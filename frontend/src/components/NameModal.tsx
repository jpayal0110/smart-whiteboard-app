import React, { useState, useEffect } from 'react';

interface NameModalProps {
  isOpen: boolean;
  onSubmit: (name: string) => void;
  pendingAction: null | 'create' | 'join';
  setPendingAction: React.Dispatch<React.SetStateAction<null | 'create' | 'join'>>;
}

const NameModal: React.FC<NameModalProps> = ({ isOpen, onSubmit, pendingAction, setPendingAction }) => {
  const [name, setName] = useState('');

  // Clear name when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (name) {
      onSubmit(name);
    }
  };

  const getButtonText = () => {
    switch (pendingAction) {
      case 'create':
        return 'Create Room';
      case 'join':
        return 'Join Room';
      default:
        return 'Continue';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-center">What's your name?</h2>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-4 py-2 mb-4"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && name && handleSubmit()}
        />
        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          disabled={!name}
          onClick={handleSubmit}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};

export default NameModal;