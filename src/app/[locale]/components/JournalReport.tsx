"use client";

// components/JournalReport.tsx
import React, { useState } from 'react';

const JournalReport: React.FC = () => {
  const [isFullDescriptionVisible, setIsFullDescriptionVisible] = useState(false);

  const toggleDescription = () => {
    setIsFullDescriptionVisible(!isFullDescriptionVisible);
  };

  return (
    <div className="container mx-auto py-6 px-4 bg-gray-100 rounded-lg">
      <nav className="container mx-auto text-blue-600 mb-6  text-sm bg-gray-100 rounded-lg">
        <a href="#" className="hover:underline"><strong> Home</strong></a>
        <span className="mx-2"></span>
        <a href="#" className="hover:underline"><strong> Journals</strong></a>
        <span className="mx-2"></span>
        <a href="#" className="hover:underline"><strong> Nature</strong></a>
      </nav>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left section */}
        <div className="md:w-3/5">
          <h2 className="text-4xl font-bold text-gray-700 mb-2">Ca-A Cancer Journal for Clinicians</h2>
          <p className="text-gray-600 mb-4">
            Comprehensive information about the Journal, including Impact factor, H-index, subject Area, Category,
            Scope, ISSN.
          </p>
          <div className="bg-white p-4 rounded-lg shadow-sm flex items-top mb-4 relative overflow-hidden">
            {/* Thumbnail */}
            <div className="relative w-50 h-30 mt-4 rounded-lg overflow-hidden">
              {/* Image */}
              <div className="relative">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQB9vnAC61Nfzvu5qQjGARgJIFxPUGSsmzCJg&s"
                  alt="conference image"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            {/* Details */}
            <div className="flex-1 text-gray-600 ml-8 flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div
                  className="flex flex-col items-center justify-center bg-blue-100 text-blue-700 text-lg font-medium rounded-lg p-5 shadow-md"
                >
                  <div className="flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"></path>
                    </svg>
                    Overall Rank
                  </div>
                  <div className="text-2xl font-bold">1</div>
                </div>
                <div
                  className="flex flex-col items-center justify-center bg-green-100 text-green-700 text-lg font-medium rounded-lg p-5 shadow-md"
                >
                  <div className="flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M6 2a1 1 0 011 1v14a1 1 0 01-2 0V3a1 1 0 011-1zm8 0a1 1 0 011 1v14a1 1 0 01-2 0V3a1 1 0 011-1zm-4 4a1 1 0 011 1v10a1 1 0 01-2 0V7a1 1 0 011-1z"
                      ></path>
                    </svg>
                    Impact Factor
                  </div>
                  <div className="text-2xl font-bold">69.5</div>
                </div>
                <div
                  className="flex flex-col items-center justify-center bg-yellow-100 text-yellow-700 text-lg font-medium rounded-lg p-5 shadow-md"
                >
                  <div className="flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm8-6a6 6 0 100 12A6 6 0 0010 4zm1 5a1 1 0 00-2 0v2a1 1 0 102 0V9z"
                      ></path>
                    </svg>
                    H-index
                  </div>
                  <div className="text-2xl font-bold">1058</div>
                </div>
                <div
                  className="flex flex-col items-center justify-center bg-red-100 text-red-700 text-lg font-medium rounded-lg p-5 shadow-md"
                >
                  <div className="flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M5 2a1 1 0 011 1v2h8V3a1 1 0 112 0v2h1a1 1 0 011 1v4a1 1 0 01-1 1h-1v4a1 1 0 01-2 0v-4H6v4a1 1 0 01-2 0v-4H3a1 1 0 01-1-1V6a1 1 0 011-1h1V3a1 1 0 011-1zm2 6h6V7H7v1z"
                      ></path>
                    </svg>
                    SJR
                  </div>
                  <div className="text-2xl font-bold">15.993</div>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <a
                  href="https://www.acmmultimedia.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-500 text-white text-lg font-medium rounded-full px-6 py-3 hover:bg-blue-600 transition duration-200"
                >
                  Journal Website
                </a>
              </div>
            </div>
          </div>

          <div className="text-gray-700 mb-4" id="description-container">
            <p className="text-gray-700 text-md mb-1">
              <Strong>Scope</Strong>
            </p>
            <p className="text-gray-700">
              CA provides cancer care professionals with up-to-date information on all aspects of cancer
              diagnosis, treatment, and prevention.
            </p>
            <div id="full-description" className={isFullDescriptionVisible ? '' : 'hidden'}>
              <p className="mt-3">
                The journal focuses on keeping physicians and healthcare professionals informed by providing
                scientific and educational information in the form of comprehensive review articles and online
                continuing education activities on important cancer topics and issues that are important to
                cancer care, along with publishing the latest cancer guidelines and statistical articles
                from the American Cancer Society.
              </p>
              <p className="mt-3">
                This report provides an in-depth look into the conference scope, key speakers, schedule,
                and much more.
              </p>
            </div>
            <button
              onClick={toggleDescription}
              className="text-blue-500 mt-2 hover:underline font-semibold flex items-center"
            >
              {isFullDescriptionVisible ? 'Hide' : 'Read more'}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                stroke="currentColor" className="w-4 h-4 ml-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="md:w-2/5 bg-white p-6 rounded-lg shadow-md text-gray-700">
          <div className="overflow-x-auto relative">
            <table className="w-full text-md text-left text-gray-700 border-collapse">
              <thead className="text-md text-gray-800 bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 font-semibold text-left">Title</th>
                  <th scope="col" className="px-6 py-3 font-semibold text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b odd:bg-white even:bg-gray-200">
                  <td className="px-6 py-2 font-semibold">Title</td>
                  <td className="px-6 py-2">Ca-A Cancer Journal for Clinicians</td>
                </tr>
                <tr className="border-b odd:bg-white even:bg-gray-200">
                  <td className="px-6 py-2 font-semibold">Abbreviation</td>
                  <td className="px-6 py-2">Ca-Cancer J. Clin.</td>
                </tr>
                <tr className="border-b odd:bg-white even:bg-gray-200">
                  <td className="px-6 py-2 font-semibold">Publication Type</td>
                  <td className="px-6 py-2">Journal</td>
                </tr>
                <tr className="border-b odd:bg-white even:bg-gray-200">
                  <td className="px-6 py-2 font-semibold">Subject Area, Categories, Scope</td>
                  <td className="px-6 py-2">Hematology (Q1); Oncology (Q1)</td>
                </tr>
                <tr className="border-b odd:bg-white even:bg-gray-200">
                  <td className="px-6 py-2 font-semibold">Publisher</td>
                  <td className="px-6 py-2">Wiley-Blackwell</td>
                </tr>
                <tr className="border-b odd:bg-white even:bg-gray-200">
                  <td className="px-6 py-2 font-semibold">Country</td>
                  <td className="px-6 py-2">United States</td>
                </tr>
                <tr className="border-b odd:bg-white even:bg-gray-200">
                  <td className="px-6 py-2 font-semibold">ISSN</td>
                  <td className="px-6 py-2">15424863, 00079235</td>
                </tr>
                <tr className="border-b odd:bg-white even:bg-gray-200">
                  <td className="px-6 py-2 font-semibold">Best Quartile</td>
                  <td className="px-6 py-2">Q1</td>
                </tr>
                <tr className="border-b odd:bg-white even:bg-gray-200">
                  <td className="px-6 py-2 font-semibold">Coverage History</td>
                  <td className="px-6 py-2">1950-2023</td>
                </tr>
              </tbody>
            </table>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded py-2 mb-2 mt-4 w-full text-center transition duration-200 ease-in-out"
            >
              Add to favorite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalReport;

const Strong: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <strong className="font-semibold">{children}</strong>
);