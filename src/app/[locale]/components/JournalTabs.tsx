"use client";

// components/JournalTabs.tsx
import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Import the Image component from next/image
import { JournalResponse } from '../../../models/response/journal.response'; // Import JournalResponse

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

interface JournalTabsProps {
    journal: JournalResponse; // Define the journal prop
}

export const JournalTabs: React.FC<JournalTabsProps> = ({ journal }) => { // Update component signature to accept props
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    // Placeholder descriptions - ideally these should come from journal.description or similar if available in your JournalResponse type
    const scopeDescription = `CA provides cancer care professionals with up-to-date information on all aspects of cancer
    diagnosis, treatment, and prevention.`;
    const fullDescription = `The journal focuses on keeping physicians and healthcare professionals informed by providing
    scientific and educational information in the form of comprehensive review articles and online
    continuing education activities on important cancer topics and issues that are important to
    cancer care, along with publishing the latest cancer guidelines and statistical articles
    from the American Cancer Society.
    This report provides an in-depth look into the conference scope, key speakers, schedule,
    and much more.`; // You can replace these with actual data if available in your journal type


    return (
        <div className="container mx-auto mt-4 py-2 px-4  rounded-lg">
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
                    Impact Factor
                </button>
                <button
                    className={`nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10 ${value === 2 ? 'active-tab' : ''}`}
                    onClick={(event) => handleChange(event, 2)}
                    {...a11yProps(2)}
                    >
                    H-index
                </button>
                <button
                    className={`nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10 ${value === 3 ? 'active-tab' : ''}`}
                    onClick={(event) => handleChange(event, 3)}
                    {...a11yProps(3)}
                >
                    SJR
                </button>
                <button
                    className={`nav-tab px-4 py-2  border-b border-transparent hover:border-b-secondary focus:outline-none focus:border-b-secondary font-semibold relative z-10 ${value === 4 ? 'active-tab' : ''}`}
                    onClick={(event) => handleChange(event, 4)}
                    {...a11yProps(4)}
                >
                    Subject Area and Category
                </button>
            </nav>

            <TabPanel value={value} index={0}>
                <h2 className="text-3xl font-bold text-secondary mb-4">Overview</h2>
                <p className=" text-lg">
                    {/* Use journal data for overview, if available */}
                    {journal.publicationType === 'Journal' ? `${journal.title} is a leading academic journal.` : `${journal.title} is a significant publication.`}
                    {scopeDescription} {/* You can replace scopeDescription with data from journal if you have scope info in JournalResponse */}
                </p>
            </TabPanel>

            <TabPanel value={value} index={1}>
                <h2 className="text-3xl font-bold text-secondary mb-4">Impact Factor</h2>
                <p className=" text-lg">
                    <strong>The Impact IF 2023</strong> of <strong>{journal.title}</strong> is
                    <strong>{journal.metrics?.impactFactor || 'N/A'}</strong>,
                    which is computed in <strong>2024</strong> as per its definition.
                    {/* ... rest of the Impact Factor tab content, you can dynamically update journal name and IF value here */}
                </p>
                <p className=" text-lg mt-4 mb-4">
                    The impact IF, also denoted as <strong>Journal Impact Score (JIS)</strong>, of an academic journal is a
                    measure of the yearly average
                    number of citations to recent articles published in that journal. It is based on <strong>Scopus</strong>
                    data.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-background shadow-md rounded-lg">
                    {/* Left Column: Table */}
                    <div>
                        <table className="w-full text-lg text-left  border-collapse">
                            <thead className="text-lg  ">
                                <tr>
                                    <th scope="col" className="px-6 py-3 font-semibold text-left">Year</th>
                                    <th scope="col" className="px-6 py-3 font-semibold text-left">Impact Factor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {journal.metrics?.impactFactorHistory?.map((history, index) => ( // Use journal.metrics?.impactFactorHistory
                                    <tr key={index} className="border-b  ">
                                        <td className="px-6 py-2">{history.year}</td>
                                        <td className="px-6 py-2">{history.impactFactor}</td>
                                    </tr>
                                ))}
                                {/* Fallback if no impact factor history */}
                                {!journal.metrics?.impactFactorHistory && (
                                    <tr>
                                        <td className="px-6 py-2" colSpan={2}>No Impact Factor History Available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Right Column: Description */}
                    <div className="">
                        <h2 className="text-2xl font-bold text-secondary mb-4">How Impact Factor is Calculated</h2>
                        <p className="text-lg mb-4">
                            The Impact Factor (IF) is a metric that reflects the yearly average number of citations to
                            recent articles published in a journal.
                            It is calculated based on the following formula:
                        </p>
                        <p className="text-lg font-semibold  p-4 rounded-lg mb-4">
                            <strong>Impact Factor =</strong> <em>Total citations in the current year to articles published
                                in the previous two years</em> / <em>Total number of articles published in the previous two
                                years</em>
                        </p>
                        <p className="text-lg">
                            For example, if a journal has 1,000 citations in 2023 to articles published in 2021 and 2022,
                            and published 200 articles in those two years combined, the IF would be:
                            <strong>1,000 / 200 = 5.0</strong>.
                        </p>
                        <p className="text-lg">
                            This metric, provided by databases like <strong>Scopus</strong> and <strong>Clarivate
                                Analytics</strong>, helps researchers identify influential journals in their field.
                        </p>
                    </div>
                </div>
            </TabPanel>

            <TabPanel value={value} index={2}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: H-index Value and Image */}
                    <div className="flex flex-col items-center">
                        <h2 className="text-3xl font-bold text-secondary mb-4">H-index</h2>
                        <p className=" text-lg mb-4">
                            The H-index of this journal is <strong className="text-2xl">{journal.metrics?.hIndex || 'N/A'}</strong>. {/* Use journal.metrics?.hIndex */}
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
                        <h2 className="text-3xl font-bold text-secondary mb-4">SJR (Scimago Journal Ranking)</h2>
                        <p className=" text-lg mb-4">
                            The SJR value of this journal is <strong className="text-2xl">{journal.metrics?.sjr || 'N/A'}</strong>. {/* Use journal.metrics?.sjr */}
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
                <h2 className="text-3xl font-bold text-secondary mb-4">Subject Area and Category</h2>
                <p className=" text-lg">
                    {/* Display Subject Areas and Categories from journal data */}
                    {journal.subjectAreas?.map((sa, index) => (
                        <span key={index}>
                            {sa.area} ({sa.quartile || 'N/A'}){index < journal.subjectAreas.length - 1 ? '; ' : ''}
                        </span>
                    )) || "No Subject Areas/Categories Available"}
                </p>
            </TabPanel>
        </div>
    );
};