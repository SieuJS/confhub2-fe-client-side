'use client';

import React from 'react';
import Image from 'next/image';
import { ConferenceResponse } from '../../../models/response/conference.response'; // Import ConferenceResponse
import conferenceList from '../../../models/data/conferences-list.json'; // Import conferenceList JSON data

// Replace interface Conference with type Conference = ConferenceResponse
type Conference = ConferenceResponse;

// Update conferencesData to use the first 5 conferences from conferenceList and map to expected structure
const conferencesData: Conference[] = conferenceList.slice(0, 6).map(conf => ({ // Use slice(0, 6) to get first 6, as the original had 6 example items, adjust as needed
    id: conf.id, // Assuming id is in conferenceList, adjust if needed
    name: conf.name,
    acronym: conf.acronym, // Use acronym instead of shortName
    category: conf.category, // Add category, adjust if needed or remove if not used in this component
    topics: conf.topics,
    location: conf.location,
    type: conf.type,
    startDate: conf.startDate,
    endDate: conf.endDate,
    submissionDate: conf.submissionDate,
    cameraReadyDate: conf.cameraReadyDate,
    notificationDate: conf.notificationDate,
    imageUrl: conf.imageUrl, // Use imageUrl instead of image, and ensure conferenceList has imageUrl
    description: conf.description,
    rank: conf.rank,
    sourceYear: conf.sourceYear,
    link: conf.link
})) as Conference[]; // Type assertion to Conference[]


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
                                        src={conference.imageUrl} // Use imageUrl from ConferenceResponse
                                        fill
                                        alt={conference.name} // Use name from ConferenceResponse
                                        loading="lazy"
                                        sizes="w-full"
                                        style={{ objectFit: 'cover' }}

                                    />
                                </div>
                                <div className="p-4 text-left">
                                    <div className="font-bold text-base mb-2 overflow-hidden text-ellipsis whitespace-nowrap">{conference.name}</div> {/* Use name from ConferenceResponse */}
                                    <div className="text-sm  mb-1">{conference.startDate} - {conference.endDate}</div> {/* Use startDate and endDate from ConferenceResponse */}
                                    <div className="text-sm  mb-1">{conference.location}</div> {/* Use location from ConferenceResponse */}
                                    <div className="text-sm  leading-tight">
                                        <div className="font-bold mb-1">Topics:</div>
                                        <ul className="list-none pl-0">
                                            {conference.topics.map((topic, topicIndex) => ( // Use topics from ConferenceResponse
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
                                        src={conference.imageUrl} // Use imageUrl from ConferenceResponse
                                        fill
                                        alt={conference.name} // Use name from ConferenceResponse
                                        loading="lazy"
                                        sizes="w-full"
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="p-4 text-left">
                                    <div className="font-bold text-base mb-2 overflow-hidden text-ellipsis whitespace-nowrap">{conference.name}</div> {/* Use name from ConferenceResponse */}
                                    <div className="text-sm  mb-1">{conference.startDate} - {conference.endDate}</div> {/* Use startDate and endDate from ConferenceResponse */}
                                    <div className="text-sm  mb-1">{conference.location}</div> {/* Use location from ConferenceResponse */}
                                    <div className="text-sm  leading-tight">
                                        <div className="font-bold mb-1">Topics:</div>
                                        <ul className="list-none pl-0">
                                            {conference.topics.map((topic, topicIndex) => ( // Use topics from ConferenceResponse
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