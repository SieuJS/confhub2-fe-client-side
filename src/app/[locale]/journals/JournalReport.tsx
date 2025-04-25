"use client";

// src/app/[locale]/journal/JournalReport.tsx
import React, { useState } from 'react';
import Button from '../utils/Button'; // Import the Button component
import { JournalResponse } from '../../../models/response/journal.response'; // Import JournalResponse

interface JournalReportProps {
  journal: JournalResponse | undefined; // Make journal optional
}

const JournalReport: React.FC<JournalReportProps> = ({ journal }) => {
  const [isFullDescriptionVisible, setIsFullDescriptionVisible] = useState(false);

  //Handle journal being undefined

  if (!journal) {
    return <div>Journal not found</div>
  }


  const toggleDescription = () => {
    setIsFullDescriptionVisible(!isFullDescriptionVisible);
  };

  // Safely access bioxbio array and its elements
  const latestImpactFactor = journal.bioxbio && journal.bioxbio.length > 0 ? journal.bioxbio[0].Impact_factor : "N/A";
  const hIndex = journal["H index"];
  const sjr = journal.SJR;

  return (
    <div className="container mx-auto py-2 px-4  rounded-lg">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left section */}
        <div className="md:w-3/5">
          <h2 className="text-4xl font-bold mb-2">{journal.title}</h2>
          <p className="mb-4">
            Comprehensive information about the Journal, including Impact factor, H-index, subject Area, Category,
            Scope, ISSN.
          </p>
          <div className=" p-4 rounded-lg shadow-sm flex items-top mb-4 relative overflow-hidden bg-gradient-to-r from-background to-background-secondary">
            {/* Thumbnail */}
            <div className="relative w-50 h-30 mt-4 rounded-lg overflow-hidden">
              {/* Image */}
              <div className="relative w-40 h-56 rounded-lg overflow-hidden"> {/* Make sure the container has w-full and h-full */}

                <img
                  src={journal.Image || "/journal.jpg"}
                  alt={journal.Title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {/* Details */}
            <div className="flex-1 ml-8 flex flex-col justify-center">
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
                  <div className="text-2xl font-bold">N/A</div> {/* Overall Rank not available in provided JSON */}
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
                  <div className="text-2xl font-bold">{latestImpactFactor}</div>
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
                  <div className="text-2xl font-bold">{hIndex || "N/A"}</div>
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
                  <div className="text-2xl font-bold">{sjr || "N/A"}</div>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <Button
                  variant="primary"
                  rounded
                >
                  <a href={journal.Information?.Homepage || "#"}>Journal Website</a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        {/* CHANGE: Reduced padding from p-6 to p-4 */}
        <div className="md:w-2/5 bg-gradient-to-r from-background to-background-secondary p-4 rounded-lg shadow-md">
          <div className="overflow-x-auto relative">
            <table className="w-full text-md text-left border-collapse">
              <tbody>
                {/* CHANGE: Reduced py-2 to py-1 in all td elements */}
                <tr className="border-b  ">
                  <td className="px-3 py-1 font-semibold">Title</td>
                  <td className="px-3 py-1">{journal.Title}</td>
                </tr>
                <tr className="border-b  ">
                  <td className="px-3 py-1 font-semibold">Areas, Categories</td>
                  <td className="px-3 py-1">
                    {journal["Subject Area and Category"] ? (
                      <>
                        {journal["Subject Area and Category"]["Field of Research"]}
                        {journal["Subject Area and Category"].Topics.map((topic, index) => (
                          <span key={index}>
                            {index === 0 ? '; Categories: ' : ', '} {topic}
                          </span>
                        ))}
                      </>
                    ) : "N/A"}
                  </td>
                </tr>
                <tr className="border-b  ">
                  <td className="px-3 py-1 font-semibold">Publisher</td>
                  <td className="px-3 py-1">{journal.Publisher}</td> {/* Use journal.Publisher */}
                </tr>
                <tr className="border-b  ">
                  <td className="px-3 py-1 font-semibold">Country</td>
                  <td className="px-3 py-1">{journal.Country}</td> {/* Use journal.Country */}
                </tr>
                <tr className="border-b  ">
                  <td className="px-3 py-1 font-semibold">ISSN</td>
                  <td className="px-3 py-1">{journal.ISSN}</td> {/* Use journal.ISSN */}
                </tr>
                <tr className="border-b  ">
                  <td className="px-3 py-1 font-semibold">Best Quartile</td>
                  <td className="px-3 py-1">Q1</td> {/* Best Quartile is always Q1 according to SupplementaryTable, hardcoded for now, improve logic if needed */}
                </tr>
                <tr className="border-b  ">
                  <td className="px-3 py-1 font-semibold">Coverage History</td>
                  <td className="px-3 py-1">1999 - 2023</td> {/* Coverage history based on SupplementaryTable years, hardcoded for now, improve logic if needed */}
                </tr>
              </tbody>
            </table>
            {/* CHANGE: Reduced py-2 to py-1 and mt-4 to mt-2, removed mb-2 */}
            <Button
              className="font-semibold py-1 mt-2 w-full text-center"
              variant="primary"
            >
              Follow
            </Button>
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