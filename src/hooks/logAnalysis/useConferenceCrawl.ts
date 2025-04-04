import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import Papa from 'papaparse';
import { Conference, ApiCrawlResponse, CrawlProgress } from '../../models/logAnalysis/importCrawl'; // Điều chỉnh đường dẫn nếu cần

// --- Configuration ---
const API_CONFERENCE_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_URL}/crawl-conferences`;

// --- Utility Function ---
function chunkArray<T>(array: T[], size: number): T[][] {
    if (size <= 0) return [array]; // Trả về mảng gốc nếu size không hợp lệ
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

export interface UseConferenceCrawlReturn {
    file: File | null;
    parsedData: Conference[] | null;
    isParsing: boolean;
    parseError: string | null;
    enableChunking: boolean;
    chunkSize: number;
    isCrawling: boolean;
    crawlError: string | null;
    crawlProgress: CrawlProgress;
    crawlMessages: string[];
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setEnableChunking: (enabled: boolean) => void;
    setChunkSize: (size: number) => void;
    startCrawl: () => Promise<void>;
    resetCrawl: () => void; // Thêm hàm reset
}

export const useConferenceCrawl = (): UseConferenceCrawlReturn => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<Conference[] | null>(null);
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [parseError, setParseError] = useState<string | null>(null);

    const [enableChunking, setEnableChunking] = useState<boolean>(false);
    const [chunkSize, setChunkSize] = useState<number>(5); // Default chunk size

    const [isCrawling, setIsCrawling] = useState<boolean>(false);
    const [crawlError, setCrawlError] = useState<string | null>(null);
    const [crawlProgress, setCrawlProgress] = useState<CrawlProgress>({ current: 0, total: 0, status: 'idle' });
    const [crawlMessages, setCrawlMessages] = useState<string[]>([]);

    // --- File Handling and Parsing ---
    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        resetCrawl(); // Reset trạng thái crawl cũ khi chọn file mới
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
            parseCSV(selectedFile);
        } else {
            setFile(null);
            setParsedData(null);
        }
        // Reset input value để có thể chọn lại cùng file
        event.target.value = '';
    }, []); // Bỏ resetCrawl khỏi dependency array để tránh loop nếu resetCrawl thay đổi state

    const parseCSV = useCallback((csvFile: File) => {
        setIsParsing(true);
        setParsedData(null); // Xóa data cũ
        setParseError(null);
        setCrawlMessages([]); // Xóa message cũ

        Papa.parse<string[]>(csvFile, {
            skipEmptyLines: true,
            complete: (results) => {
                const conferences: Conference[] = [];
                results.data.forEach((row, index) => {
                    // Giả sử Title ở cột 1 (index 1), Acronym ở cột 2 (index 2)
                    // Bỏ qua header nếu có (có thể cần logic phức tạp hơn để phát hiện header)
                     if (index === 0) { // Ví dụ bỏ qua dòng đầu tiên
                        console.log("Skipping potential header row:", row);
                        // return; // Bỏ comment nếu chắc chắn dòng đầu là header
                     }

                    const Title = row[1]?.trim();
                    const Acronym = row[2]?.trim();

                    if (Title && Acronym) {
                        conferences.push({ Title, Acronym });
                    } else if (row.some(cell => cell?.trim())) { // Chỉ log lỗi nếu hàng không hoàn toàn trống
                        console.warn(`Skipping row ${index + 1} due to missing Title or Acronym:`, row);
                    }
                });

                if (conferences.length > 0) {
                    setParsedData(conferences);
                    setCrawlMessages([`Successfully parsed ${conferences.length} conferences from ${csvFile.name}.`]);
                } else {
                    setParseError(`No valid conference data (Title, Acronym) found in the CSV file.`);
                    setParsedData(null);
                }
                setIsParsing(false);
            },
            error: (error: Error) => {
                console.error("CSV Parsing Error:", error);
                setParseError(`Error parsing CSV file: ${error.message}`);
                setIsParsing(false);
                setParsedData(null);
            }
        });
    }, []);


    // --- API Call Logic ---
    const sendApiRequest = useCallback(async (payload: Conference[], description: string): Promise<boolean> => {
        setCrawlError(null); // Clear previous error for this request
        try {
            const params = { dataSource: 'client' };
            const response = await axios.post<ApiCrawlResponse>(API_CONFERENCE_ENDPOINT, payload, {
                params: params,
                headers: { 'Content-Type': 'application/json' },
                timeout: 600000 // Tăng timeout (vd: 10 phút) cho các request lớn/chunk
            });

            console.log(`${description} - Response Status:`, response.status);
            setCrawlMessages(prev => [...prev, `${description}: ${response.data.message} (Runtime: ${response.data.runtime ?? 'N/A'}s)`]);
            return true;

        } catch (err) {
            const error = err as AxiosError<ApiCrawlResponse>; // Type assertion
            console.error(`API Error during ${description}:`, error);
            let errorMessage = `Error sending ${description}: ${error.message}`;
            if (error.response) {
                console.error('Server Response Status:', error.response.status);
                console.error('Server Response Data:', error.response.data);
                errorMessage += ` (Server: ${error.response.status} - ${error.response.data?.message || error.response.data?.error || 'Unknown error'})`;
            } else if (error.request) {
                errorMessage += ' (No response received from server)';
            }

            setCrawlError(errorMessage); // Set error cho cả lần crawl
            setCrawlMessages(prev => [...prev, `FAILED to send ${description}. See error details.`]); // Thêm message lỗi
            return false;
        }
    }, []);


    // --- Crawl Execution Logic ---
    const startCrawl = useCallback(async () => {
        if (!parsedData || parsedData.length === 0 || isCrawling) {
            console.warn("Cannot start crawl: No data parsed, data is empty, or already crawling.");
            return;
        }

        setIsCrawling(true);
        setCrawlError(null);
        setCrawlMessages(prev => [`Starting crawl process... (${enableChunking ? `Chunk size: ${chunkSize}` : 'Sending all'})`]);
        setCrawlProgress({ current: 0, total: 0, status: 'crawling' }); // Reset progress

        if (enableChunking) {
            // --- Chunked Mode ---
            const chunks = chunkArray(parsedData, chunkSize);
            const totalChunks = chunks.length;
            setCrawlProgress({ current: 0, total: totalChunks, status: 'crawling' });
            console.log(`Starting crawl in chunked mode. Total chunks: ${totalChunks}`);

            for (let i = 0; i < totalChunks; i++) {
                const currentChunk = chunks[i];
                const description = `Chunk ${i + 1}/${totalChunks}`;
                setCrawlProgress(prev => ({ ...prev, current: i + 1, currentChunkData: currentChunk })); // Cập nhật progress trước khi gửi

                const success = await sendApiRequest(currentChunk, description);

                if (!success) {
                    console.error(`Crawl stopped due to error in ${description}.`);
                    setCrawlProgress(prev => ({ ...prev, status: 'stopped' }));
                    setIsCrawling(false);
                    return; // Stop processing further chunks
                }
                 // Optional delay between chunks if needed
                 // await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 second delay
            }

            console.log("Finished sending all chunks successfully.");
            setCrawlProgress(prev => ({ ...prev, status: 'success' }));
            setCrawlMessages(prev => [...prev, `Successfully processed all ${totalChunks} chunks.`]);

        } else {
            // --- Send All Mode ---
            console.log("Starting crawl in 'send all' mode.");
            setCrawlProgress({ current: 1, total: 1, status: 'crawling', currentChunkData: parsedData }); // Progress là 1/1
            const description = "Entire List";
            const success = await sendApiRequest(parsedData, description);

            if (success) {
                console.log("Finished sending entire list successfully.");
                setCrawlProgress({ current: 1, total: 1, status: 'success' });
                setCrawlMessages(prev => [...prev, `Successfully processed the entire list.`]);
            } else {
                 console.error(`Crawl failed when sending the entire list.`);
                setCrawlProgress({ current: 1, total: 1, status: 'error' });
                // Lỗi đã được set trong sendApiRequest
            }
        }

        setIsCrawling(false); // Mark crawling as finished (success, error, or stopped)

    }, [parsedData, isCrawling, enableChunking, chunkSize, sendApiRequest]);

    // --- Reset Function ---
     const resetCrawl = useCallback(() => {
        setFile(null);
        setParsedData(null);
        setIsParsing(false);
        setParseError(null);
        // Giữ lại cài đặt chunking của người dùng
        // setEnableChunking(false);
        // setChunkSize(5);
        setIsCrawling(false);
        setCrawlError(null);
        setCrawlProgress({ current: 0, total: 0, status: 'idle' });
        setCrawlMessages([]);
        console.log("Crawl state reset.");
    }, []);


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