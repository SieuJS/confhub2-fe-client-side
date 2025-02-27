'use client';

import React from 'react';
import Image from 'next/image';

interface Conference {
    image: string;
    title: string;
    startDate: string;
    endDate: string;
    location: string;
    topics: string[];
}

const conferencesData: Conference[] = [
    {
        image: "/bg-2.jpg",
        title: "Sustainable Development Forum",
        startDate: "May 10, 2024",
        endDate: "May 12, 2024",
        location: "Geneva, Switzerland",
        topics: ["Energy", "Environment", "Social"]
    },
    {
        image: "/bg-2.jpg",
        title: "Future Tech Summit",
        startDate: "Jun 15, 2024",
        endDate: "Jun 17, 2024",
        location: "London, UK",
        topics: ["AI", "Robotics", "VR/AR"]
    },
    {
        image: "/bg-2.jpg",
        title: "Global Health Conference",
        startDate: "Jul 20, 2024",
        endDate: "Jul 22, 2024",
        location: "New York, USA",
        topics: ["Healthcare", "Medicine", "Wellbeing"]
    },
    {
        image: "/bg-2.jpg",
        title: "Digital Marketing Expo",
        startDate: "Aug 5, 2024",
        endDate: "Aug 7, 2024",
        location: "Paris, France",
        topics: ["SEO", "Social Media", "Content"]
    },
    {
        image: "/bg-2.jpg",
        title: "Finance Innovation Forum",
        startDate: "Sep 1, 2024",
        endDate: "Sep 3, 2024",
        location: "Singapore",
        topics: ["FinTech", "Investment", "Banking"]
    },
    {
        image: "/bg-2.jpg",
        title: "Clean Energy Symposium",
        startDate: "Oct 10, 2024",
        endDate: "Oct 12, 2024",
        location: "Berlin, Germany",
        topics: ["Renewable Energy", "Solar", "Wind"]
    },
];

const PopularConferences: React.FC = () => {
    return (
        <section id="organizers" className="m-6 px-8 pt-10">
            <style jsx>{`
                @keyframes scroll-left {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-100%); }
                }
                .scroll-left {
                    animation: scroll-left 13s linear infinite;
                }
            `}</style>

            <h1 className="text-2xl font-bold text-center mb-6">Popular Conferences</h1>
            <div id="organizer" className="flex overflow-hidden">
                <div className="scroller scroll-left whitespace-nowrap flex snap-x snap-mandatory -webkit-overflow-scrolling-touch">
                    {conferencesData.map((conference, index) => (
                        <div key={index} className="scroller-item snap-start flex-none w-80 h-[400px] bg-background rounded-lg border border-gray-200 text-center p-2 m-2 hover:bg-gradient-to-r hover:from-background hover:to-background-secondary transition-all duration-200 cursor-pointer shadow-md scale-95 hover:scale-100" >
                            <div className="flex flex-col w-full h-full justify-start items-stretch">
                                <div className="relative w-full h-[200px]">
                                    <Image
                                        className="lazyloaded rounded-t-lg object-cover"
                                        src={conference.image}
                                        fill
                                        alt={conference.title}
                                        loading="lazy"
                                        sizes="w-full"
                                        style={{ objectFit: 'cover' }}
                                        
                                    />
                                </div>
                                <div className="p-4 text-left">
                                    <div className="font-bold text-base mb-2 overflow-hidden text-ellipsis whitespace-nowrap">{conference.title}</div>
                                    <div className="text-sm  mb-1">{conference.startDate} - {conference.endDate}</div>
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
                    ))}
                </div>
                <div className="scroller scroll-left whitespace-nowrap flex snap-x snap-mandatory -webkit-overflow-scrolling-touch" >
                    {/* Duplicate scroller for seamless loop */}
                    {conferencesData.map((conference, index) => (
                        <div key={index} className="scroller-item snap-start flex-none w-80 h-[400px] bg-background rounded-lg border border-gray-200 text-center p-2 m-2 hover:bg-gradient-to-r hover:from-background hover:to-background-secondary transition-all duration-200 cursor-pointer shadow-md scale-95 hover:scale-100" >
                            <div className="flex flex-col w-full h-full justify-start items-stretch">
                                <div className="relative w-full h-[200px]">
                                    <Image
                                        className="lazyloaded rounded-t-lg object-cover"
                                        src={conference.image}
                                        fill
                                        alt={conference.title}
                                        loading="lazy"
                                        sizes="w-full"
                                        style={{ objectFit: 'cover' }} 
                                    />
                                </div>
                                <div className="p-4 text-left">
                                    <div className="font-bold text-base mb-2 overflow-hidden text-ellipsis whitespace-nowrap">{conference.title}</div>
                                    <div className="text-sm  mb-1">{conference.startDate} - {conference.endDate}</div>
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
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PopularConferences;