"use client";

// components/JournalTabs.tsx
import React, { useState, useEffect } from 'react';

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
                <div className="p-6 bg-white shadow-md rounded-lg">
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


export const JournalTabs: React.FC = () => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <div className="container mx-auto mt-4 py-2 px-4 bg-gray-100 rounded-lg">
            <nav className="flex overflow-x-auto mt-1 whitespace-nowrap relative text-lg">
                <button
                    className={`nav-tab px-4 py-2 text-gray-600 border-b border-transparent hover:border-b-blue-500 focus:outline-none focus:border-b-blue-500 font-semibold relative z-10 ${value === 0 ? 'active-tab' : ''}`}
                    onClick={(event) => handleChange(event, 0)}
                    {...a11yProps(0)}
                >
                    Overview
                </button>
                <button
                    className={`nav-tab px-4 py-2 text-gray-600 border-b border-transparent hover:border-b-blue-500 focus:outline-none focus:border-b-blue-500 font-semibold relative z-10 ${value === 1 ? 'active-tab' : ''}`}
                    onClick={(event) => handleChange(event, 1)}
                    {...a11yProps(1)}
                >
                    Impact Factor
                </button>
                <button
                    className={`nav-tab px-4 py-2 text-gray-600 border-b border-transparent hover:border-b-blue-500 focus:outline-none focus:border-b-blue-500 font-semibold relative z-10 ${value === 2 ? 'active-tab' : ''}`}
                    onClick={(event) => handleChange(event, 2)}
                    {...a11yProps(2)}
                >
                    H-index
                </button>
                <button
                    className={`nav-tab px-4 py-2 text-gray-600 border-b border-transparent hover:border-b-blue-500 focus:outline-none focus:border-b-blue-500 font-semibold relative z-10 ${value === 3 ? 'active-tab' : ''}`}
                    onClick={(event) => handleChange(event, 3)}
                    {...a11yProps(3)}
                >
                    SJR
                </button>
                <button
                    className={`nav-tab px-4 py-2 text-gray-600 border-b border-transparent hover:border-b-blue-500 focus:outline-none focus:border-b-blue-500 font-semibold relative z-10 ${value === 4 ? 'active-tab' : ''}`}
                    onClick={(event) => handleChange(event, 4)}
                    {...a11yProps(4)}
                >
                    Subject Area and Category
                </button>
            </nav>

            <TabPanel value={value} index={0}>
                <h2 className="text-3xl font-bold text-blue-700 mb-4">Overview</h2>
                <p className="text-gray-600 text-lg">
                    CA provides cancer care professionals with up-to-date information on all aspects of cancer diagnosis,
                    treatment, and prevention. The journal focuses on keeping physicians and healthcare professionals
                    informed by providing scientific and educational information in the form of comprehensive review
                    articles and online continuing education activities on important cancer topics and issues that are
                    important to cancer care, along with publishing the latest cancer guidelines and statistical articles
                    from the American Cancer Society.
                </p>
            </TabPanel>

            <TabPanel value={value} index={1}>
                <h2 className="text-3xl font-bold text-blue-700 mb-4">Impact Factor</h2>
                <p className="text-gray-600 text-lg">
                    <strong>The Impact IF 2023</strong> of <strong>Ca-A Cancer Journal for Clinicians</strong> is
                    <strong>381.89</strong>,
                    which is computed in <strong>2024</strong> as per its definition.
                    <strong>Ca-A Cancer Journal for Clinicians IF</strong> is increased by a factor of <strong>81.9</strong>
                    and approximate percentage change is
                    <strong>27.3%</strong> when compared to preceding year <strong>2022</strong>, which shows a rising
                    trend.
                </p>
                <p className="text-gray-600 text-lg mt-4 mb-4">
                    The impact IF, also denoted as <strong>Journal Impact Score (JIS)</strong>, of an academic journal is a
                    measure of the yearly average
                    number of citations to recent articles published in that journal. It is based on <strong>Scopus</strong>
                    data.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white shadow-md rounded-lg">
                    {/* Left Column: Table */}
                    <div>
                        <table className="w-full text-lg text-left text-gray-700 border-collapse">
                            <thead className="text-lg text-gray-800 bg-gray-100">
                                <tr>
                                    <th scope="col" className="px-6 py-3 font-semibold text-left">Year</th>
                                    <th scope="col" className="px-6 py-3 font-semibold text-left">Impact Factor</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b odd:bg-white even:bg-gray-50">
                                    <td className="px-6 py-2">2023 (2024 update)</td>
                                    <td className="px-6 py-2">72.5</td>
                                </tr>
                                <tr className="border-b odd:bg-white even:bg-gray-50">
                                    <td className="px-6 py-2">2022</td>
                                    <td className="px-6 py-2">78.5</td>
                                </tr>
                                <tr className="border-b odd:bg-white even:bg-gray-50">
                                    <td className="px-6 py-2">2021</td>
                                    <td className="px-6 py-2">69.800</td>
                                </tr>
                                <tr className="border-b odd:bg-white even:bg-gray-50">
                                    <td className="px-6 py-2">2020</td>
                                    <td className="px-6 py-2">60.716</td>
                                </tr>
                                <tr className="border-b odd:bg-white even:bg-gray-50">
                                    <td className="px-6 py-2">2019</td>
                                    <td className="px-6 py-2">53.030</td>
                                </tr>
                                <tr className="border-b odd:bg-white even:bg-gray-50">
                                    <td className="px-6 py-2">2018</td>
                                    <td className="px-6 py-2">51.848</td>
                                </tr>
                                <tr className="border-b odd:bg-white even:bg-gray-50">
                                    <td className="px-6 py-2">2017</td>
                                    <td className="px-6 py-2">42.784</td>
                                </tr>
                                <tr className="border-b odd:bg-white even:bg-gray-50">
                                    <td className="px-6 py-2">2016</td>
                                    <td className="px-6 py-2">37.147</td>
                                </tr>
                                <tr className="border-b odd:bg-white even:bg-gray-50">
                                    <td className="px-6 py-2">2015</td>
                                    <td className="px-6 py-2">34.244</td>
                                </tr>
                                <tr className="border-b odd:bg-white even:bg-gray-50">
                                    <td className="px-6 py-2">2014</td>
                                    <td className="px-6 py-2">37.400</td>
                                </tr>
                                <tr className="border-b odd:bg-white even:bg-gray-50">
                                    <td className="px-6 py-2">2013</td>
                                    <td className="px-6 py-2">37.912</td>
                                </tr>
                                <tr className="border-b odd:bg-white even:bg-gray-50">
                                    <td className="px-6 py-2">2012</td>
                                    <td className="px-6 py-2">35.000</td>
                                </tr>
                                <tr className="border-b odd:bg-white even:bg-gray-50">
                                    <td className="px-6 py-2">2011</td>
                                    <td className="px-6 py-2">37.545</td>
                                </tr>
                                <tr className="border-b odd:bg-white even:bg-gray-50">
                                    <td className="px-6 py-2">2010</td>
                                    <td className="px-6 py-2">37.178</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Right Column: Description */}
                    <div className="text-gray-700">
                        <h2 className="text-2xl font-bold text-blue-700 mb-4">How Impact Factor is Calculated</h2>
                        <p className="text-lg mb-4">
                            The Impact Factor (IF) is a metric that reflects the yearly average number of citations to
                            recent articles published in a journal.
                            It is calculated based on the following formula:
                        </p>
                        <p className="text-lg font-semibold bg-gray-100 p-4 rounded-lg mb-4">
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
                        <h2 className="text-3xl font-bold text-blue-700 mb-4">H-index</h2>
                        <p className="text-gray-600 text-lg mb-4">
                            The H-index of this journal is <strong className="text-2xl">120</strong>.
                        </p>
                        <img src="https://www.library.ln.edu.hk/sites/default/files/images/research_support/understanding_research_impact/hindex/1.png" alt="H-index Illustration" className="w-full max-w-xs" />
                    </div>

                    {/* Right Column: Description of H-index */}
                    <div className="text-gray-700">
                        <h2 className="text-2xl font-bold text-blue-700 mb-4">What is H-index?</h2>
                        <p className="text-lg mb-4">
                            The <strong>H-index</strong> is a metric used to measure the productivity and citation impact of a researcher or journal.
                            It is defined as the maximum value of <em>h</em> such that the entity has published <em>h</em> papers that have each been cited at least <em>h</em> times.
                        </p>
                        <p className="text-lg font-semibold bg-gray-100 p-4 rounded-lg mb-4">
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
                        <h2 className="text-3xl font-bold text-blue-700 mb-4">SJR (Scimago Journal Ranking)</h2>
                        <p className="text-gray-600 text-lg mb-4">
                            The SJR value of this journal is <strong className="text-2xl">15.21</strong>.
                        </p>
                        <img src="https://blog.scopus.com/sites/default/files/SJRCard.jpg" alt="SJR Illustration" className="w-full max-w-xs rounded-lg shadow-lg" />
                    </div>

                    {/* Right Column: Description of SJR */}
                    <div className="text-gray-700">
                        <h2 className="text-2xl font-bold text-blue-700 mb-4">What is SJR?</h2>
                        <p className="text-lg mb-4">
                            The <strong>Scimago Journal Rank (SJR)</strong> is a prestige metric that ranks journals based on their scientific influence and the quality of citations they receive.
                            It is developed from the information in the Scopus database.
                        </p>
                        <p className="text-lg font-semibold bg-gray-100 p-4 rounded-lg mb-4">
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
                <h2 className="text-3xl font-bold text-blue-700 mb-4">Subject Area and Category</h2>
                <p className="text-gray-600 text-lg">
                    Details about the subject area and category go here.
                </p>
            </TabPanel>
        </div>
    );
};