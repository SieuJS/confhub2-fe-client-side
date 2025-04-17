// src/hooks/logAnalysis/useJournalCrawl.ts

import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import Papa from 'papaparse';
import { Journal, ApiCrawlResponse, CrawlProgress } from '../../models/logAnalysis/importJournalCrawl'; // Import Journal types

// --- Configuration ---
const API_JOURNAL_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_URL}/crawl-journals`; // NEW ENDPOINT

// --- Utility Function (Keep as is) ---
function chunkArray<T>(array: T[], size: number): T[][] {
    if (size <= 0) return [array];
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

// --- Return Type for the Hook ---
export interface UseJournalCrawlReturn {
    file: File | null;
    parsedData: Journal[] | null; // Use Journal type
    isParsing: boolean;
    parseError: string | null;
    enableChunking: boolean;
    chunkSize: number;
    isCrawling: boolean;
    crawlError: string | null;
    crawlProgress: CrawlProgress; // Already references Journal via its definition
    crawlMessages: string[];
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setEnableChunking: (enabled: boolean) => void;
    setChunkSize: (size: number) => void;
    startCrawl: () => Promise<void>;
    resetCrawl: () => void;
}

// --- The Hook Implementation ---
export const useJournalCrawl = (): UseJournalCrawlReturn => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<Journal[] | null>(null); // Use Journal type
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [parseError, setParseError] = useState<string | null>(null);

    const [enableChunking, setEnableChunking] = useState<boolean>(false);
    const [chunkSize, setChunkSize] = useState<number>(5); // Default chunk size

    const [isCrawling, setIsCrawling] = useState<boolean>(false);
    const [crawlError, setCrawlError] = useState<string | null>(null);
    const [crawlProgress, setCrawlProgress] = useState<CrawlProgress>({ current: 0, total: 0, status: 'idle' });
    const [crawlMessages, setCrawlMessages] = useState<string[]>([]);

    // --- Reset Function (Mostly unchanged, but resets journal state) ---
    const resetCrawl = useCallback(() => {
        setFile(null);
        setParsedData(null);
        setIsParsing(false);
        setParseError(null);
        // Keep chunking settings
        setIsCrawling(false);
        setCrawlError(null);
        setCrawlProgress({ current: 0, total: 0, status: 'idle' });
        setCrawlMessages([]);
        console.log("Journal crawl state reset.");
    }, []); // Empty dependency array is fine here

    // --- File Handling and Parsing ---
    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        resetCrawl(); // Reset previous state
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.toLowerCase().endsWith('.csv')) {
                setParseError("Invalid file type. Please select a CSV file.");
                setFile(null);
                setParsedData(null);
                return;
            }
            setFile(selectedFile);
            setParseError(null);
            parseCSV(selectedFile); // Start parsing
        } else {
            setFile(null);
            setParsedData(null);
        }
        event.target.value = ''; // Allow re-selecting the same file
    }, [resetCrawl]); // Add resetCrawl here

    // --- CSV Parsing Logic (Adapted for Journals) ---
    const parseCSV = useCallback((csvFile: File) => {
        setIsParsing(true);
        setParsedData(null);
        setParseError(null);
        setCrawlMessages([]);

        Papa.parse<Journal>(csvFile, { // Specify Journal type for parsed rows
            header: true, // Use the first row as headers
            delimiter: ";", // Specify the delimiter
            skipEmptyLines: true,
            dynamicTyping: false, // Keep everything as string initially for consistency
            transformHeader: header => header.trim(), // Trim header whitespace
            transform: (value) => value.trim(), // Trim cell value whitespace
            complete: (results) => {
                console.log("Papaparse Raw Results:", results);

                // Filter out any potential empty rows or rows that didn't parse correctly
                // (e.g., if a row has fewer columns than the header)
                 // Basic check: Ensure 'Title' exists and is not empty as a proxy for a valid row
                const validJournals = results.data.filter(row => row.Title && row.Title.trim() !== '');

                if (results.errors.length > 0) {
                    console.warn("CSV Parsing Errors:", results.errors);
                    // Optionally show a warning, but proceed with valid data
                    setCrawlMessages(prev => [...prev, `Warning: Encountered ${results.errors.length} parsing errors. Check console.`]);
                }

                if (validJournals.length > 0) {
                    setParsedData(validJournals);
                    setCrawlMessages(prev => [...prev, `Successfully parsed ${validJournals.length} journals from ${csvFile.name}.`]);
                    console.log("Parsed Journals:", validJournals.slice(0, 5)); // Log first few parsed journals
                } else {
                    setParseError(`No valid journal data found in the CSV file. Ensure the header row exists and uses ';' as delimiter.`);
                    setParsedData(null);
                }
                setIsParsing(false);
            },
            error: (error: Error) => {
                console.error("CSV Parsing Error:", error);
                setParseError(`Error parsing CSV file: ${error.message}. Check delimiter and file format.`);
                setIsParsing(false);
                setParsedData(null);
            }
        });
    }, []);

    // --- API Call Logic (Adapted for Journals) ---
    const sendApiRequest = useCallback(async (payload: Journal[], description: string): Promise<boolean> => { // Use Journal type
        setCrawlError(null);
        try {
            const params = { dataSource: 'client' };
            // Use the new endpoint for journals
            const response = await axios.post<ApiCrawlResponse>(API_JOURNAL_ENDPOINT, payload, {
                params: params,
                headers: { 'Content-Type': 'application/json' },
                timeout: 600000 // 10 minutes timeout
            });

            console.log(`${description} - Response Status:`, response.status);
            setCrawlMessages(prev => [...prev, `${description}: ${response.data.message} (Runtime: ${response.data.runtime ?? 'N/A'}s)`]);
            return true;

        } catch (err) {
            const error = err as AxiosError<ApiCrawlResponse>;
            console.error(`API Error during ${description}:`, error);
            let errorMessage = `Error sending ${description}: ${error.message}`;
            if (error.response) {
                errorMessage += ` (Server: ${error.response.status} - ${error.response.data?.message || error.response.data?.error || 'Unknown error'})`;
            } else if (error.request) {
                errorMessage += ' (No response received from server)';
            }

            setCrawlError(errorMessage);
            setCrawlMessages(prev => [...prev, `FAILED to send ${description}. See error details.`]);
            return false;
        }
    }, []); // Dependencies: API_JOURNAL_ENDPOINT (implicitly constant)

    // --- Crawl Execution Logic (Largely unchanged, uses updated sendApiRequest and parsedData) ---
    const startCrawl = useCallback(async () => {
        if (!parsedData || parsedData.length === 0 || isCrawling) {
            console.warn("Cannot start journal crawl: No data parsed, data is empty, or already crawling.");
            return;
        }

        setIsCrawling(true);
        setCrawlError(null);
        setCrawlMessages(prev => [`Starting journal crawl process... (${enableChunking ? `Chunk size: ${chunkSize}` : 'Sending all'})`]);
        setCrawlProgress({ current: 0, total: 0, status: 'crawling' }); // Reset progress

        if (enableChunking) {
            const chunks = chunkArray(parsedData, chunkSize);
            const totalChunks = chunks.length;
            setCrawlProgress({ current: 0, total: totalChunks, status: 'crawling' });
            console.log(`Starting journal crawl in chunked mode. Total chunks: ${totalChunks}`);

            for (let i = 0; i < totalChunks; i++) {
                const currentChunk = chunks[i];
                const description = `Chunk ${i + 1}/${totalChunks}`;
                setCrawlProgress(prev => ({ ...prev, current: i + 1, currentChunkData: currentChunk }));

                const success = await sendApiRequest(currentChunk, description);

                if (!success) {
                    console.error(`Journal crawl stopped due to error in ${description}.`);
                    setCrawlProgress(prev => ({ ...prev, status: 'stopped' }));
                    setIsCrawling(false);
                    return; // Stop
                }
                // Optional delay: await new Promise(resolve => setTimeout(resolve, 500));
            }

            console.log("Finished sending all journal chunks successfully.");
            setCrawlProgress(prev => ({ ...prev, status: 'success' }));
            setCrawlMessages(prev => [...prev, `Successfully processed all ${totalChunks} journal chunks.`]);

        } else {
            console.log("Starting journal crawl in 'send all' mode.");
            setCrawlProgress({ current: 1, total: 1, status: 'crawling', currentChunkData: parsedData });
            const description = "Entire Journal List";
            const success = await sendApiRequest(parsedData, description);

            if (success) {
                console.log("Finished sending entire journal list successfully.");
                setCrawlProgress({ current: 1, total: 1, status: 'success' });
                setCrawlMessages(prev => [...prev, `Successfully processed the entire journal list.`]);
            } else {
                console.error(`Journal crawl failed when sending the entire list.`);
                setCrawlProgress({ current: 1, total: 1, status: 'error' });
            }
        }

        setIsCrawling(false); // Mark as finished

    }, [parsedData, isCrawling, enableChunking, chunkSize, sendApiRequest]);

    // --- Return Values ---
    return {
        file,
        parsedData,
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
    };
};