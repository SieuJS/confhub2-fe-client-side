// PopularConferences.tsx
"use client";

import React, { useRef } from 'react';
// import Image from 'next/image'; // No longer needed, EventCard handles it
import { useTranslations } from 'next-intl'
import usePopularConferences from '../../../hooks/home/usePopularConferences'; // Import hook
import EventCard from '../conferences/EventCard'; // Import EventCard



const PopularConferences: React.FC = () => {
  const t = useTranslations('');
  const {
    listConferences,
    isHovered,
    displayedCards,
    loading,
    scroll,
    handleMouseEnter,
    handleMouseLeave,
    visibleCount,
  } = usePopularConferences(3);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardWidth = 250;  // Width of the card itself
  const gap = 16;        // Gap between cards
  const containerWidth = cardWidth * visibleCount + gap * (visibleCount - 1); // Correct total width

  return (
    <section id="organizers" className="m-6 px-8 pt-10">
      <h1 className="text-2xl font-bold text-center mb-6">{t('Popular_Conferences')}</h1>
      {!loading && <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 focus:outline-none"
        >
          <img src="https://cdn-icons-png.flaticon.com/512/271/271220.png" alt="Left" className="w-4 h-4" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 focus:outline-none"
        >
          <img src="https://cdn-icons-png.flaticon.com/512/271/271228.png" alt="Right" className="w-4 h-4" />
        </button>

        <div id="organizer" className="flex overflow-x-hidden w-full justify-center" ref={scrollerRef} >
          <div className="flex transition-transform duration-500 ease-in-out" style={{ width: `${containerWidth}px` }}>
            {displayedCards.map((conference, index) => (
                conference && <EventCard
                  key={conference.id}
                  event={conference}
                  className={`flex-shrink-0 mr-[${gap}px]`} // Add flex-shrink-0 and margin
                  style={{ width: `${cardWidth}px`, height: 'fit-content' }} // Set consistent width

                />
            ))}
          </div>
        </div>
      </div>}
      {loading && <div className='text-center'>Loading...</div>}
    </section>
  );
};

export default PopularConferences;