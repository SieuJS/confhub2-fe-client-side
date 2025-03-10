"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ConferenceResponse } from '@/src/models/response/conference.response'; // Correct import path
import Image from 'next/image';
import { useRouter } from '@/src/navigation'; // Import YOUR custom useRouter

type Conference = ConferenceResponse;

const conferenceList: any[] = require('../../../../models/data/conferences-list.json'); // Import json data

const conferencesData: Conference[] = conferenceList.map(conf => {
  return {
    id: conf.id,
    name: conf.name,
    acronym: conf.acronym,
    fieldOfResearch: conf.fieldOfResearch,
    topics: conf.topics,
    location: conf.location,
    type: conf.type,
    conferenceDates: conf.conferenceDates,
    description: conf.description,
    rank: conf.rank,
    source: conf.source,
    link: conf.link,
    likeCount: conf.likeCount || 0,
    followCount: conf.followCount || 0,
  } as Conference;
});

const PopularConferences: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const transitionDuration = 500;
  const router = useRouter();  // Use YOUR custom useRouter hook

  const wrapIndex = (index: number) => {
    return (index + conferencesData.length) % conferencesData.length;
  };

  const startAutoScroll = () => {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
    }
    autoScrollInterval.current = setInterval(() => {
      scrollRight();
    }, 3000);
  };

  const stopAutoScroll = () => {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
  };

  const scrollLeft = () => {
    if (!scrollerRef.current) return;
    setDirection('left');
    const currentCards = scrollerRef.current.querySelectorAll('.card-active');
    currentCards.forEach(card => card.classList.add('card-leaving'));
    const newIndex = wrapIndex(currentIndex - 1);
    setCurrentIndex(newIndex);
    setTimeout(() => {
      currentCards.forEach(card => card.classList.remove('card-leaving'));
    }, transitionDuration);
  };

  const scrollRight = () => {
    if (!scrollerRef.current) return;
    setDirection('right');
    const currentCards = scrollerRef.current.querySelectorAll('.card-active');
    currentCards.forEach(card => card.classList.add('card-leaving'));
    const newIndex = wrapIndex(currentIndex + 1);
    setCurrentIndex(newIndex);
    setTimeout(() => {
      currentCards.forEach(card => card.classList.remove('card-leaving'));
    }, transitionDuration);
  };

  useEffect(() => {
    startAutoScroll();
    return () => {
      stopAutoScroll();
    };
  }, [currentIndex]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    stopAutoScroll();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    startAutoScroll();
  };

    const handleClick = (id: string | undefined) => {
        if (id) {
            router.push({ pathname: '/conferences/detail', query: { id: id } });
        } else {
            console.error("Conference ID is undefined"); // Or handle the error appropriately
        }
  };

  const displayedCards = [
    conferencesData[wrapIndex(currentIndex - 2)],
    conferencesData[wrapIndex(currentIndex - 1)],
    conferencesData[currentIndex],
    conferencesData[wrapIndex(currentIndex + 1)],
    conferencesData[wrapIndex(currentIndex + 2)],
  ];

  return (
    <section id="organizers" className="m-6 px-8 pt-10">
      <style jsx>{`
        .card {
          transition: transform ${transitionDuration}ms ease-in-out, opacity ${transitionDuration}ms ease-in-out;
          position: absolute;
          width: 80px;
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
          transform: translateX(${direction === 'left' ? '-100%' : '100%'});
          z-index: 5;
        }
      `}</style>
      <h1 className="text-2xl font-bold text-center mb-6">Popular Conferences</h1>
      <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 focus:outline-none"
        >
          <img src="https://cdn-icons-png.flaticon.com/512/271/271220.png" alt="Left" className="w-4 h-4" />
        </button>
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 focus:outline-none"
        >
          <img src="https://cdn-icons-png.flaticon.com/512/271/271228.png" alt="Right" className="w-4 h-4" />
        </button>

        <div id="organizer" className="flex overflow-x-hidden w-full justify-center" ref={scrollerRef}>
          <div className="flex w-[calc(240px + 16px)] relative">
            {displayedCards.map((conference, index) => {
              const isActive = index >= 1 && index <= 3;
              const relativeIndex = index - 2;
              const position = `calc(${relativeIndex * (80 + 8)}px)`;


              return (
                <div
                  key={conference.id ? conference.id : `empty-${index}`}  // Use a unique key
                  className={`scroller-item snap-start flex-none w-80 h-[400px] bg-background rounded-lg border  text-center p-2 m-2 hover:bg-gradient-to-r hover:from-background hover:to-background-secondary transition-all duration-200 cursor-pointer scale-95 hover:scale-100
                                      ${isActive ? 'card-active shadow-md' : 'card'}
                                      card-index-${index}
                                    `}
                  style={{ left: position }}
                  onClick={() => handleClick(conference.id)} //  Call handleClick with the ID
                >
                  {isActive && (
                    <div className="flex flex-col w-full h-full justify-start items-stretch">
                      <div className="relative w-full h-[200px]">
                        <Image
                          className="lazyloaded rounded-t-lg object-cover"
                          src={'/bg-2.jpg'} //  Use a placeholder or default image
                          fill
                          alt={conference.name}
                          loading="lazy"
                          sizes="w-full"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <div className="p-4 text-left">
                        <div className="font-bold text-base mb-2 overflow-hidden text-ellipsis whitespace-nowrap">
                          {conference.name}
                        </div>
                        <div className="text-sm  mb-1">
                          {conference.conferenceDates}
                        </div>
                        <div className="text-sm  mb-1">{conference.location}</div>
                        <div className="text-sm  leading-tight">
                          <div className="font-bold mb-1">Topics:</div>
                          <ul className="list-none pl-0">
                            <div className="flex flex-wrap">
                              {conference?.topics && conference.topics.split(',').map((topic, index) => (
                              <li key={index} className="bg-background-secondary  rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2">
                                {topic.trim()} {/* Trim whitespace */}
                              </li>
                              )) || <li>No topics available</li>}  
                            </div>
                            
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularConferences;