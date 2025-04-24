// src/app/[locale]/dashboard/logAnalysis/JournalCrawlUpoader.tsx

import React from 'react';
// Import the refactored hook and types
import { useJournalCrawl } from '../../../../hooks/crawl/useJournalCrawl'; // Adjust path as needed
import { Journal } from '@/src/models/logAnalysis/importJournalCrawl'; // Adjust path as needed
import { FaFileUpload, FaSpinner, FaPlay, FaStop, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaRedo, FaTable } from 'react-icons/fa';

// --- Simplified Journal Preview Table Component (Defined within or imported) ---
const JournalPreviewTable: React.FC<{ data: Journal[] }> = ({ data }) => (
    <div className="mt-6 border border-gray-200 rounded-lg shadow-sm">
        <h3 className="text-md font-semibold text-gray-700 p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg flex items-center">
            <FaTable className="mr-2 text-gray-500" /> Preview Parsed Journals ({data.length} items)
        </h3>
        <div className="max-h-96 overflow-auto custom-scrollbar">
            <table className="min-w-full divide-y divide-gray-200">
                {/* Updated Header: Only Rank and Title */}
                <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                        <th scope="col" className="sticky left-0 bg-gray-100 px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider z-20">
                            Rank
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider min-w-[300px]"> {/* Optional: Keep min-width for Title */}
                            Title
                        </th>
                    </tr>
                </thead>
                {/* Updated Body: Only Rank and Title */}
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((journal, index) => (
                        // Use a unique key, Sourceid might be better if guaranteed unique, otherwise index is fallback
                        <tr key={journal.Sourceid ? `${journal.Sourceid}-${index}` : index} className="hover:bg-gray-50">
                            {/* Rank Cell */}
                            <td className="sticky left-0 bg-white px-3 py-2 whitespace-nowrap text-sm text-gray-500 z-10">
                                {journal.Rank ?? 'N/A'}
                            </td>
                            {/* Title Cell */}
                            <td className="px-3 py-2 text-sm text-gray-900">
                                {journal.Title ?? 'N/A'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {/* Message if no data */}
        {data.length === 0 && (
            <p className="p-4 text-center text-sm text-gray-500">No journals found in the preview data.</p>
        )}
    </div>
);


// --- Main Uploader Component ---
export const JournalCrawlUploader: React.FC = () => {
    // Use the refactored journal hook
    const {
        file,
        parsedDataForPreview, // Use this for the preview table
        rawCsvContent,      // Use this to determine if crawl can start
        isParsing,
        parseError,
        // Chunking state/setters are removed from the hook
        isCrawling,
        crawlError,
        crawlProgress, // Simplified progress object
        crawlMessages,
        handleFileChange,
        // Chunking setters are removed from the hook
        startCrawl,
        resetCrawl,
    } = useJournalCrawl();

    // Determine if data is ready for preview
    const hasPreviewData = parsedDataForPreview && parsedDataForPreview.length > 0;
    // Determine if data is ready to be sent (raw content exists and not busy)
    const canStartCrawl = !!rawCsvContent && !isCrawling && !isParsing;

    return (
        <div className="p-4 md:p-6 bg-white shadow-lg rounded-lg border border-gray-200 mx-auto max-w-4xl"> {/* Optional: Added max-width */}
            <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-300">
                Crawl Journals from SCImago CSV
            </h2>

            {/* --- File Upload Section --- */}
            <div className="mb-6"> {/* Increased bottom margin */}
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select SCImago Journal CSV File (Semicolon-delimited ';')
                </label>
                <div className="flex items-center space-x-4">
                    {/* File Input Label */}
                    <label className={`relative inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${isParsing || isCrawling ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <FaFileUpload className={`mr-2 ${isParsing ? 'animate-spin' : ''}`} />
                        <span>{isParsing ? 'Reading...' : (file ? 'Change File' : 'Choose File')}</span>
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept=".csv, text/csv" // Accept standard CSV MIME types and extension
                            onChange={handleFileChange}
                            disabled={isParsing || isCrawling}
                        />
                    </label>
                    {/* File Name Display */}
                    {file && !isParsing && (
                        <span className="text-sm text-gray-600 truncate" title={file.name}>{file.name}</span>
                    )}
                    {/* Parsing Spinner */}
                    {isParsing && <FaSpinner className="animate-spin text-blue-500" />}
                </div>
                {/* Parsing Error Message */}
                {parseError && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                        <FaTimesCircle className="mr-1" /> {parseError}
                    </p>
                )}
                {/* Success Message (based on raw content and preview status) */}
                {rawCsvContent && !isParsing && !parseError && (
                    <p className="mt-2 text-sm text-green-600 flex items-center">
                        <FaCheckCircle className="mr-1" /> File read successfully. {hasPreviewData ? `${parsedDataForPreview.length} journals parsed for preview.` : 'Preview generation failed or no data found.'} Ready to crawl.
                    </p>
                )}
                 {/* Message if reading succeeded but preview parsing failed */}
                 {rawCsvContent && !hasPreviewData && !isParsing && parseError?.includes('preview') && (
                     <p className="mt-2 text-sm text-yellow-700 flex items-center">
                        <FaExclamationTriangle className="mr-1" /> Warning: Could not generate preview. Raw data is loaded and can be sent.
                    </p>
                 )}
            </div>

            {/* --- Configuration Section Removed --- */}
            {/* No chunking options needed */}

            {/* --- Action Buttons --- */}
            <div className="flex items-center space-x-4 mb-6"> {/* Increased bottom margin */}
                <button
                    onClick={startCrawl}
                    disabled={!canStartCrawl} // Enable based on rawCsvContent and not busy
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors duration-150 ${canStartCrawl ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                    {isCrawling ? (
                        <FaSpinner className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    ) : (
                        <FaPlay className="-ml-1 mr-2 h-5 w-5" />
                    )}
                    {isCrawling ? 'Sending Data...' : (crawlProgress.status === 'success' || crawlProgress.status === 'error' || crawlProgress.status === 'stopped' ? 'Send Again' : 'Start Journal Crawl')}
                </button>
                 <button
                    onClick={resetCrawl}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                    title="Clear selection and results"
                    disabled={isCrawling || isParsing} // Disable reset while busy
                >
                    <FaRedo className="mr-2" /> Reset
                </button>
            </div>

             {/* --- Progress and Results Section --- */}
             {(isCrawling || crawlMessages.length > 0 || crawlError || crawlProgress.status !== 'idle') && (
                <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50"> {/* Added subtle background */}
                    <h3 className="text-md font-semibold text-gray-700 mb-3">Crawl Status & Log</h3>

                    {/* Crawling indicator */}
                     {isCrawling && crawlProgress.status === 'crawling' && (
                        <p className="mb-3 text-sm text-blue-600 flex items-center">
                            <FaSpinner className="animate-spin mr-2" /> Sending journal data to backend for processing... This may take a while.
                        </p>
                    )}

                    {/* Error Display */}
                    {crawlError && (
                         <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded-md text-sm text-red-800 flex items-start"> {/* Adjusted colors */}
                            <FaExclamationTriangle className="mr-2 mt-0.5 flex-shrink-0 text-red-600" /> {/* Icon color */}
                            <span className="break-words"><b>Error:</b> {crawlError}</span>
                        </div>
                    )}

                    {/* Final Status Messages */}
                    {!isCrawling && crawlProgress.status === 'success' && (
                         <p className="mb-3 text-sm text-green-700 flex items-center"> {/* Adjusted color */}
                            <FaCheckCircle className="mr-1 text-green-600" /> {/* Icon color */}
                            Backend request completed successfully. Check backend logs for processing details and results.
                        </p>
                    )}
                     {!isCrawling && (crawlProgress.status === 'error') && !crawlError && (
                         <p className="mb-3 text-sm text-red-800 flex items-center"> {/* Adjusted color */}
                            <FaTimesCircle className="mr-1 text-red-600" /> {/* Icon color */}
                            Backend request failed. Check logs for details.
                        </p>
                     )}
                     {!isCrawling && (crawlProgress.status === 'stopped') && (
                         <p className="mb-3 text-sm text-yellow-800 flex items-center"> {/* Adjusted color */}
                            <FaStop className="mr-1 text-yellow-600" /> {/* Icon color */}
                            Process stopped.
                        </p>
                     )}


                    {/* Messages Log */}
                    {crawlMessages.length > 0 && (
                         <div className="max-h-60 overflow-y-auto bg-white p-3 rounded border border-gray-200 text-xs text-gray-700 space-y-1 custom-scrollbar shadow-inner"> {/* Adjusted styles */}
                            <h4 className="text-xs font-semibold text-gray-500 mb-1">Log Messages:</h4>
                            {crawlMessages.map((msg, index) => (
                                <p key={index} className={`break-words ${msg.startsWith('FAILED') ? 'text-red-600 font-medium' : ''} ${msg.startsWith('Warning:') ? 'text-yellow-700' : ''} ${msg.startsWith('Successfully') ? 'text-green-600' : ''}`}>
                                    {msg}
                                </p>
                             ))}
                         </div>
                     )}
                </div>
            )} {/* End Progress and Results Section */}

            {/* --- Render the Journal Preview Table --- */}
            {hasPreviewData && !isParsing && (
                <JournalPreviewTable data={parsedDataForPreview} />
            )}

            {/* Message when reading succeeded but no valid preview data was found */}
            {rawCsvContent && !hasPreviewData && !isParsing && !parseError?.includes('preview') && !parseError?.includes('Error reading file') && (
                 <div className="mt-6 p-4 border border-yellow-400 bg-yellow-100 rounded-lg text-center text-sm text-yellow-800"> {/* Adjusted colors */}
                    File read, but could not find valid journal data rows for preview. Check file format (header, ';' delimiter) and content. You can still attempt to send the raw data.
                </div>
             )}
        </div> // End Main Component Div
    );
};

export default JournalCrawlUploader; // Export default if needed for dynamic import or page component