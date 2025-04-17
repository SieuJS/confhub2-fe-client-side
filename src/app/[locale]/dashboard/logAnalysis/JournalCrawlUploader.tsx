// src/components/logAnalysis/JournalCrawlUploader/JournalCrawlUploader.tsx

import React from 'react';
// Import the new hook and types
import { useJournalCrawl } from '../../../../hooks/logAnalysis/useJournalCrawl'; // Adjust path
import { Journal } from '@/src/models/logAnalysis/importJournalCrawl'; // Adjust path
import { FaFileUpload, FaSpinner, FaPlay, FaStop, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaRedo, FaTable } from 'react-icons/fa';

// --- NEW: Journal Preview Table Component ---
const JournalPreviewTable: React.FC<{ data: Journal[] }> = ({ data }) => (
    <div className="mt-6 border border-gray-200 rounded-lg shadow-sm">
        <h3 className="text-md font-semibold text-gray-700 p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg flex items-center">
            <FaTable className="mr-2 text-gray-500" /> Preview Parsed Journals ({data.length} items)
        </h3>
        <div className="max-h-96 overflow-auto custom-scrollbar"> {/* Increased height & horizontal scroll */}
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100 sticky top-0 z-10"> {/* Header sticky */}
                    <tr>
                        {/* Select key columns for preview */}
                        <th scope="col" className="sticky left-0 bg-gray-100 px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider z-20">Rank</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider min-w-[250px]">Title</th>
                         <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">SJR</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">SJR Best Quartile</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">H index</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Publisher</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Country</th>
                        {/* Add more columns if needed */}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((journal, index) => (
                        <tr key={`${journal.Sourceid}-${index}`} className="hover:bg-gray-50">
                            {/* Access data using the keys defined in the Journal interface */}
                            <td className="sticky left-0 bg-white px-3 py-2 whitespace-nowrap text-sm text-gray-500 z-10">{journal.Rank}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{journal.Title}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{journal.SJR}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{journal['SJR Best Quartile']}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{journal['H index']}</td>
                            <td className="px-3 py-2 text-sm text-gray-600 min-w-[150px]">{journal.Publisher}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{journal.Country}</td>
                            {/* Render more cells if columns were added above */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {data.length === 0 && (
            <p className="p-4 text-center text-sm text-gray-500">No journals found in the table.</p>
        )}
    </div>
);


// --- Main Component ---
export const JournalCrawlUploader: React.FC = () => {
    // Use the new journal hook
    const {
        file,
        parsedData, // This is now Journal[] | null
        isParsing,
        parseError,
        enableChunking,
        chunkSize,
        isCrawling,
        crawlError,
        crawlProgress,
        crawlMessages,
        handleFileChange,
        setEnableChunking,
        setChunkSize,
        startCrawl,
        resetCrawl,
    } = useJournalCrawl();

    const hasData = parsedData && parsedData.length > 0;
    const canStartCrawl = hasData && !isCrawling;

    return (
        <div className="p-4 md:p-6 bg-white shadow-lg rounded-lg border border-gray-200 mx-auto">
            {/* Update Title */}
            <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-300">
                Crawl Journals from SCImago CSV
            </h2>

            {/* --- File Upload Section --- */}
            <div className="mb-4">
                 {/* Update Label */}
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select SCImago Journal CSV File (Semicolon-delimited ';')
                </label>
                <div className="flex items-center space-x-4">
                    <label className={`relative inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${isParsing || isCrawling ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <FaFileUpload className={`mr-2 ${isParsing ? 'animate-spin' : ''}`} />
                        <span>{isParsing ? 'Parsing...' : (file ? 'Change File' : 'Choose File')}</span>
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept=".csv, text/csv"
                            onChange={handleFileChange}
                            disabled={isParsing || isCrawling}
                        />
                    </label>
                    {file && !isParsing && (
                        <span className="text-sm text-gray-600 truncate" title={file.name}>{file.name}</span>
                    )}
                    {isParsing && <FaSpinner className="animate-spin text-blue-500" />}
                </div>
                {parseError && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                        <FaTimesCircle className="mr-1" /> {parseError}
                    </p>
                )}
                {/* Update Success Message */}
                {hasData && !isParsing && (
                    <p className="mt-2 text-sm text-green-600 flex items-center">
                        <FaCheckCircle className="mr-1" /> Parsed {parsedData.length} journals. Ready to crawl.
                    </p>
                )}
            </div>

            {/* --- Configuration Section (Unchanged logic) --- */}
            {hasData && (
                 <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                    <h3 className="text-md font-semibold text-gray-700 mb-3">Crawl Configuration</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-3 sm:space-y-0">
                        <div className="flex items-center">
                            <input
                                id="enable-journal-chunking" // Unique ID
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                checked={enableChunking}
                                onChange={(e) => setEnableChunking(e.target.checked)}
                                disabled={isCrawling}
                            />
                            <label htmlFor="enable-journal-chunking" className="ml-2 block text-sm text-gray-900">
                                Enable Chunking
                            </label>
                        </div>
                        <div className={`flex items-center ${!enableChunking ? 'opacity-50' : ''}`}>
                            <label htmlFor="journal-chunk-size" className="mr-2 block text-sm font-medium text-gray-700">
                                Chunk Size:
                            </label>
                            <input
                                id="journal-chunk-size" // Unique ID
                                type="number"
                                min="1"
                                className="p-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm w-20 disabled:bg-gray-100"
                                value={chunkSize}
                                onChange={(e) => setChunkSize(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                disabled={!enableChunking || isCrawling}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* --- Action Buttons (Unchanged logic, updated text maybe) --- */}
            <div className="flex items-center space-x-4 mb-4">
                <button
                    onClick={startCrawl}
                    disabled={!canStartCrawl}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${canStartCrawl ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                    {isCrawling ? (
                        <FaSpinner className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    ) : (
                        <FaPlay className="-ml-1 mr-2 h-5 w-5" />
                    )}
                    {isCrawling ? 'Crawling Journals...' : (crawlProgress.status === 'success' || crawlProgress.status === 'error' || crawlProgress.status === 'stopped' ? 'Crawl Journals Again' : 'Start Journal Crawl')}
                </button>
                 <button
                    onClick={resetCrawl}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    title="Clear selection and results"
                >
                    <FaRedo className="mr-2" /> Reset
                </button>
            </div>

             {/* --- Progress and Results Section (Unchanged logic, messages updated via hook) --- */}
             {(isCrawling || crawlMessages.length > 0 || crawlError) && (
                <div className="mt-6 p-4 border border-gray-200 rounded-md">
                    <h3 className="text-md font-semibold text-gray-700 mb-3">Journal Crawl Status & Log</h3>
                    {/* Progress Bar */}
                    {isCrawling && enableChunking && crawlProgress.total > 0 && (
                         <div className="mb-3">
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-blue-700">
                                    Processing Chunk {crawlProgress.current} of {crawlProgress.total}
                                </span>
                                <span className="text-sm font-medium text-blue-700">
                                    {Math.round((crawlProgress.current / crawlProgress.total) * 100)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${(crawlProgress.current / crawlProgress.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                     {/* Crawling indicator for 'Send All' */}
                     {isCrawling && !enableChunking && (
                        <p className="mb-3 text-sm text-blue-600 flex items-center">
                            <FaSpinner className="animate-spin mr-2" /> Sending entire journal list...
                        </p>
                    )}

                    {/* Error Display */}
                    {crawlError && (
                         <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 flex items-start">
                            <FaExclamationTriangle className="mr-2 mt-0.5 flex-shrink-0" />
                            <span className="break-words"><b>Error:</b> {crawlError}</span>
                        </div>
                    )}

                    {/* Final Status Messages */}
                    {!isCrawling && crawlProgress.status === 'success' && (
                         <p className="mb-3 text-sm text-green-600 flex items-center">
                            <FaCheckCircle className="mr-1" /> Journal crawl process completed successfully.
                        </p>
                    )}
                     {!isCrawling && (crawlProgress.status === 'error' || crawlProgress.status === 'stopped') && !crawlError && (
                         <p className="mb-3 text-sm text-red-600 flex items-center">
                            <FaTimesCircle className="mr-1" /> Journal crawl process failed or was stopped. Check logs.
                        </p>
                     )}


                    {/* Messages Log */}
                    {crawlMessages.length > 0 && (
                         <div className="max-h-60 overflow-y-auto bg-gray-50 p-3 rounded border border-gray-100 text-xs text-gray-600 space-y-1 custom-scrollbar">
                            {crawlMessages.map((msg, index) => (
                                <p key={index} className={`break-words ${msg.startsWith('FAILED') ? 'text-red-500 font-medium' : ''} ${msg.startsWith('Warning:') ? 'text-yellow-600' : ''}`}>
                                    {msg}
                                </p>
                             ))}
                         </div>
                     )}
                </div>
            )}

            {/* --- Render the Journal Preview Table --- */}
            {hasData && !isParsing && (
                <JournalPreviewTable data={parsedData} />
            )}
            {/* Message when parsing succeeded but no valid data was found */}
            {!hasData && file && !isParsing && !parseError && (
                 <div className="mt-6 p-4 border border-yellow-300 bg-yellow-50 rounded-lg text-center text-sm text-yellow-700">
                    Could not find valid journal data rows in the selected file to preview. Check file format and content.
                </div>
             )}
        </div>
    );
};

export default JournalCrawlUploader; // Export default if needed for dynamic import or page component