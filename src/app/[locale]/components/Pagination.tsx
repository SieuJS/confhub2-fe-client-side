import React from 'react';

const Pagination = () => {
  return (
    <div className="flex items-center justify-center mt-8">
      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md px-4 py-2 mr-2">
         Previous
      </button>
      <button className="bg-white hover:bg-gray-100 text-gray-700 rounded-md px-4 py-2 mr-1">1</button>
      <button className="bg-white hover:bg-gray-100 text-gray-700 rounded-md px-4 py-2 mr-1">2</button>
      <button className="bg-white hover:bg-gray-100 text-gray-700 rounded-md px-4 py-2 mr-1">3</button>
      <span className="text-gray-500 mr-1">...</span>
      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md px-4 py-2">
        Next 
      </button>
    </div>
  );
};

export default Pagination;