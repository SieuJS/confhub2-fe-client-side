// components/ConnectionStatus.tsx
import React from 'react';

interface ConnectionStatusProps {
  message: string | null;
  elapsedTime?: number; // Optional, only show if connected
  onClose: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ message, elapsedTime, onClose }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white rounded-md p-4 shadow-lg z-50">
      {message && <div>{message}</div>}
      {elapsedTime !== undefined && (
        <div>{formatTime(elapsedTime)} minutes</div>
      )}
      <button
        onClick={onClose}
        className="absolute top-1 right-1 p-1 bg-gray-600 text-white rounded-full hover:bg-gray-700 focus:outline-none transition-all duration-200"
        title="Close"
      >
        ×
      </button>
    </div>
  );
};

export default ConnectionStatus;