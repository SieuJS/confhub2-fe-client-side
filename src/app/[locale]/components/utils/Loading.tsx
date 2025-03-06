// components/utils/NotFoundPage.tsx  (or wherever you put this component)
import React from 'react';
import Button from './Button'; // Make sure the path is correct
import Link from 'next/link';

const Loading: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-background to-background-secondary min-h-screen flex items-center justify-center opacity-50">
        {/* Add a loading spinner container */}
        <div className="flex justify-center items-center mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div> {/* Spinner */}
            <span className='ml-2 text-xl'>Loading ...</span>
        </div>
    </div>
  );
};

export default Loading;