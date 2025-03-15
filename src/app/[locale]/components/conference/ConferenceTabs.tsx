"use client";

// components/JournalTabs.tsx
import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { ConferenceResponse } from '../../../../models/response/conference.response';
import Map from './Map';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import Button from '../utils/Button';

interface ConferenceTabsProps {
    conference: ConferenceResponse;
}

export const ConferenceTabs: React.FC<ConferenceTabsProps> = ({ conference }) => {
    const navRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const handleAnchorClick = (event: Event) => {
            event.preventDefault();
            const target = event.target as HTMLAnchorElement;
            const targetId = target.getAttribute('href')?.substring(1);
            if (targetId) {
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    const navElement = navRef.current;
                    const navHeight = navElement ? navElement.offsetHeight : 0;
                    const offset = 50;
                    const targetPosition = targetSection.offsetTop - navHeight - offset;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth',
                    });
                }
            }
        };

        const navLinks = navRef.current?.querySelectorAll('a') || [];
        navLinks.forEach(link => {
            link.addEventListener('click', handleAnchorClick);
        });

        return () => {
            navLinks.forEach(link => {
                link.removeEventListener('click', handleAnchorClick);
            });
        };
    }, []);

    const formatDate = (date: Date | string): string => {
        if (!date) return 'TBD';
        const dateObj = date instanceof Date ? date : new Date(date);
        return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="container mx-auto py-6 rounded-lg md:flex-row " style={{ scrollBehavior: 'smooth' }}>
            <nav ref={navRef} className="sticky top-14 bg-gradient-to-r from-background to-background-secondary shadow-md z-20 flex overflow-x-auto mt-1 whitespace-nowrap p-3 text-lg">
                <a
                    href="#overview"
                    className="nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10"
                >
                    Overview
                </a>
                <a
                    href="#important-date"
                    className="nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10"
                >
                    Important Date
                </a>
                <a
                    href="#cfp"
                    className="nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10"
                >
                    Call for paper
                </a>
                <a
                    href="#category-topics"
                    className="nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10"
                >
                    Category and Topics
                </a>
                {conference.ranks && conference.ranks.length > 0 && (
                    <a
                        href="#source"
                        className="nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10"
                    >
                        Source
                    </a>
                )}

                {conference.locations && conference.locations.length > 0 && (
                    <a
                        href="#map"
                        className="nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10"
                    >
                        Map
                    </a>
                )}
            </nav>

            <section id="overview" className="p-6 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-lg mt-6">
                <h2 className="text-3xl font-bold text-secondary mb-4">Overview</h2>
                <p className=" text-lg">
                    {conference.organization.summerize}
                </p>
            </section>

            <section id="important-date" className="p-6 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-lg mt-6">
                <h2 className="text-3xl font-bold text-secondary mb-4">Important Dates</h2>

                {(!conference.dates || conference.dates.length === 0) ? (
                    <p className=" text-lg">
                        <div>No Important Dates Available</div>
                    </p>

                ) :
                    <div className="grid md:grid-cols-1 gap-6 p-6 bg-background shadow-md rounded-lg">
                        <div>

                            <table className="w-full text-lg text-left border-collapse">
                                <thead className="text-lg  ">
                                    <tr className="bg-gray-100">
                                        <th scope="col" className="px-6 py-3 font-semibold text-left border-2 border-gray-600">Name</th>
                                        <th scope="col" className="px-6 py-3 font-semibold text-left border-2 border-gray-600">Type</th>
                                        <th scope="col" className="px-6 py-3 font-semibold text-left border-2 border-gray-600">From Date</th>
                                        <th scope="col" className="px-6 py-3 font-semibold text-left border-2 border-gray-600">To Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {conference.dates.map((dateItem, index) => (
                                        <tr key={index} className="border-b border-gray-600">
                                            <td className="px-6 py-2 border-2 border-gray-600">{dateItem.name}</td>
                                            <td className="px-6 py-2 border-2 border-gray-600">{dateItem.type}</td>
                                            <td className="px-6 py-2 border-2 border-gray-600">{formatDate(dateItem.fromDate)}</td>
                                            <td className="px-6 py-2 border-2 border-gray-600">{formatDate(dateItem.toDate)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>}
            </section>

            <section id="cfp" className="p-6 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-lg mt-6">
                <h2 className="text-3xl font-bold text-secondary mb-4">Call for Paper</h2>
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                >
                    {conference.organization.callForPaper}
                </ReactMarkdown>
            </section>

            <section id="category-topics" className="p-6 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-lg mt-6">
    <div className=" gap-6">
        <div className="flex flex-col ">
            <h2 className="text-3xl font-bold text-secondary mb-4">Category</h2>
            <p className="text-lg mb-4">{conference.organization.category}</p>
        </div>

        <div className="">
            <h2 className="text-2xl font-bold text-secondary mb-4">Topics</h2>
            {conference.organization.topics && conference.organization.topics.length > 0 ? (
                <ul className="list-disc pl-5 grid grid-cols-4 gap-4"> 
                    {conference.organization.topics.map((topic, index) => (
                        <li key={index} className="text-lg ">{topic}</li>
                    ))}
                </ul>
            ) : (
                <p className="text-lg">No topics available.</p>
            )}
        </div>
    </div>
</section>


            {conference.ranks && conference.ranks.length > 0 && (
                <section id="source" className="p-6 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-lg mt-6">
                    <h2 className="text-3xl font-bold text-secondary mb-4">Conference Ranks and Sources</h2>
                    {conference.ranks.map((rank, rankIndex) => (
                        <div key={rankIndex} className="mb-6">
                            <h3 className="text-2xl font-semibold text-secondary mb-2">Rank Year: {rank.year} - Field: {rank.inFieldOfResearch.name}</h3>
                             {Array.isArray(rank.byRank) ? (
                                rank.byRank.map((rankDetail, detailIndex) => (
                                    <div key={detailIndex} className="mb-4 p-4 border rounded-md bg-background">
                                        <h4 className="text-xl font-semibold mb-2">Rank Name: {rankDetail.name}</h4>
                                        <p className="mb-2">Rank Value: {rankDetail.value}</p>
                                        <div className="flex items-center">
                                            <span className="mr-2">Source: {rankDetail.belongsToSource.name}</span>
                                            
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No rank details available for {rank.year}.</p>
                            )}
                        </div>
                    ))}
                </section>
            )}


            {conference.locations && conference.locations.length > 0 && (
                <section id="map" className="p-6 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-lg mt-6">
                    <h2 className="text-3xl font-bold text-secondary mb-4">Map</h2>
                    {conference.locations[0].country && <Map location={conference.locations[0].country} />}
                </section>
            )}
        </div>
    );
};