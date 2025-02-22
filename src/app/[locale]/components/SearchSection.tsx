"use client";

import React from 'react';
import { useState } from 'react';
import Button from './Button'; // Import your Button component

const SearchSection = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className="container mx-auto px-4">
      <div className=" rounded-full shadow-md flex items-center py-8 px-4 space-x-4 ">
        {/* Search Input */}
        <div className="flex items-center flex-grow ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            placeholder="Type a command or search..."
            className="outline-none w-full bg-transparent"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Separators */}
        <div className="border-l border-gray-300 h-6"></div>

        {/* Date Button */}
        <button className=" flex items-center space-x-2 bg-transparent  outline-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 015.25 16.5h13.5A2.25 2.25 0 0121 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
          <span>Date</span>
        </button>

        {/* Separators */}
        <div className="border-l border-gray-300 h-6"></div>

        {/* Location Button */}
        <button className=" flex items-center space-x-2 bg-transparent  outline-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
            />
          </svg>
          <span>Location</span>
        </button>

        {/* Separators */}
        <div className="border-l border-gray-300 h-6"></div>

        {/* Type Button */}
        <button className=" flex items-center space-x-2 bg-transparent  outline-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
          <span>Type</span>
        </button>

        {/* Search Button */}
        <Button variant="primary" size="large" rounded className="">
          Search
        </Button>
      </div>

      {/* <div className="flex items-center mt-4 ">
        <a href="#" className="mr-2 ">
          Home
        </a>
        <span></span>
        <span className="ml-2">Search</span>
      </div> */}
    </div>
  );
};

export default SearchSection;