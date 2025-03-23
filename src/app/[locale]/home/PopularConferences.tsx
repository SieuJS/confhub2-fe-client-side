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
  const transitionDuration = 500;


  return (
    <>
    {listConferences && listConferences.length > 0 && 
    <section id="organizers" className="m-6 px-8 pt-10 ">
      <style jsx>{`
        .card {
          transition: transform ${transitionDuration}ms ease-in-out, opacity ${transitionDuration}ms ease-in-out;
          position: absolute;
          opacity: 0;
          transform: translateX(100%);
        }

        .card-active {
          transform: translateX(0);
          opacity: 1;
          position: relative;
          z-index: 10;
        }
        .card-leaving {
          opacity: 0;
          transform: translateX(${scroll.name === 'left' ? '-100%' : '100%'});
          z-index: 5;
        }
      `}</style>
      <h1 className="text-2xl font-bold text-center mb-6">{t('Popular_Conferences')}</h1>
      <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
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
          <div className="flex relative">
            {displayedCards.map((conference, index) => {
              const isActive = index >= 1 && index <= 3;
              const relativeIndex = index - 2;
              const position = `calc(${relativeIndex * (80 + 8)}px)`;


              return (
                <div
                  key={conference?.id ? conference.id : `empty-${index}`}  // Use a unique key
                  className={`scroller-item snap-start w-80 h-100 transition-all duration-200
                                      ${isActive ? 'card-active' : 'card'}
                                      card-index-${index}
                                    `}
                  style={{ left: position }}
                 //  Call handleClick with the ID
                >
                  {isActive && (
                    <div className="flex flex-col w-full h-full justify-start items-stretch grid grid-cols-1">
                      <EventCard
                        key={conference?.id}
                        event={conference}
                        className={`flex-shrink-0 mr-[${gap}px]`} // Add flex-shrink-0 and margin
                        style={{ width: `${cardWidth}px`, height: '1000px' }} // Set consistent width

                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
    }
    </>
  );
};

export default PopularConferences;