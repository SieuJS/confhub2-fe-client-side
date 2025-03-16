
import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="bg-gradient-to-r to-background-secondary min-h-screen flex items-center justify-center">
      {/* Add a loading spinner container */}
      <div className="flex flex-col items-center bg-white/80 p-6 rounded-lg">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div> {/* Spinner */}
        <span className="ml-2 text-xl text-gray-800 mt-4">Loading ...</span>
      </div>
    </div>
  );
};

export default Loading;