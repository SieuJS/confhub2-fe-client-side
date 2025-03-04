"use client";

// components/ConferenceTabs.tsx
import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { ConferenceResponse } from '../../../../models/response/conference.response';
import Map from './Map';

interface ConferenceTabsProps {
    conference: ConferenceResponse;
}

export const ConferenceTabs: React.FC<ConferenceTabsProps> = ({ conference }) => {
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
                    const navHeight = navElement ? navElement.offsetHeight : 0;
                    const offset = 100;
                    const targetPosition = targetSection.offsetTop - navHeight - offset;

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

        return () => {
            navLinks.forEach(link => {
                link.removeEventListener('click', handleAnchorClick);
            });
        };
    }, []); // Empty dependency array ensures this effect runs only once after initial render


    return (
        <div className="container mx-auto py-6 rounded-lg md:flex-row " style={{ scrollBehavior: 'smooth' }}>
            <nav ref={navRef} className="sticky top-24 bg-gradient-to-r from-background to-background-secondary shadow-md z-20 flex overflow-x-auto mt-1 whitespace-nowrap p-3 text-lg">
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
                    href="#call-for-paper"
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
                    href="#subject-area-category"
                    className="nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10"
                >
                    Subject Area and Category
                </a>
                <a
                    href="#maps"
                    className="nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10"
                >
                    Maps
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
                    {conference.description}
                </p>
            </section>

            <section id="important-date" className="p-6 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-lg mt-6">
                <h2 className="text-3xl font-bold text-secondary mb-4">Important Date</h2>
                <p className=" text-lg">
                    Stay up-to-date with essential deadlines for the conference.
                </p>
                <p className=" text-lg mt-4 mb-4">

                </p>

                <div className="grid md:grid-cols-1 gap-6 ">
                    <div>
                        <table className="w-full text-lg text-left  border-collapse">
                            <thead className="text-lg  ">
                                <tr>
                                    <th scope="col" className="px-6 py-3 font-semibold text-left">Event</th>
                                    <th scope="col" className="px-6 py-3 font-semibold text-left">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                    {conference.conferenceDates.map((date, index) => (
                                      <tr key={index} className="border-b">
                                        <td className="px-6 py-2">{date.dateName}</td>
                                        <td className="px-6 py-2">{date.startDate}{date.endDate ? ` - ${date.endDate}` : ''}</td>
                                      </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section id="call-for-paper" className="p-6 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-lg mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center">
                        <h2 className="text-3xl font-bold text-secondary mb-4">Call for paper</h2>
                        <p className=" text-lg mb-4">
                            The H-index of this journal is <strong className="text-2xl"></strong>.
                        </p>
                        <div className="w-full max-w-xs relative aspect-square">
                            <Image
                                src="/Hindex.png"
                                alt="H-index Illustration"
                                layout="fill"
                                objectFit="contain"
                            />
                        </div>
                    </div>

                    <div className="">
                        <h2 className="text-2xl font-bold text-secondary mb-4">What is H-index?</h2>
                        <p className="text-lg mb-4">
                            The <strong>H-index</strong> is a metric used to measure the productivity and citation impact of a researcher or journal.
                            It is defined as the maximum value of <em>h</em> such that the entity has published <em>h</em> papers that have each been cited at least <em>h</em> times.
                        </p>
                        <p className="text-lg font-semibold  p-4 rounded-lg mb-4">
                            <strong>Formula:</strong> Identify the largest number <em>h</em> where at least <em>h</em> publications have received at least <em>h</em> citations.
                        </p>
                        <p className="text-lg">
                            For example, if a journal has published 10 papers and each paper has been cited the following number of times:
                            <strong>20, 15, 12, 10, 9, 7, 6, 5, 4, 3</strong>, the H-index is <strong>7</strong>, as the 7th paper has at least 7 citations.
                        </p>
                        <p className="text-lg">
                            The H-index provides a balanced measure of both the quantity (number of publications) and quality (citations) of the output.
                        </p>
                    </div>
                </div>
            </section>

            <section id="category-topics" className="p-6 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-lg mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center">
                        <h2 className="text-3xl font-bold text-secondary mb-4">Category ad Topics</h2>
                        <p className=" text-lg mb-4">

                        </p>
                        <div className="w-full max-w-xs rounded-lg shadow-lg relative aspect-square">
                            <Image
                                src="/SJRCard.jpg"
                                alt="SJR Illustration"
                                layout="fill"
                                objectFit="cover"
                            />
                        </div>
                    </div>

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

            <section id="subject-area-category" className="p-6 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-lg mt-6">
                <h2 className="text-3xl font-bold text-secondary mb-4">Insights</h2>
                <p className=" text-lg">
                </p>
            </section>

            <section id="maps" className="p-6 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-lg mt-6">
                <h2 className="text-3xl font-bold text-secondary mb-4">Maps</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Map location={conference.location} />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold mb-2">Mô tả về địa điểm hội nghị</h1>
                  </div>
                </div>
            </section>

            <section id="source" className="p-6 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-lg mt-6">
                <h2 className="text-3xl font-bold text-secondary mb-4">Sources</h2>
                <p className=" text-lg">
                </p>
            </section>
        </div>
    );
};