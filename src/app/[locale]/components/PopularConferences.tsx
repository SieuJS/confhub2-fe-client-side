"use client";

import React, { useRef, useEffect } from 'react';
import Image from 'next/image'; // Import Image from next/image

interface Conference {
  image: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  topics: string[];
}

const PopularConferences = () => {
  const conferences: Conference[] = [
    {
      image: '/bg-2.jpg',
      title: 'Tech Innovation Summit',
      startDate: '2024-03-15',
      endDate: '2024-03-17',
      location: 'New York City, USA',
      topics: ['Artificial Intelligence', 'Cloud Computing', 'Cybersecurity'],
    },
    {
      image: '/bg-2.jpg',
      title: 'Global Marketing Conference',
      startDate: '2024-04-22',
      endDate: '2024-04-24',
      location: 'London, UK',
      topics: ['Digital Marketing', 'Brand Strategy', 'Consumer Behavior'],
    },
    {
      image: '/bg-2.jpg',
      title: 'Sustainable Development Forum',
      startDate: '2024-05-10',
      endDate: '2024-05-12',
      location: 'Geneva, Switzerland',
      topics: ['Renewable Energy', 'Environmental Conservation', 'Social Impact'],
    },
    {
      image: '/bg-2.jpg',
      title: 'Future of Education Symposium',
      startDate: '2024-06-05',
      endDate: '2024-06-07',
      location: 'Sydney, Australia',
      topics: ['EdTech', 'Online Learning', 'Skills Development'],
    },
    {
      image: '/bg-2.jpg',
      title: 'Artificial Intelligence in Healthcare Congress',
      startDate: '2024-07-12',
      endDate: '2024-07-14',
      location: 'San Francisco, USA',
      topics: ['AI in Diagnostics', 'Medical Imaging', 'Healthcare Innovation'],
    },
  ];

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      scrollRight();
    }, 3000); // Scroll every 3 seconds

    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, []);


  const scrollLeft = () => {
    if (containerRef.current) {
      if (containerRef.current.scrollLeft === 0) {
        containerRef.current.scrollLeft = containerRef.current.scrollWidth - containerRef.current.offsetWidth;
      } else {
        containerRef.current.scrollLeft -= containerRef.current.offsetWidth;
      }
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      if (containerRef.current.scrollLeft >= containerRef.current.scrollWidth - containerRef.current.offsetWidth) {
        containerRef.current.scrollLeft = 0;
      } else {
        containerRef.current.scrollLeft += containerRef.current.offsetWidth;
      }
    }
  };


  return (
    <section>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Popular Conferences</h1>
          </div>
          <div className="flex space-x-2">
            <button className="bg-gray-100 rounded-full p-2 hover:bg-gray-200 flex items-center justify-center" onClick={scrollLeft} aria-label="Scroll conferences to left">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </button>
            <button className="bg-gray-100 rounded-full p-2 hover:bg-gray-200 flex items-center justify-center" onClick={scrollRight} aria-label="Scroll conferences to right">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </div>
        <div ref={containerRef} className="flex overflow-x-auto space-x-6 pb-4 scroll-smooth">
          {conferences.map((conference, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md w-80 flex-none">
              <Image
                src={conference.image}
                alt={conference.title}
                className="rounded-t-lg object-cover"
                width={320}
                height={192}
              />
              <div className="p-4">
                <h3 className="font-bold text-lg mt-2">{conference.title}</h3>
                <p className="text-sm mt-1">
                  {formatDate(conference.startDate)} - {formatDate(conference.endDate)}
                </p>
                <p className="text-sm mt-1">{conference.location}</p>
                <div className="mt-2">
                  <p className="text-sm font-semibold">Topics:</p>
                  <ul className="list-disc list-inside text-sm">
                    {conference.topics.map((topic, topicIndex) => (
                      <li key={topicIndex}>{topic}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularConferences;