// src/app/[locale]/chatbot/livechat/layout/ConnectionStatus.tsx
import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaSpinner } from 'react-icons/fa';

type ConnectionStateType = 'connected' | 'error' | 'info' | 'connecting';

// Add the 'export' keyword here
export interface ConnectionStatusProps {
  status: ConnectionStateType;
  message: string | null;
  elapsedTime?: number; // This is already correct (number | undefined)
  onClose: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  message,
  elapsedTime,
  onClose, // Ensure this is used or remove if not
}) => {
  // ... rest of your component code
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  let IconComponent;
  let bgColor;
  let textColor = 'text-white';

  switch (status) {
    case 'connected':
      IconComponent = <FaCheckCircle className="text-green-300" size={24} />;
      bgColor = 'bg-green-600';
      break;
    case 'error':
      IconComponent = <FaTimesCircle className="text-red-300" size={24} />;
      bgColor = 'bg-red-600';
      break;
    case 'connecting':
      IconComponent = <FaSpinner className="animate-spin text-blue-300" size={24} />;
      bgColor = 'bg-blue-600';
      break;
    case 'info':
    default:
      IconComponent = <FaInfoCircle className="text-gray-300" size={24} />;
      bgColor = 'bg-gray-800';
      break;
  }

  // The onClose prop is passed but not used in the provided ConnectionStatus component.
  // If it's meant to be a close button, you'd need to add UI for it.
  // For now, I'll assume it might be used later or was part of a previous design.
  // If not needed, remove `onClose` from props and its usage.

  if (!message && status !== 'connecting' && status !== 'connected') {
    return null;
  }

  return (
    <div
      className={`fixed top-6
               left-1/2
               transform -translate-x-1/2
               ${bgColor} ${textColor}
               rounded-lg shadow-xl z-50
               flex items-center gap-3 p-2
               min-w-[250px] max-w-md
               transition-all duration-300 ease-in-out
               `}
      role="alert"
    >
      <div className="flex-shrink-0">{IconComponent}</div>
      <div className="flex-grow">
        {message && <p className="font-medium">{message}</p>}
        {status === 'connected' && elapsedTime !== undefined && (
          <p className="text-sm opacity-90">
            Connected for: {formatTime(elapsedTime)} / 10:00
          </p>
        )}
      </div>
      {/* Example of how onClose might be used, if you add a close button:
      <button onClick={onClose} className="ml-auto p-1 rounded-full hover:bg-white/20">
        <FaTimesCircle />
      </button>
      */}
    </div>
  );
};

export default ConnectionStatus;