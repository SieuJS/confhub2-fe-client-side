// ConferenceTabs.tsx
"use client";

import React, { useRef } from 'react';
import { ConferenceResponse } from '../../../../models/response/conference.response';
import Map from './Map';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import useSectionNavigation from '../../../../hooks/conferenceDetails/useSectionNavigation';
import useActiveSection from '../../../../hooks/conferenceDetails/useActiveSection';


interface ConferenceTabsProps {
  conference: ConferenceResponse | null;
}

export const ConferenceTabs: React.FC<ConferenceTabsProps> = ({ conference }) => {
  const navRef = useRef<HTMLElement>(null);

  // Dynamically create the sections array.  Include 'source-rank' only if ranks exist.
  const updatedSections = conference
    ? ['overview', 'important-date', 'Call for papers', 'category-topics', ...(conference.ranks && conference.ranks.length > 0 ? ['source-rank'] : []), 'map']
    : [];

  const { activeSection, setActiveSection } = useActiveSection({ navRef, updatedSections });
  useSectionNavigation({ navRef, setActiveSection });


  const formatDate = (date: string | null | undefined): string => {
    if (!date) return 'TBD';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (!conference) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-500 text-lg">Loading conference details...</p>
      </div>
    );
  }

  const organization = conference.organization;
  const dates = conference.dates;
  const ranks = conference.ranks;
  const location = conference.location;

  return (
    <div className="container mx-auto px-4 py-8">
      <nav
        ref={navRef}
        className="sticky top-14 bg-white bg-opacity-95 border-b border-gray-200 z-30 flex overflow-x-auto whitespace-nowrap py-2"
      >
        {updatedSections.map((section) => {
          let href = `#${section}`;
          //Special handling for "Call for papers", because the space isn't allowed in URL fragments.
          if (section === 'Call for papers') {
            href = '#Call for papers'; // Correct href
          }

          return (
            <a
              key={section}
              href={href}
              className={`px-6 py-2 rounded-lg transition-colors duration-200 font-medium ${activeSection === section ? 'text-blue-600 bg-gray-100' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                }`}
            >
              {/* Display section name.  Convert kebab-case to title case. */}
              {section === 'Call for papers' ? "Call for papers" : section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </a>
          );
        })}
      </nav>

      {/* Sections */}
      <section id="overview" className="py-4 px-6 bg-white shadow-md rounded-lg mt-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Overview</h2>
        <p className="text-gray-700 leading-relaxed">
          {organization?.summerize || "No summerize available."}
        </p>
      </section>

      <section id="important-date" className="py-4 px-6 bg-white shadow-md rounded-lg mt-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Important Dates</h2>
        {(!dates || dates.length === 0) ? (
          <p className="text-gray-700">No Important Dates Available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="py-3 px-4 border-b border-gray-300 text-left">Name</th>
                  <th className="py-3 px-4 border-b border-gray-300 text-left">From Date</th>
                  <th className="py-3 px-4 border-b border-gray-300 text-left">To Date</th>
                </tr>
              </thead>
              <tbody>
                {dates.map((dateItem, index) => (
                  dateItem &&  // Check if dateItem is not null
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-4 px-4 border-b border-gray-300">{dateItem?.name || "N/A"}</td>
                    <td className="py-4 px-4 border-b border-gray-300">{formatDate(dateItem?.fromDate)}</td>
                    <td className="py-4 px-4 border-b border-gray-300">{formatDate(dateItem?.toDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section id="Call for papers" className="py-4 px-6 bg-white shadow-md rounded-lg mt-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Call for Papers</h2>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]} // Added remarkBreaks

        >
          {organization?.callForPaper || "No call for papers available."}
        </ReactMarkdown>
      </section>

      <section id="category-topics" className="py-4 px-6 bg-white shadow-md rounded-lg mt-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Category and Topics</h2>
        <div className="mb-6">
          <h3 className="text-xl font-medium text-gray-700 mb-2">Category</h3>
          {/* Optional Chaining for accessType */}
          <p className="text-gray-700">{organization?.accessType || "Category not available."}</p>
        </div>

        <div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">Topics</h3>
          {organization?.topics && organization.topics.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 list-disc pl-5 text-gray-700">
              {organization.topics.map((topic, index) => (
                <li key={index}>{topic}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700">No topics available.</p>
          )}
        </div>
      </section>

      {/* Source Rank Section (Conditional) */}
      {ranks && ranks.length > 0 && (
        <section id="source-rank" className="py-4 px-6 bg-white shadow-md rounded-lg mt-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Source Rank</h2>
          {ranks.map((rank, index) => (
            <div key={index} className="mb-4 border-b border-gray-200 pb-4">
              <h3 className="text-xl font-medium text-gray-700 mb-2">{rank.source}</h3>
              <p className="text-gray-600">
                <strong>Rank:</strong> {rank.rank}
              </p>
              <p className="text-gray-600">
                <strong>Field of Research:</strong> {rank.fieldOfResearch}
              </p>
            </div>
          ))}
        </section>
      )}

      <section id="map" className="py-4 px-6 bg-white shadow-md rounded-lg mt-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Map</h2>
        {/* Conditionally render Map based on location?.address */}
        {location?.address ? (
          <Map location={location.address} />
        ) : (
          <p className="text-gray-700">Location information is not available.</p>
        )}
      </section>
    </div>
  );
};