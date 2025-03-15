"use client";

// components/JournalTabs.tsx
import React, { useRef, useEffect } from 'react';
import Image from 'next/image'; // Import the Image component from next/image
import { ConferenceResponse } from '../../../../models/response/conference.response'; // Import JournalResponse
import Map from './Map';
import ReactMarkdown from 'react-markdown'; // Import
import remarkGfm from 'remark-gfm';       // Import
import remarkBreaks from 'remark-breaks'; // Import


interface ConferenceTabsProps {
    conference: ConferenceResponse; // Define the Conference prop
}

export const ConferenceTabs: React.FC<ConferenceTabsProps> = ({ conference }) => { // Update component signature to accept props
    const navRef = useRef<HTMLElement>(null); // Create a ref for the nav element

    useEffect(() => {
            const handleAnchorClick = (event: Event) => {
                event.preventDefault(); // Prevent default anchor behavior
                const target = event.target as HTMLAnchorElement;
                const targetId = target.getAttribute('href')?.substring(1); // Remove the '#'
                if (targetId) {
                    const targetSection = document.getElementById(targetId);
                    if (targetSection) {
                        const navElement = navRef.current; // Use navRef.current here
                        const navHeight = navElement ? navElement.offsetHeight : 0; // Get nav height, default to 0 if not found
                        const offset = 50;
                        const targetPosition = targetSection.offsetTop - navHeight - offset; // Calculate scroll position with offset
    
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth',
                        });
                    }
                }
            };
    
            const navLinks = navRef.current?.querySelectorAll('a') || []; // Use navRef.current to query only within this nav
            navLinks.forEach(link => {
                link.addEventListener('click', handleAnchorClick);
            });
    
            return () => { // Cleanup event listeners when component unmounts
                navLinks.forEach(link => {
                    link.removeEventListener('click', handleAnchorClick);
                });
            };
        }, []); // Empty dependency array ensures this effect runs only once after initial render

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
                <a
                    href="#insights"
                    className="nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10"
                >
                    Insights
                </a>
                <a
                    href="#map"
                    className="nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10"
                >
                    Map
                </a>
                <a
                    href="#source"
                    className="nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10"
                >
                    Source
                </a>
            </nav>

            <section id="overview" className="p-6 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-lg mt-6">
                <h2 className="text-3xl font-bold text-secondary mb-4">Overview</h2>
                <p className=" text-lg">
                    {/* Use conference description for overview, if available */}
                    
                    {conference.organization.summerize} {/* You can replace scopeDescription with data from journal if you have scope info in JournalResponse */}
                </p>
            </section>

            <section id="important-date" className="p-6 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-lg mt-6">
                <h2 className="text-3xl font-bold text-secondary mb-4">Important Date</h2>

                {(!conference?.submissionDate || Object.keys(conference.submissionDate).length === 0) &&
                (!conference?.notificationDate || Object.keys(conference.notificationDate).length === 0) &&
                (!conference?.cameraReadyDate || Object.keys(conference.cameraReadyDate).length === 0) &&
                (!conference?.otherDate || Object.keys(conference.otherDate).length === 0) ? (
                    <p className=" text-lg">
                        <div>No Important Date Available</div>
                    </p>
                    
                ):
                <div className="grid md:grid-cols-1 gap-6 p-6 bg-background shadow-md rounded-lg">
                    <div>
                            
                        <table className="w-full text-lg text-left border-collapse">
                            <thead className="text-lg  ">
                                <tr className="bg-gray-100">
                                    <th scope="col" className="px-6 py-3 font-semibold text-left border-2 border-gray-600">Event</th>
                                    <th scope="col" className="px-6 py-3 font-semibold text-left border-2 border-gray-600">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {conference?.submissionDate && Object.entries(conference.submissionDate).map(([name, value]) => (
                                <tr key={name} className="border-b border-gray-600">
                                    <td className="px-6 py-2 border-2 border-gray-600">{name}</td>
                                    <td className="px-6 py-2 border-2 border-gray-600">{value}</td>
                                </tr>
                                ))}
                                {conference?.notificationDate && Object.entries(conference.notificationDate).map(([name, value]) => (
                                <tr key={name} className="border-b border-gray-600">
                                    <td className="px-6 py-2 border-2 border-gray-600">{name}</td>
                                    <td className="px-6 py-2 border-2 border-gray-600">{value}</td>
                                </tr>
                                ))}
                                {conference?.cameraReadyDate && Object.entries(conference.cameraReadyDate).map(([name, value]) => (
                                <tr key={name} className="border-b border-gray-600">
                                    <td className="px-6 py-2 border-2 border-gray-600">{name}</td>
                                    <td className="px-6 py-2 border-2 border-gray-600">{value}</td>
                                </tr>
                                ))}
                                {conference?.otherDate && Object.entries(conference.otherDate).map(([name, value]) => (
                                <tr key={name} className="border-b border-gray-600">
                                    <td className="px-6 py-2 border-2 border-gray-600">{name}</td>
                                    <td className="px-6 py-2 border-2 border-gray-600">{value}</td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    
                </div>}
            </section>

            <section id="cfp" className="p-6 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-lg mt-6">
                {/* Left Column: H-index Value and Image */}
                <h2 className="text-3xl font-bold text-secondary mb-4">Call for paper</h2>
                <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                    >
                    {conference.organization.callForPaper}
                </ReactMarkdown> {/* You can replace scopeDescription with data from journal if you have scope info in JournalResponse */}   
            </section>

            <section id="category-topics" className="p-6 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-lg mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: SJR Value and Image */}
                    <div className="flex flex-col items-center">
                        <h2 className="text-3xl font-bold text-secondary mb-4">Category ad Topics</h2>
                        <p className=" text-lg mb-4">
                           
                        </p>
                        <div className="w-full max-w-xs rounded-lg shadow-lg relative aspect-square"> {/* Container for Image with aspect ratio and styling */}
                            <Image
                                src="/SJRCard.jpg"
                                alt="SJR Illustration"
                                layout="fill"
                                objectFit="cover"
                            />
                        </div>
                    </div>

                    {/* Right Column: Description of SJR */}
                    <div className="">
                        <h2 className="text-2xl font-bold text-secondary mb-4">What is SJR?</h2>
                        <p className="text-lg mb-4">
                            The <strong>Scimago Journal Rank (SJR)</strong> is a prestige metric that ranks journals based on their scientific influence and the quality of citations they receive.
                            It is developed from the information in the Scopus database.
                        </p>
                        <p className="text-lg font-semibold  p-4 rounded-lg mb-4">
                            <strong>Formula:</strong> SJR is calculated based on the weighted citations received in a given year. The weights are determined by the prestige of the citing journal.
                        </p>
                        <p className="text-lg">
                            For example, a journal that receives citations from highly ranked journals will have a higher SJR compared to journals with similar citation counts from less influential sources.
                        </p>
                        <p className="text-lg">
                            SJR takes into account both the number of citations and the importance of the citing journals, offering a balanced perspective on the scientific impact of a journal.
                        </p>
                    </div>
                </div>
            </section>

            <section id="insights" className="p-6 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-lg mt-6">
                <h2 className="text-3xl font-bold text-secondary mb-4">Insights</h2>
                <p className=" text-lg">
                    {/* Display Subject Areas and Categories from journal data */}
                    {/* {journal.subjectAreas?.map((sa, index) => (
                        <span key={index}>
                            {sa.area} ({sa.quartile || 'N/A'}){index < journal.subjectAreas.length - 1 ? '; ' : ''}
                        </span>
                    )) || "No Subject Areas/Categories Available"} */}
                </p>
            </section>

            <section id="map" className="p-6 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-lg mt-6">
                <h2 className="text-3xl font-bold text-secondary mb-4">Maps</h2>
                {conference?.locations[0].country && <Map location={conference.locations[0].country} />}
            </section>

            <section id="source" className="p-6 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-lg mt-6">
                <h2 className="text-3xl font-bold text-secondary mb-4">Sources</h2>
                <p className=" text-lg">
                    {/* Display Subject Areas and Categories from journal data */}
                    {/* {journal.subjectAreas?.map((sa, index) => (
                        <span key={index}>
                            {sa.area} ({sa.quartile || 'N/A'}){index < journal.subjectAreas.length - 1 ? '; ' : ''}
                        </span>
                    )) || "No Subject Areas/Categories Available"} */}
                </p>
            </section>
        </div>
    );
};