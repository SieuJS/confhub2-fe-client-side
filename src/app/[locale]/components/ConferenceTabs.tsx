"use client";

// components/JournalTabs.tsx
import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Import the Image component from next/image
import { ConferenceResponse } from '../../../models/response/conference.response'; // Import JournalResponse
import Map from './Map';

interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <div className="p-6 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-lg">
                    {children}
                </div>
            )}
        </div>
    );
}

function a11yProps(index: number) {
  return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
  };
}

interface ConferenceTabsProps {
    conference: ConferenceResponse; // Define the Conference prop
}

export const ConferenceTabs: React.FC<ConferenceTabsProps> = ({ conference }) => { // Update component signature to accept props
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };


    return (
        <div className="container mx-auto py-6 px-4 rounded-lg md:flex-row gap-6">
            <nav className="flex overflow-x-auto mt-1 whitespace-nowrap relative text-lg">
                <button
                    className={`nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10 ${value === 0 ? 'active-tab' : ''}`}
                    onClick={(event) => handleChange(event, 0)}
                    {...a11yProps(0)}
                >
                    Overview
                </button>
                <button
                    className={`nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10 ${value === 1 ? 'active-tab' : ''}`}
                    onClick={(event) => handleChange(event, 1)}
                    {...a11yProps(1)}
                >
                    Important Date
                </button>
                <button
                    className={`nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10 ${value === 2 ? 'active-tab' : ''}`}
                    onClick={(event) => handleChange(event, 2)}
                    {...a11yProps(2)}
                    >
                    Call for paper
                </button>
                <button
                    className={`nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10 ${value === 3 ? 'active-tab' : ''}`}
                    onClick={(event) => handleChange(event, 3)}
                    {...a11yProps(3)}
                >
                    Category and Topics
                </button>
                <button
                    className={`nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10 ${value === 4 ? 'active-tab' : ''}`}
                    onClick={(event) => handleChange(event, 4)}
                    {...a11yProps(4)}
                >
                    Subject Area and Category
                </button>
                <button
                    className={`nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10 ${value === 4 ? 'active-tab' : ''}`}
                    onClick={(event) => handleChange(event, 5)}
                    {...a11yProps(4)}
                >
                    Maps
                </button>
                <button
                    className={`nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10 ${value === 4 ? 'active-tab' : ''}`}
                    onClick={(event) => handleChange(event, 6)}
                    {...a11yProps(4)}
                >
                    Source
                </button>
            </nav>

            <TabPanel value={value} index={0}>
                <h2 className="text-3xl font-bold text-secondary mb-4">Overview</h2>
                <p className=" text-lg">
                    {/* Use conference description for overview, if available */}
                    
                    {conference.description} {/* You can replace scopeDescription with data from journal if you have scope info in JournalResponse */}
                </p>
            </TabPanel>

            <TabPanel value={value} index={1}>
                <h2 className="text-3xl font-bold text-secondary mb-4">Important Date</h2>
                <p className=" text-lg">
                    Stay up-to-date with essential deadlines for the conference.
                </p>
                <p className=" text-lg mt-4 mb-4">
                    
                </p>

                <div className="grid md:grid-cols-1 gap-6 p-6 bg-background shadow-md rounded-lg">
                    {/* Left Column: Table */}
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
                                    

                                {/* Fallback if no impact factor history */}
                                {/* {!journal.metrics?.impactFactorHistory && (
                                    <tr>
                                        <td className="px-6 py-2" colSpan={2}>No Impact Factor History Available</td>
                                    </tr>
                                )} */}
                            </tbody>
                        </table>
                    </div>

                    
                </div>
            </TabPanel>

            <TabPanel value={value} index={2}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: H-index Value and Image */}
                    <div className="flex flex-col items-center">
                        <h2 className="text-3xl font-bold text-secondary mb-4">Call for paper</h2>
                        <p className=" text-lg mb-4">
                            The H-index of this journal is <strong className="text-2xl"></strong>. {/* Use journal.metrics?.hIndex */}
                        </p>
                        <div className="w-full max-w-xs relative aspect-square"> {/* Container for Image with aspect ratio */}
                            <Image
                                src="/Hindex.png" // Use local image or provide a valid URL
                                alt="H-index Illustration"
                                layout="fill"
                                objectFit="contain" // Use 'contain' to fit image within bounds without cropping
                            />
                        </div>
                    </div>

                    {/* Right Column: Description of H-index */}
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
            </TabPanel>

            <TabPanel value={value} index={3}>
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
            </TabPanel>

            <TabPanel value={value} index={4}>
                <h2 className="text-3xl font-bold text-secondary mb-4">Insights</h2>
                <p className=" text-lg">
                    {/* Display Subject Areas and Categories from journal data */}
                    {/* {journal.subjectAreas?.map((sa, index) => (
                        <span key={index}>
                            {sa.area} ({sa.quartile || 'N/A'}){index < journal.subjectAreas.length - 1 ? '; ' : ''}
                        </span>
                    )) || "No Subject Areas/Categories Available"} */}
                </p>
            </TabPanel>

            <TabPanel value={value} index={5}>
                <h2 className="text-3xl font-bold text-secondary mb-4">Maps</h2>
                <Map location={conference.location} />
            </TabPanel>

            <TabPanel value={value} index={6}>
                <h2 className="text-3xl font-bold text-secondary mb-4">Sources</h2>
                <p className=" text-lg">
                    {/* Display Subject Areas and Categories from journal data */}
                    {/* {journal.subjectAreas?.map((sa, index) => (
                        <span key={index}>
                            {sa.area} ({sa.quartile || 'N/A'}){index < journal.subjectAreas.length - 1 ? '; ' : ''}
                        </span>
                    )) || "No Subject Areas/Categories Available"} */}
                </p>
            </TabPanel>
        </div>
    );
};