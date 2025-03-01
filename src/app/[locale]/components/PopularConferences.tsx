'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ConferenceResponse } from '../../../models/response/conference.response';
import conferenceList from '../../../models/data/conferences-list.json';

type Conference = ConferenceResponse;

// Use the first 5 conferences from conferenceList
const conferencesData: Conference[] = conferenceList.slice(0, 7).map(conf => {
    const conferenceDates = conf.conferenceDates && conf.conferenceDates.length > 0 ? conf.conferenceDates[0] : null;
    return {
        id: conf.id,
        name: conf.name,
        acronym: conf.acronym,
        category: conf.category,
        topics: conf.topics,
        location: conf.location,
        type: conf.type,
        conferenceDates: conf.conferenceDates,
        imageUrl: conf.imageUrl,
        description: conf.description,
        rank: conf.rank,
        sourceYear: conf.sourceYear,
        link: conf.link,
    };
}) as Conference[];

const PopularConferences: React.FC = () => {
    const [activeDotIndex, setActiveDotIndex] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const numConferences = conferencesData.length; // Get number of conferences

    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const scrollToCard = (index: number) => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const cardWidth = 80 * 4;
            const cardMargin = 8;
            const cardTotalWidth = cardWidth + cardMargin;
            const scrollPosition = index * cardTotalWidth - (container.offsetWidth / 2) + (cardWidth / 2);

            container.scrollTo({
                left: Math.max(0, scrollPosition),
                behavior: 'smooth',
            });
        }
    };

    const handleDotClick = (index: number) => {
        setActiveDotIndex(index);
        scrollToCard(index);
    };

    const handlePrevClick = () => {
        const prevIndex = activeDotIndex > 0 ? activeDotIndex - 1 : numConferences - 1; // Loop to last if at first
        setActiveDotIndex(prevIndex);
        scrollToCard(prevIndex);
    };

    const handleNextClick = () => {
        const nextIndex = activeDotIndex < numConferences - 1 ? activeDotIndex + 1 : 0; // Loop to first if at last
        setActiveDotIndex(nextIndex);
        scrollToCard(nextIndex);
    };


    useEffect(() => {
        if (scrollContainerRef.current && activeDotIndex === 0) {
            scrollToCard(0);
        }
    }, [activeDotIndex]);


    return (
        <section id="organizers" className="m-6 px-8 pt-10 relative"> {/* Make section relative for button positioning */}
            <style jsx>{`
                /* Hide scrollbar for Chrome, Safari and Opera */
                #organizer::-webkit-scrollbar {
                    display: none;
                }

                /* Hide scrollbar for Firefox */
                #organizer {
                    scrollbar-width: none; /* Firefox 67+ */
                    -ms-overflow-style: none;  /* IE and Edge */
                }
            `}</style>

            <h1 className="text-2xl font-bold text-center mb-6">Popular Conferences</h1>

            <button
                onClick={handlePrevClick}
                aria-label="Previous Conferences"
                className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 bg-background rounded-full shadow hover:bg-gray-100 focus:outline-none"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-6 w-6 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>

            <div
                id="organizer"
                className="flex overflow-x-scroll snap-x snap-mandatory -webkit-overflow-scrolling-touch justify-start"
                ref={scrollContainerRef}
            >
                {conferencesData.map((conference, index) => {
                    const isActive = index === activeDotIndex;
                    return (
                        <div
                            key={index}
                            className={`scroller-item snap-start flex-none w-80 h-[400px] bg-background rounded-lg border border-gray-200 text-center p-2 m-2 transition-all duration-200 cursor-pointer shadow-md
                                        ${isActive ? 'scale-105 bg-gradient-to-r from-background to-background-secondary border-blue-500 border-2' : 'scale-95 hover:scale-100 hover:bg-gradient-to-r hover:from-background hover:to-background-secondary'}`}
                        >
                            <div className="flex flex-col w-full h-full justify-start items-stretch">
                                <div className="relative w-full h-[200px]">
                                    <Image
                                        className="lazyloaded rounded-t-lg object-cover"
                                        src={conference.imageUrl}
                                        fill
                                        alt={conference.name}
                                        loading="lazy"
                                        sizes="w-full"
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="p-4 text-left">
                                    <div className="font-bold text-base mb-2 overflow-hidden text-ellipsis whitespace-nowrap">{conference.name}</div>
                                    <div className="text-sm  mb-1">
                                        {conference.conferenceDates && conference.conferenceDates.length > 0 ? (
                                            `${formatDate(conference.conferenceDates[0].startDate)} - ${formatDate(conference.conferenceDates[0].endDate)}`
                                        ) : (
                                            'Dates not available'
                                        )}
                                    </div>
                                    <div className="text-sm  mb-1">{conference.location}</div>
                                    <div className="text-sm  leading-tight">
                                        <div className="font-bold mb-1">Topics:</div>
                                        <ul className="list-none pl-0">
                                            {conference.topics.map((topic, topicIndex) => (
                                                <li key={topicIndex} className="inline-block mr-2 whitespace-nowrap">{topic}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={handleNextClick}
                aria-label="Next Conferences"
                className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 bg-background rounded-full shadow hover:bg-gray-100 focus:outline-none"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-6 w-6 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </button>


            {/* Pagination Dots */}
            <div className="flex justify-center space-x-2 mt-4"> {/* Added mt-4 for spacing */}
                {conferencesData.map((_, index) => (
                    <button
                        key={index}
                        className={`h-3 w-3 rounded-full focus:outline-none ${activeDotIndex === index ? 'bg-blue-500' : 'bg-gray-400 hover:bg-gray-500'}`}
                        onClick={() => handleDotClick(index)}
                        aria-label={`Go to conference ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default PopularConferences;