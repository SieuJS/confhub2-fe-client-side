import React, { useCallback, useMemo, useState } from 'react';
import { useConferenceCrawl } from '../../../../hooks/logAnalysis/useConferenceCrawl'; // Điều chỉnh đường dẫn
import { FaFileUpload, FaSpinner, FaPlay, FaStop, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaRedo, FaTable } from 'react-icons/fa';
import { Conference } from '@/src/models/logAnalysis/importConferenceCrawl';

// --- Component con để render bảng (tùy chọn, giúp code gọn hơn) ---
import { AllCommunityModule, ModuleRegistry, RowSelectionModule } from 'ag-grid-community'; 
import { AgGridReact } from 'ag-grid-react'; 
// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule, RowSelectionModule]);

export const ConferenceCrawlUploader: React.FC = () => {
    const {
        file,
        parsedData, // Dữ liệu đã parse
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
        onSelectionChanged
    } = useConferenceCrawl();

    const hasData = parsedData && parsedData.length > 0;
    const canStartCrawl = hasData && !isCrawling;
    const showStatusSection = isCrawling || crawlMessages.length > 0 || crawlError || crawlProgress.status !== 'idle'; // Condition to show status section State to manage selected rows

    const [colDef, setColDef] = useState([
        { field: "acronym" as keyof Conference, headerName: "Acronym", sortable: true, filter: true },
        { field: "title" as keyof Conference, headerName: "Title", sortable: true, filter: true },
        { field: "sources" as keyof Conference, headerName: "Sources", sortable: true, filter: true },
        { field: "ranks" as keyof Conference, headerName: "Ranks", sortable: true, filter: true },
        { field: "researchFields" as keyof Conference, headerName: "Research Fields", sortable: true, filter: true },
        { field: "status" as keyof Conference, headerName: "Status", sortable: true, filter: true },
    ]);

    const rowSelection = useMemo(() => {
        return {
          mode: "multiRow",
          checkBox : true, 
          headerCheckBox : true,
          enableClickSelection: true,
          selectAll: 'filtered',
        };
      }, []);


    
    return (
        <div className="p-4 md:p-6 bg-white shadow-lg rounded-lg border border-gray-200 mx-auto">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-300">
                Crawl Conferences from CSV
            </h2>

            {/* --- Main Content Area with Columns --- */}
            <div className="flex flex-col md:flex-row md:space-x-6"> {/* Flex container for columns */}

                {/* === Left Column === */}
                <div className="md:w-1/2 flex flex-col space-y-4"> {/* Left column takes half width on md+, stack items vertically */}

                    {/* --- File Upload Section --- */}
                    <div> {/* Wrap each section for spacing */}
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select CSV File (Requires columns: Title, Acronym for crawl, requires main, cfp, imp link if update )
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
                                <span className="text-sm text-gray-600 truncate flex-shrink min-w-0" title={file.name}>{file.name}</span> // Added flex-shrink & min-w-0
                            )}
                            {isParsing && <FaSpinner className="animate-spin text-blue-500" />}
                        </div>
                        {parseError && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                                <FaTimesCircle className="mr-1" /> {parseError}
                            </p>
                        )}
                        {hasData && !isParsing && (
                            <p className="mt-2 text-sm text-green-600 flex items-center">
                                <FaCheckCircle className="mr-1" /> Parsed {parsedData.length} conferences. Ready to crawl.
                            </p>
                        )}
                        {!hasData && file && !isParsing && !parseError && ( // Show message if file parsed but no valid data
                            <p className="mt-2 text-sm text-yellow-700 flex items-center">
                                <FaExclamationTriangle className="mr-1" /> Could not find valid conference data (Title, Acronym) in the selected file.
                            </p>
                        )}
                    </div>

                    {/* --- Configuration Section --- */}
                    {hasData && (
                        <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                            <h3 className="text-md font-semibold text-gray-700 mb-3">Crawl Configuration</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-3 sm:space-y-0">
                                <div className="flex items-center">
                                    <input
                                        id="enable-chunking"
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        checked={enableChunking}
                                        onChange={(e) => setEnableChunking(e.target.checked)}
                                        disabled={isCrawling}
                                    />
                                    <label htmlFor="enable-chunking" className="ml-2 block text-sm text-gray-900">
                                        Enable Chunking
                                    </label>
                                </div>
                                <div className={`flex items-center ${!enableChunking ? 'opacity-50' : ''}`}>
                                    <label htmlFor="chunk-size" className="mr-2 block text-sm font-medium text-gray-700">
                                        Chunk Size:
                                    </label>
                                    <input
                                        id="chunk-size"
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

                    {/* --- Action Buttons --- */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={startCrawl}
                            disabled={!canStartCrawl}
                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${canStartCrawl ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' : 'bg-gray-400 cursor-not-allowed'}`}
                        >
                            {isCrawling ? (
                                <FaSpinner className="animate-spin -ml-1 mr-2 h-5 w-5" />
                            ) : (
                                <FaPlay className="-ml-1 mr-2 h-5 w-5" /> // Simplified icon logic
                            )}
                            {/* Simplified button text */}
                            {isCrawling ? 'Crawling...' : (crawlProgress.status !== 'idle' && crawlProgress.status !== 'crawling' ? 'Start Crawl Again' : 'Start Crawl')}
                        </button>
                        <button
                            onClick={resetCrawl}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            title="Clear selection and results"
                            disabled={isCrawling} // Disable reset while crawling
                        >
                            <FaRedo className="mr-2" /> Reset
                        </button>
                    </div>

                    {/* --- Progress and Results Section --- */}
                    {showStatusSection && ( // Conditionally render the entire status section
                        <div className="p-4 border border-gray-200 rounded-md">
                            <h3 className="text-md font-semibold text-gray-700 mb-3">Crawl Status & Log</h3>
                            {/* Progress Bar (for chunking) */}
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
                                    <FaSpinner className="animate-spin mr-2" /> Sending entire list...
                                </p>
                            )}

                            {/* Error Display */}
                            {crawlError && (
                                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 flex items-start">
                                    <FaExclamationTriangle className="mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="break-words"><b>Error:</b> {crawlError}</span>
                                </div>
                            )}

                            {/* Final Status */}
                            {!isCrawling && crawlProgress.status === 'success' && (
                                <p className="mb-3 text-sm text-green-600 flex items-center">
                                    <FaCheckCircle className="mr-1" /> Crawl process completed successfully.
                                </p>
                            )}
                            {!isCrawling && (crawlProgress.status === 'error' || crawlProgress.status === 'stopped') && !crawlError && ( // Avoid showing double error if crawlError is set
                                <p className="mb-3 text-sm text-red-600 flex items-center">
                                    <FaTimesCircle className="mr-1" /> Crawl process failed or was stopped. Check logs for details.
                                </p>
                            )}


                            {/* Messages Log */}
                            {crawlMessages.length > 0 && (
                                <div className="max-h-60 overflow-y-auto bg-gray-50 p-3 rounded border border-gray-100 text-xs text-gray-600 space-y-1 custom-scrollbar">
                                    {crawlMessages.map((msg, index) => (
                                        <p key={index} className={`break-words ${msg.startsWith('FAILED') ? 'text-red-500 font-medium' : ''}`}>
                                            {msg}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div> {/* End Left Column */}

                {/* === Right Column === */}
                <div className="md:w-1/2 flex flex-col space-y-4 mt-4 md:mt-0"> {/* Right column, half width on md+, add margin top for mobile stacking */}
                    {/* --- Conference Preview Table Section --- */}
                    {hasData && !isParsing && ( // Show preview only if data was parsed successfully
                        <AgGridReact
                            className="ag-theme-alpine"
                            rowData={parsedData}
                            columnDefs={colDef}
                            rowSelection={rowSelection as any}
                            onSelectionChanged={onSelectionChanged}
                        />
                        // <ConferencePreviewTable data={parsedData} />
                    )}
                </div> {/* End Right Column */}

            </div> {/* End Flex Container */}
        </div>
    );
};

export default ConferenceCrawlUploader;