"use client"; // Đánh dấu component này là Client Component

import React, { useState } from 'react';

const FilterSidebar = () => {
  const [topicsExpanded, setTopicsExpanded] = useState(true);

  const toggleTopics = () => {
    setTopicsExpanded(!topicsExpanded);
  };

  return (
    <div className="w-1/4 bg-gray-100 rounded-lg shadow-md p-4 min-w-32">
      <div className="mb-4">
        <h3 className="font-semibold text-lg">Filter</h3>
      </div>

      {/* Topics Filter */}
      <div>
        <div className="flex justify-between items-center mb-2 cursor-pointer" onClick={toggleTopics}>
          <h4 className="font-small">Topics</h4>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${topicsExpanded ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {topicsExpanded && (
          <div>
            <div className="mb-2 text-sm">
              <input
                type="text"
                placeholder="Filter emails..."
                className="w-full px-3 py-2 border rounded-md outline-none"
              />
            </div>
            <div className="space-y-1 text-left text-sm">
              <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              Biology
              </label>
              <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              Computer and AI
              </label>
              <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              Software 1
              </label>
              <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              Software 2
              </label>
              <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              Software 3
              </label>
              <button className="text-blue-500 hover:text-blue-700 text-xs">
              Show more
              </button>
            </div>
            <div className="flex flex-wrap mt-2">
              <span className="bg-gray-200 text-gray-700 rounded-full px-2 py-1 text-xs mr-1 mb-1">Biology</span>
              <span className="bg-gray-200 text-gray-700 rounded-full px-2 py-1 text-xs mr-1 mb-1">Software and architecture</span>
              <span className="bg-gray-200 text-gray-700 rounded-full px-2 py-1 text-xs mr-1 mb-1">+4</span>
            </div>
          </div>
        )}
      </div>

      {/* Add more filter sections here as needed */}
    </div>
  );
};

export default FilterSidebar;