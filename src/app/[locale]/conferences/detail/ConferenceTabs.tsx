// ConferenceTabs.tsx

"use client";

import React, { useRef, useEffect, useState } from 'react';
import { ConferenceResponse } from '../../../../models/response/conference.response';
import Map from './Map';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface ConferenceTabsProps {
  conference: ConferenceResponse | null;
}

export const ConferenceTabs: React.FC<ConferenceTabsProps> = ({ conference }) => {
  const navRef = useRef<HTMLElement>(null);
  const [activeSection, setActiveSection] = useState<string>(''); // State to track the active tab

  // Define updatedSections *before* the useEffect hook
  const updatedSections = conference
    ? ['overview', 'important-date', 'Call for papers', 'category-topics', ...(conference.rankSourceFoRData && conference.rankSourceFoRData.length > 0 ? ['source'] : []), 'map']
    : []; // Default to empty array if conference is null



  useEffect(() => {
    const handleAnchorClick = (event: Event) => {
      event.preventDefault();
      const target = event.target as HTMLAnchorElement;
      const targetId = target.getAttribute('href')?.substring(1); // Get the section ID (e.g., "overview")

      if (targetId) {
        setActiveSection(targetId); // Update the active section state
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
          const targetHeading = targetSection.querySelector('h2');

          if (targetHeading) {
            const navElement = navRef.current;
            const navHeight = navElement ? navElement.offsetHeight : 0;
            const offset = 10;
            const targetPosition = targetHeading.offsetTop - navHeight - offset;

            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth',
            });
          }
        }
      }
    };

    const navLinks = navRef.current?.querySelectorAll('a') || [];
    navLinks.forEach(link => {
      link.addEventListener('click', handleAnchorClick);
    });


     const handleScroll = () => {
      if (!navRef.current) return;

      let currentSection = '';
      // Iterate through sections to find the one currently in view
      for (const sectionId of updatedSections) {
        const section = document.getElementById(sectionId);
        if (section) {
            const navElement = navRef.current;
            const navHeight = navElement ? navElement.offsetHeight : 0;

            const rect = section.getBoundingClientRect();
            // Check if the section is within the viewport, accounting for the nav height
            //Consider top
            if (rect.top <= navHeight+10) {  //+10 is a off set to active section
              currentSection = sectionId;
            }
        }
      }
      setActiveSection(currentSection); // Set the active section based on scroll position
    };


    window.addEventListener('scroll', handleScroll);


    return () => {
      navLinks.forEach(link => {
        link.removeEventListener('click', handleAnchorClick);
      });
       window.removeEventListener('scroll', handleScroll);
    };
  }, [updatedSections]); // Add updatedSections as a dependency

  const formatDate = (date: string): string => {
    if (!date) return 'TBD';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (!conference) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-500 text-lg">Loading conference details...</p>
      </div>
    );
  }

  const { organization, dates, rankSourceFoRData, locations } = conference;

  return (
    <div className="container mx-auto px-4 py-8">
      <nav
        ref={navRef}
        className="sticky top-14 bg-white bg-opacity-95 border-b border-gray-200 z-30 flex overflow-x-auto whitespace-nowrap py-2"
      >
        {updatedSections.map((section) => {
          let href = `#${section}`;
          if (section === 'Call for papers') {
            href = '#Call for papers'; // Correct href for "Call for Paper"
          }
          return (
            <a
              key={section}
              href={href}
              className={`px-6 py-2 rounded-lg transition-colors duration-200 font-medium ${
                activeSection === section ? 'text-blue-600 bg-gray-100' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              {section === 'Call for papers' ? "Call for papers" : section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </a>
          );
        })}
      </nav>

      {/* Sections (Rest of your component remains the same) */}
      <section id="overview" className="py-4 px-6 bg-white shadow-md rounded-lg mt-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Overview</h2>
        <p className="text-gray-700 leading-relaxed">
          {organization.summary}
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
                      <tr key={index} className="hover:bg-gray-50">
                          <td className="py-4 px-4 border-b border-gray-300">{dateItem.name}</td>
                          <td className="py-4 px-4 border-b border-gray-300">{formatDate(dateItem.fromDate)}</td>
                          <td className="py-4 px-4 border-b border-gray-300">{formatDate(dateItem.toDate)}</td>
                      </tr>
                    ))}
                </tbody>
            </table>
          </div>
        )}
      </section>

      <section id="Call for papers" className="py-4 px-6 bg-white shadow-md rounded-lg mt-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Call for Paper</h2>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={{
            div: ({ node, ...props }) => <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed" {...props} />,
          }}
        >
          {organization.callForPaper}
        </ReactMarkdown>
      </section>

      <section id="category-topics" className="py-4 px-6 bg-white shadow-md rounded-lg mt-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Category and Topics</h2>
        <div className="mb-6">
          <h3 className="text-xl font-medium text-gray-700 mb-2">Category</h3>
          <p className="text-gray-700">{organization.accessType}</p>
        </div>

        <div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">Topics</h3>
          {organization.topics && organization.topics.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 list-disc pl-5 text-gray-700">
              {organization.topics.map((topic, index) => (
                <li key={index}>{topic}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700">No topics available.</p>
          )}
        </div>
      </section>

      {rankSourceFoRData && rankSourceFoRData.length > 0 && (
        <section id="source" className="py-4 px-6 bg-white shadow-md rounded-lg mt-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Conference Ranks and Sources</h2>
          {rankSourceFoRData.map((rank, rankIndex) => (
            <div key={rankIndex} className="mb-8">
              <h3 className="text-2xl font-medium text-gray-700 mb-3">Rank: {rank.rank} - Source: {rank.source}</h3>
              <p className="text-gray-700">Research Field: {rank.researchFields}</p>
            </div>
          ))}
        </section>
      )}

      <section id="map" className="py-4 px-6 bg-white shadow-md rounded-lg mt-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Map</h2>
        <Map location={locations.country} />
      </section>
    </div>
  );
};