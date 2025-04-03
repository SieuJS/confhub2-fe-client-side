import React, { useState, useEffect, useMemo } from 'react'; // Thêm useMemo
import ReactECharts from 'echarts-for-react';
import { useLogAnalysisData } from '../../../../hooks/logAnalysis/useLogAnalysisData';
import { FaCheckCircle, FaTimesCircle, FaMinusCircle, FaExclamationTriangle, FaChevronDown, FaChevronUp, FaSyncAlt, FaFilter, FaClock } from 'react-icons/fa'; // Thêm icons

import { getBarChartOption, getPieChartOption, transformRecordForBarChart } from './utils/chartUtils';

type BarChartData = { labels: string[]; values: number[] };


// Helper function to format duration (Giữ nguyên)
const formatDuration = (seconds: number | null | undefined): string => {
    if (seconds === null || seconds === undefined) return 'N/A';
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(0);
    return `${minutes}m ${remainingSeconds}s`;
};

// Helper function to render status icons (Giữ nguyên)
const StatusIcon: React.FC<{ success: boolean | null | undefined, attempted?: boolean | null | undefined }> = ({ success, attempted }) => {
    if (success === true) return <FaCheckCircle className="text-green-500" title="Success" />;
    if (success === false) return <FaTimesCircle className="text-red-500" title="Failed" />;
    if (attempted === false) return <FaMinusCircle className="text-gray-400" title="Not Attempted" />;

    return <FaMinusCircle className="text-yellow-500" title="Unknown/Not Run" />; // Trạng thái không xác định
};



// --- Component Chính ---
const Analysis: React.FC = () => {
    // --- State cho Bộ lọc Thời gian ---
    const [timeFilterOption, setTimeFilterOption] = useState<string>('latest'); // e.g., 'latest', 'last_hour', 'last_24h', 'last_7d'
    const [filterStartTime, setFilterStartTime] = useState<number | undefined>(undefined);
    const [filterEndTime, setFilterEndTime] = useState<number | undefined>(undefined);

    // --- Tính toán startTime/endTime dựa trên lựa chọn filter ---
    useEffect(() => {
        const now = Date.now();
        let start: number | undefined = undefined;
        let end: number | undefined = now; // Mặc định là đến hiện tại

        switch (timeFilterOption) {
            case 'last_hour':
                start = now - 60 * 60 * 1000;
                break;
            case 'last_6h':
                start = now - 6 * 60 * 60 * 1000;
                break;
            case 'last_24h':
                start = now - 24 * 60 * 60 * 1000;
                break;
            case 'last_7d':
                start = now - 7 * 24 * 60 * 60 * 1000;
                break;
            case 'latest': // Hoặc 'all_time'
            default:
                start = undefined;
                end = undefined; // Không lọc theo thời gian
                break;
        }
        console.log(`Time filter changed to: ${timeFilterOption}. Start: ${start ? new Date(start).toISOString() : 'None'}, End: ${end ? new Date(end).toISOString() : 'None'}`);
        setFilterStartTime(start);
        setFilterEndTime(end);
    }, [timeFilterOption]);

    // *** Truyền filterStartTime và filterEndTime vào hook ***
    const { data, loading, error, isConnected, refetchData } = useLogAnalysisData(filterStartTime, filterEndTime);

    const [expandedConference, setExpandedConference] = useState<string | null>(null);
    // const [countdown, setCountdown] = useState<number>(300); // Countdown có thể không còn phù hợp nếu dùng socket push hoặc fetch tự động

    // // --- Effect cho Bộ đếm ngược (Xem xét lại) ---
    // // Nếu dùng socket push hoặc tự fetch, countdown này có thể gây nhầm lẫn
    // // Có thể thay bằng chỉ báo "Last updated: X seconds ago"
    // useEffect(() => {
    //     // ... (logic countdown cũ)
    // }, [data, isConnected]);

    // --- Hàm xử lý thay đổi bộ lọc ---
    const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setTimeFilterOption(event.target.value);
        // Hook sẽ tự động fetch lại do dependencies trong useEffect thay đổi
    };

    // Function toggle expand (Giữ nguyên)
    const toggleExpand = (acronym: string) => {
        setExpandedConference(expandedConference === acronym ? null : acronym);
    };

    // --- Chuẩn bị dữ liệu biểu đồ (Sử dụng useMemo để tránh tính toán lại không cần thiết) ---
    // Các tính toán này chỉ chạy lại khi `data` thay đổi thực sự
    const overallStatusData = useMemo(() => {
        if (!data?.overall) return [];




        const failedOrCrashedTasks = data.overall.failedOrCrashedTasks || 0;
        const totalCompletedTasks = data.overall.completedTasks || 0;
        const successfulExtractions = data.overall.successfulExtractions || 0;
        const completedWithoutSuccessExt = Math.max(0, totalCompletedTasks - successfulExtractions);
        return [
            { name: 'Completed (Extraction OK)', value: successfulExtractions },
            { name: 'Completed (Not extract or failed)', value: completedWithoutSuccessExt },
            { name: 'Failed/Crashed', value: failedOrCrashedTasks },
        ].filter(item => item.value > 0);
    }, [data?.overall]);



    const searchStatusData = useMemo(() => {
        if (!data?.googleSearch) return [];
        return [
            { name: 'Successful', value: data.googleSearch.successfulSearches || 0 },
            { name: 'Failed', value: data.googleSearch.failedSearches || 0 },
            { name: 'Skipped', value: data.googleSearch.skippedSearches || 0 },
            { name: 'Quota Errors', value: data.googleSearch.quotaErrors || 0 },
        ].filter(item => item.value > 0); // Chỉ hiển thị nếu có giá trị
    }, [data?.googleSearch]);

    const apiStatusData = useMemo(() => {
        if (!data?.geminiApi) return [];
        const retries = (data.geminiApi.retriesByType['determine'] || 0) + (data.geminiApi.retriesByType['extract'] || 0)
        return [
            { name: 'Successful', value: data.geminiApi.successfulCalls || 0 },
            { name: 'Failed', value: data.geminiApi.failedCalls || 0 },
            { name: 'Blocked', value: data.geminiApi.blockedBySafety || 0 },
            ...(retries > 0 ? [{ name: 'Retries', value: retries }] : []), // Chỉ thêm retries nếu > 0
        ].filter(item => item.value > 0);
    }, [data?.geminiApi]);

    const cacheStatusData = useMemo(() => {
        if (!data?.geminiApi) return [];
        return [
            { name: 'Cache Hits', value: data.geminiApi.cacheHits || 0 },
            { name: 'Cache Misses', value: data.geminiApi.cacheMisses || 0 },
        ].filter(item => item.value > 0);
    }, [data?.geminiApi]);

    const playwrightLinkData = useMemo(() => {
        if (!data?.playwright?.linkProcessing) return [];
        return [
            { name: 'Successful Access', value: data.playwright.linkProcessing.successfulAccess || 0 },
            { name: 'Failed Access', value: data.playwright.linkProcessing.failedAccess || 0 },
            { name: 'Redirects', value: data.playwright.linkProcessing.redirects || 0 },
        ].filter(item => item.value > 0);
    }, [data?.playwright?.linkProcessing]);

    const callsByModelWithRetriesData = useMemo<BarChartData>(() => { // <-- Explicit Type
        // The helper function already handles undefined/empty input
        const { callsByModel = {}, retriesByModel = {} } = data?.geminiApi ?? {}; // Use nullish coalescing for safety
        const combined: Record<string, number> = {};
        const allKeys = new Set([...Object.keys(callsByModel), ...Object.keys(retriesByModel)]);
        allKeys.forEach(model => {
            combined[model] = (callsByModel[model] || 0) + (retriesByModel[model] || 0);
        });
        return transformRecordForBarChart(combined, 0, false);
    }, [data?.geminiApi]);

    const apiKeyUsageData = useMemo<BarChartData>(() => { // <-- Explicit Type
        // The helper function handles undefined input
        return transformRecordForBarChart(data?.googleSearch?.keyUsage, 0, false);
    }, [data?.googleSearch?.keyUsage]);

    const callsByTypeWithRetriesData = useMemo<BarChartData>(() => { // <-- Explicit Type
        const { callsByType = {}, retriesByType = {} } = data?.geminiApi ?? {}; // Use nullish coalescing
        const combined: Record<string, number> = {};
        const allKeys = new Set([...Object.keys(callsByType), ...Object.keys(retriesByType)]);
        allKeys.forEach(type => {
            combined[type] = (callsByType[type] || 0) + (retriesByType[type] || 0);
        });
        return transformRecordForBarChart(combined, 0, false);
    }, [data?.geminiApi]);

    // Ensure topErrorsData also has the explicit type if it uses the same helper
    const topErrorsData = useMemo<BarChartData>(() => { // <-- Explicit Type
        // Assuming errorsAggregated is also a Record<string, number> or undefined
        return transformRecordForBarChart(data?.errorsAggregated as Record<string, number> | undefined, 10, true);
        // Cast 'data?.errorsAggregated' if its type is too generic (like 'any' or 'object')
        // If data.errorsAggregated has a more specific known type, use that instead of casting.
    }, [data?.errorsAggregated]);




    // --- Render Logic ---
    // Hiển thị loading nếu đang fetch (kể cả khi có data cũ)
    if (loading) {
        return (
            <div className="p-4 md:p-6">
                {/* Hiển thị UI control (filter, refresh) ngay cả khi đang loading */}
                <div className="flex justify-between items-center mb-4 gap-4">
                    <div className="flex items-center gap-2">
                        <FaFilter className="text-gray-600" />
                        <select
                            value={timeFilterOption}
                            onChange={handleFilterChange}
                            className="p-2 border rounded bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loading} // Disable khi đang loading
                        >
                            <option value="latest">All Time</option>
                            <option value="last_hour">Last Hour</option>
                            <option value="last_6h">Last 6 Hours</option>
                            <option value="last_24h">Last 24 Hours</option>
                            <option value="last_7d">Last 7 Days</option>
                            {/* Thêm các lựa chọn khác nếu cần */}
                        </select>
                    </div>
                    <button
                        onClick={refetchData}
                        disabled={loading} // Disable khi đang loading
                        className={`p-2 rounded text-white shadow-sm flex items-center gap-1 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        title="Refresh Data"
                    >
                        <FaSyncAlt className={loading ? 'animate-spin' : ''} />
                        <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                </div>
                <div className="flex justify-center items-center h-64 text-gray-600">
                    Loading Analysis Data...
                </div>
            </div>
        );
    }

    // Hiển thị lỗi toàn màn hình chỉ khi không có dữ liệu cũ nào để hiển thị
    if (error && !data) {
        return (
            <div className="p-4 md:p-6">
                {/* Vẫn hiển thị control để người dùng thử lại */}
                <div className="flex justify-between items-center mb-4 gap-4">
                    <div className="flex items-center gap-2">
                        <FaFilter className="text-gray-600" />
                        <select
                            value={timeFilterOption}
                            onChange={handleFilterChange}
                            className="p-2 border rounded bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="latest">All Time</option>
                            <option value="last_hour">Last Hour</option>
                            <option value="last_6h">Last 6 Hours</option>
                            <option value="last_24h">Last 24 Hours</option>
                            <option value="last_7d">Last 7 Days</option>
                        </select>
                    </div>
                    <button
                        onClick={refetchData}
                        className="p-2 rounded text-white shadow-sm flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
                        title="Refresh Data"
                    >
                        <FaSyncAlt />
                        <span>Refresh</span>
                    </button>
                </div>
                <div className="flex flex-col justify-center items-center h-64 text-red-600 font-semibold">
                    <FaExclamationTriangle size={24} className="mb-2" />
                    Error loading data: {error}
                    <span className="text-sm text-gray-500 mt-1">(Check console for details)</span>
                </div>
            </div>
        );
    }

    // Không có data và không có lỗi (ví dụ: backend trả về 404 nhưng không phải lỗi 500)
    if (!data) {
        return (
            <div className="p-4 md:p-6">
                {/* Vẫn hiển thị control */}
                <div className="flex justify-between items-center mb-4 gap-4">
                    <div className="flex items-center gap-2">
                        <FaFilter className="text-gray-600" />
                        <select
                            value={timeFilterOption}
                            onChange={handleFilterChange}
                            className="p-2 border rounded bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="latest">All Time</option>
                            <option value="last_hour">Last Hour</option>
                            <option value="last_6h">Last 6 Hours</option>
                            <option value="last_24h">Last 24 Hours</option>
                            <option value="last_7d">Last 7 Days</option>
                        </select>
                    </div>
                    <button
                        onClick={refetchData}
                        className="p-2 rounded text-white shadow-sm flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
                        title="Refresh Data"
                    >
                        <FaSyncAlt />
                        <span>Refresh</span>
                    </button>
                </div>
                <div className="flex justify-center items-center h-64 text-gray-500">
                    No analysis data available for the selected period.
                </div>
            </div>
        );
    }



    // ========================================================================
    // ========================= JSX Rendering ================================
    // ========================================================================

    // --- Trường hợp Loading ---
    // Vẫn hiển thị header với controls bị disable
    if (loading && !data) { // Chỉ hiển thị loading toàn trang nếu chưa có data cũ
        return (
            <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen font-sans">
                {/* --- Header (Disabled State) --- */}
                <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500 gap-y-3 md:gap-y-0">
                    {/* Left Side: Title & Meta Info */}
                    <div className="flex-grow">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Crawl Process Analysis</h1>
                        <div className="text-sm text-gray-500 mt-1 flex items-center flex-wrap gap-x-4 gap-y-1">
                            <span>Last Analysis: Loading...</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 truncate">Log File: Loading...</p>
                    </div>
                    {/* Right Side: Controls & Status (Disabled) */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-3 md:mt-0 shrink-0">
                        {/* Filter Control (Disabled) */}
                        <div className="flex items-center gap-2">
                            <FaFilter className="text-gray-400" title="Filter Time Range" />
                            <select
                                value={timeFilterOption}
                                onChange={handleFilterChange}
                                disabled={true}
                                className="p-2 border rounded bg-gray-100 text-gray-500 shadow-sm text-sm cursor-not-allowed"
                            >
                                <option value="latest">All Time</option>
                                <option value="last_hour">Last Hour</option>
                                <option value="last_6h">Last 6 Hours</option>
                                <option value="last_24h">Last 24 Hours</option>
                                <option value="last_7d">Last 7 Days</option>
                            </select>
                        </div>
                        {/* Refresh Button & Status (Disabled) */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={refetchData}
                                disabled={true}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-gray-400 cursor-not-allowed"
                            >
                                <FaSyncAlt className="mr-1.5 h-3 w-3 animate-spin" />
                                Refreshing...
                            </button>
                        </div>
                        {/* Connection Status (Disabled Look) */}
                        <div className="text-sm px-4 py-1.5 rounded-full font-medium flex items-center gap-2 shrink-0 bg-gray-100 text-gray-500">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gray-400"></span>
                            </span>
                            Realtime: Checking...
                        </div>
                    </div>
                </header>
                {/* --- Loading Indicator --- */}
                <div className="flex justify-center items-center h-[calc(100vh-200px)] text-gray-600"> {/* Adjust height as needed */}
                    Loading Analysis Data...
                </div>
            </div>
        );
    }

    // --- Trường hợp Error (và không có data cũ) ---
    if (error && !data) {
        return (
            <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-100 to-red-50 min-h-screen font-sans"> {/* Red gradient for error */}
                {/* --- Header (với controls hoạt động để thử lại) --- */}
                <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500 gap-y-3 md:gap-y-0"> {/* Red border */}
                    {/* Left Side */}
                    <div className="flex-grow">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Crawl Process Analysis</h1>
                        <div className="text-sm text-gray-500 mt-1">
                            <span>Last Analysis: Error</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 truncate">Log File: Unknown</p>
                    </div>
                    {/* Right Side: Controls & Status */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-3 md:mt-0 shrink-0">
                        {/* Filter Control */}
                        <div className="flex items-center gap-2">
                            <FaFilter className="text-gray-600" title="Filter Time Range" />
                            <select
                                value={timeFilterOption}
                                onChange={handleFilterChange}
                                disabled={loading} // Vẫn disable nếu đang thử lại
                                className={`p-2 border rounded bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? 'cursor-not-allowed' : ''}`}
                            >
                                <option value="latest">All Time</option>
                                <option value="last_hour">Last Hour</option>
                                <option value="last_6h">Last 6 Hours</option>
                                <option value="last_24h">Last 24 Hours</option>
                                <option value="last_7d">Last 7 Days</option>
                            </select>
                        </div>
                        {/* Refresh Button */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={refetchData}
                                disabled={loading}
                                className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150`}
                                title="Retry Fetch"
                            >
                                <FaSyncAlt className={`mr-1.5 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                                {loading ? 'Retrying...' : 'Retry Fetch'}
                            </button>
                        </div>
                        {/* Connection Status */}
                        <div className={`text-sm px-4 py-1.5 rounded-full font-medium flex items-center gap-2 shrink-0 ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {/* ... connection indicator ... */}
                            Realtime: {isConnected ? 'Connected' : 'Disconnected'}
                        </div>
                    </div>
                </header>
                {/* --- Error Message --- */}
                <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] text-red-600 font-semibold">
                    <FaExclamationTriangle size={32} className="mb-4 text-red-500" />
                    Error loading analysis data:
                    <p className="text-sm mt-2 text-center max-w-md">{error}</p>
                    <span className="text-xs text-gray-500 mt-4">(Check console for more details or try refreshing)</span>
                </div>
            </div>
        );
    }

    // --- Trường hợp không có data (Không phải lỗi, ví dụ 404) ---
    if (!data) {
        return (
            <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen font-sans">
                {/* --- Header (với controls hoạt động) --- */}
                <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500 gap-y-3 md:gap-y-0">
                    {/* Left Side */}
                    <div className="flex-grow">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Crawl Process Analysis</h1>
                        <div className="text-sm text-gray-500 mt-1">
                            <span>Last Analysis: No data</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 truncate">Log File: Unknown</p>
                    </div>
                    {/* Right Side: Controls & Status */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-3 md:mt-0 shrink-0">
                        {/* Filter Control */}
                        <div className="flex items-center gap-2">
                            <FaFilter className="text-gray-600" title="Filter Time Range" />
                            <select
                                value={timeFilterOption}
                                onChange={handleFilterChange}
                                disabled={loading}
                                className={`p-2 border rounded bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? 'cursor-not-allowed' : ''}`}
                            >
                                <option value="latest">All Time</option>
                                <option value="last_hour">Last Hour</option>
                                <option value="last_6h">Last 6 Hours</option>
                                <option value="last_24h">Last 24 Hours</option>
                                <option value="last_7d">Last 7 Days</option>
                            </select>
                        </div>
                        {/* Refresh Button */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={refetchData}
                                disabled={loading}
                                className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150`}
                                title="Refresh Data"
                            >
                                <FaSyncAlt className={`mr-1.5 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                                {loading ? 'Refreshing...' : 'Refresh'}
                            </button>
                            {/* Hiển thị lỗi fetch cuối cùng (nếu có) */}
                            {error && <span className="text-red-500 text-xs" title={error}>(Fetch Error)</span>}
                        </div>
                        {/* Connection Status */}
                        <div className={`text-sm px-4 py-1.5 rounded-full font-medium flex items-center gap-2 shrink-0 ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            <span className="relative flex h-2.5 w-2.5">
                                <span className={`absolute inline-flex h-full w-full rounded-full ${isConnected ? 'bg-green-400 opacity-75 animate-ping' : 'bg-red-400'}`}></span>
                                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            </span>
                            Realtime: {isConnected ? 'Connected' : 'Disconnected'}
                        </div>
                    </div>
                </header>
                {/* --- No Data Message --- */}
                <div className="flex justify-center items-center h-[calc(100vh-200px)] text-gray-500">
                    No analysis data available for the selected period or the log file.
                </div>
            </div>
        );
    }

    // --- Render chính khi có DATA ---
    return (
        <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen font-sans">
            {/* --- Header (với controls hoạt động và data) --- */}
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500 gap-y-3 md:gap-y-0">
                {/* Left Side: Title & Meta Info */}
                <div className="flex-grow">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Crawl Process Analysis</h1>
                    <div className="text-sm text-gray-500 mt-1 flex items-center flex-wrap gap-x-4 gap-y-1">
                        <span>
                            Last Analysis: {data.analysisTimestamp ? new Date(data.analysisTimestamp).toLocaleString() : 'N/A'}
                        </span>
                        {/* Chỉ hiển thị thông báo lỗi fetch nếu có lỗi *và* đang không loading */}
                        {error && !loading && <span className="text-red-500 text-xs" title={error}>(Last fetch failed)</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 truncate" title={data.logFilePath}>Log File: {data.logFilePath || 'N/A'}</p>
                </div>

                {/* Right Side: Controls & Status */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-3 md:mt-0 shrink-0">
                    {/* Filter Control */}
                    <div className="flex items-center gap-2">
                        <FaFilter className="text-gray-600" title="Filter Time Range" />
                        <select
                            value={timeFilterOption}
                            onChange={handleFilterChange}
                            disabled={loading} // Disable khi đang fetch (refresh)
                            className={`p-2 border rounded bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? 'cursor-not-allowed bg-gray-100' : ''}`}
                        >
                            <option value="latest">All Time</option>
                            <option value="last_hour">Last Hour</option>
                            <option value="last_6h">Last 6 Hours</option>
                            <option value="last_24h">Last 24 Hours</option>
                            <option value="last_7d">Last 7 Days</option>
                        </select>
                    </div>

                    {/* Refresh Button */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={refetchData}
                            disabled={loading}
                            className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150`}
                            title="Refresh data now"
                        >
                            <FaSyncAlt className={`mr-1.5 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? 'Refreshing...' : 'Refresh Now'}
                        </button>
                        {/* Có thể thêm chỉ báo đang đợi update nếu cần, nhưng không dùng countdown nữa */}
                        {/* {isConnected && !loading && <span className="text-gray-500 text-xs">(Live)</span>} */}
                    </div>

                    {/* Connection Status */}
                    <div className={`text-sm px-4 py-1.5 rounded-full font-medium flex items-center gap-2 shrink-0 ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <span className="relative flex h-2.5 w-2.5">
                            <span className={`absolute inline-flex h-full w-full rounded-full ${isConnected ? 'bg-green-400 opacity-75 animate-ping' : 'bg-red-400'}`}></span>
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        </span>
                        Realtime: {isConnected ? 'Connected' : 'Disconnected'}
                    </div>
                </div>
            </header>


            {/* ================================================================== */}
            {/* ================ SECTION 1: OVERALL CRAWL SUMMARY ================ */}
            {/* ================================================================== */}
            <section className="mb-8">
                {/* --- Tiêu đề và các phần tử còn lại giữ nguyên --- */}
                <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-300">
                    Overall Crawl Summary {timeFilterOption !== 'latest' && `(${timeFilterOption.replace('_', ' ').replace('last ', 'Last ')})`}
                </h2>
                {/* --- KPI Cards --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Card 1: Duration */}
                    <div className="bg-white shadow-lg rounded-lg p-4 flex items-center space-x-3 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                        {/* Icon */}
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Total Duration</p>
                            <p className="text-xl font-semibold text-gray-800">
                                {formatDuration(data.overall?.durationSeconds)}
                            </p>
                        </div>
                    </div>
                    {/* Card 2: Conferences Processed */}
                    <div className="bg-white shadow-lg rounded-lg p-4 flex items-center space-x-3 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                        <div className="p-3 rounded-full bg-green-100 text-green-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Conferences Processed</p>
                            <p className="text-xl font-semibold text-gray-800">
                                {data.overall?.processedConferencesCount ?? 0} / {data.overall?.totalConferencesInput ?? '?'}
                            </p>
                        </div>
                    </div>
                    {/* Card 3: Gemini API Calls */}
                    <div className="bg-white shadow-lg rounded-lg p-4 flex items-center space-x-3 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                        <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14.05 1.73 16.557 1 17.657 1s3.607.73 4.671 2C24.5 5 25 8 25 10c2 1 2.657 1.343 2.657 2.657A8 8 0 0117.657 18.657z" /></svg> {/* Placeholder icon */}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Gemini API Calls (retries included)</p>
                            <p className="text-xl font-semibold text-gray-800">{(data.geminiApi?.totalCalls + data.geminiApi?.retriesByType['determine'] + data.geminiApi?.retriesByType['extract']) || 0}</p>
                        </div>
                    </div>
                    {/* Card 4: Total Errors */}
                    <div className="bg-white shadow-lg rounded-lg p-4 flex items-center space-x-3 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                        <div className={`p-3 rounded-full ${(data.errorLogCount || 0) > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                            <FaExclamationTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Total Errors Logged</p>
                            <p className={`text-xl font-semibold ${(data.errorLogCount || 0) > 0 ? 'text-red-600' : 'text-gray-800'}`}>{data.errorLogCount || 0}</p>
                        </div>
                    </div>
                </div>

                {/* --- Charts Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {/* Chart: Overall Task Status */}
                    <div className="bg-white shadow rounded-lg p-4 border border-gray-100">
                        {/* ==================================================== */}
                        {/* === CẬP NHẬT MÀU SẮC CHO BIỂU ĐỒ NÀY          ===== */}
                        {/* ==================================================== */}
                        <ReactECharts
                            option={getPieChartOption(
                                'Overall Task Status',
                                overallStatusData,
                                // Cung cấp 3 màu: Xanh lá (OK), Vàng (Completed khác), Đỏ (Failed)
                                ['#91cc75', '#fccb67', '#ee6666']
                            )}
                            style={{ height: '300px' }}
                        />
                    </div>
                    {/* Chart: Google Search */}
                    <div className="bg-white shadow rounded-lg p-4 border border-gray-100">
                        <ReactECharts option={getPieChartOption('Google Search Status', searchStatusData, ['#91cc75', '#ee6666', '#fccb67', '#73c0de'])} style={{ height: '300px' }} />
                    </div>
                    {/* Chart: Gemini API Status */}
                    <div className="bg-white shadow rounded-lg p-4 border border-gray-100">
                        <ReactECharts option={getPieChartOption('Gemini API Call Status', apiStatusData, ['#91cc75', '#ee6666', '#fac858', '#5470c6'])} style={{ height: '300px' }} />
                    </div>
                    {/* Chart: Gemini Cache */}
                    <div className="bg-white shadow rounded-lg p-4 border border-gray-100">
                        <ReactECharts option={getPieChartOption('Gemini API Cache Usage', cacheStatusData, ['#3ba272', '#fc8452'])} style={{ height: '300px' }} />
                    </div>
                    {/* Chart: Playwright Link Processing */}
                    <div className="bg-white shadow rounded-lg p-4 border border-gray-100">
                        <ReactECharts option={getPieChartOption('Playwright Link Processing', playwrightLinkData, ['#91cc75', '#ee6666', '#73c0de'])} style={{ height: '300px' }} />
                    </div>
                    {/* Chart: Gemini Model Usage */}
                    <div className="bg-white shadow rounded-lg p-4 border border-gray-100">
                        {callsByModelWithRetriesData.labels.length > 0 ? (
                            <ReactECharts option={getBarChartOption('Gemini Model Usage', callsByModelWithRetriesData.labels, callsByModelWithRetriesData.values, 'Calls', '#9a60b4')} style={{ height: '300px' }} />
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-500">No Gemini Model Usage Data</div>
                        )}
                    </div>

                    {/* Chart: Google API Key Usage */}
                    <div className="bg-white shadow rounded-lg p-4 border border-gray-100 lg:col-span-1">
                        {apiKeyUsageData.labels.length > 0 ? (
                            <ReactECharts option={getBarChartOption('Google API Key Usage', apiKeyUsageData.labels, apiKeyUsageData.values, 'Requests', '#ea7ccc')} style={{ height: '300px' }} />
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-500">No API Key Usage Data</div>
                        )}
                    </div>

                    {/* Chart: Gemini Calls by Type */}
                    <div className="bg-white shadow rounded-lg p-4 border border-gray-100 lg:col-span-1">
                        {callsByTypeWithRetriesData.labels.length > 0 ? (
                            <ReactECharts option={getBarChartOption('Gemini Calls by Type', callsByTypeWithRetriesData.labels, callsByTypeWithRetriesData.values, 'Calls', '#5470c6')} style={{ height: '300px' }} />
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-500">No Gemini Calls by Type Data</div>
                        )}
                    </div>

                    {/* Chart: Top Errors */}
                    {/* Keep the existing check here */}
                    {topErrorsData.labels.length > 0 ? (
                        <div className="bg-white shadow rounded-lg p-4 border border-gray-100 md:col-span-2 lg:col-span-1">
                            <ReactECharts option={getBarChartOption('Top Aggregated Errors', topErrorsData.labels, topErrorsData.values, 'Count', '#ee6666')} style={{ height: '300px' }} />
                        </div>
                    ) : (
                        // Optional: Add a placeholder if there are no errors to show
                        <div className="bg-white shadow rounded-lg p-4 border border-gray-100 md:col-span-2 lg:col-span-1 flex items-center justify-center h-[300px] text-gray-500">
                            No Aggregated Errors Found
                        </div>
                    )}
                </div>

                {/* --- Log Processing Errors (Nếu có) --- */}
                {data.logProcessingErrors && data.logProcessingErrors.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-300 shadow-sm rounded-lg p-4 mt-6">
                        <h3 className="text-md font-semibold mb-2 text-yellow-800 flex items-center">
                            <FaExclamationTriangle className="mr-2" />
                            Log Parsing Issues ({data.parseErrors} errors / {data.totalLogEntries} entries)
                        </h3>
                        <ul className="list-disc list-inside text-sm text-yellow-700 max-h-40 overflow-y-auto pl-4 space-y-1">
                            {data.logProcessingErrors.slice(0, 20).map((err, index) => ( // Giới hạn hiển thị
                                <li key={index} className="break-words">{err}</li>
                            ))}
                            {data.logProcessingErrors.length > 20 && <li>... (and {data.logProcessingErrors.length - 20} more)</li>}
                        </ul>
                    </div>
                )}
            </section>

            {/* ======================================================================= */}
            {/* ================ SECTION 2: CONFERENCE DETAILS ANALYSIS ================ */}
            {/* ======================================================================= */}
            <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-300">Detailed Conference Analysis</h2>
                {Object.keys(data.conferenceAnalysis || {}).length === 0 ? (

                    <div className="text-center text-gray-500 py-8">No conference details available for this run.</div>
                ) : (
                    <div className="bg-white shadow-lg rounded-lg overflow-x-auto border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {/* ... (Các header khác giữ nguyên) ... */}
                                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Expand</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Acronym</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Status</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Duration</th>
                                    {/* Thêm các cột cho các bước quan trọng */}
                                    <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12" title="Google Search">Search</th>
                                    <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12" title="HTML Save">HTML</th>
                                    <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12" title="Link Processing">Links</th>
                                    <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12" title="Gemini Determine">Det.</th>
                                    <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12" title="Gemini Extract">Ext.</th>
                                    {/* === THAY ĐỔI HEADER CHO ERRORS (Thêm icon và canh giữa) === */}
                                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                                        <FaExclamationTriangle className="inline mr-1 mb-0.5 text-red-400" /> Errors
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {Object.entries(data.conferenceAnalysis || {}).map(([acronym, confData]) => {


                                    const hasErrors = (confData.errors?.length || 0) > 0;

                                    // --- CẬP NHẬT LOGIC XÁC ĐỊNH MÀU NỀN HÀNG ---
                                    let rowBgClass = 'hover:bg-gray-50'; // Mặc định
                                    let statusPulseClass = ''; // Class cho hiệu ứng pulse

                                    if (hasErrors) {
                                        // Chỉ áp dụng nền vàng nếu status không phải failed/processing nhưng có lỗi
                                        rowBgClass = 'bg-yellow-100 hover:bg-yellow-200';
                                    }
                                    else if (confData.status === 'failed') {
                                        rowBgClass = 'bg-red-50 hover:bg-red-100'; // Nền đỏ nhạt cho failed
                                    } else if (confData.status === 'processing') {
                                        rowBgClass = 'bg-blue-50 hover:bg-blue-100'; // Nền xanh dương nhạt cho processing
                                        statusPulseClass = 'animate-pulse'; // Thêm pulse cho processing
                                    } else if (confData.status === 'completed') {
                                        rowBgClass = 'hover:bg-green-100'; // Có thể thêm nền xanh lá rất nhạt nếu muốn
                                    }
                                    // Các trường hợp status khác (unknown) sẽ dùng màu mặc định

                                    // --- CẬP NHẬT LOGIC MÀU THẺ TRẠNG THÁI ---
                                    let statusBadgeClass = 'bg-gray-100 text-gray-800'; // Mặc định cho unknown hoặc N/A
                                    switch (confData.status) {
                                        case 'completed':
                                            statusBadgeClass = 'bg-green-100 text-green-800';
                                            break;
                                        case 'failed':
                                            statusBadgeClass = 'bg-red-100 text-red-800';
                                            break;
                                        case 'processing':
                                            // Thêm cả pulse vào class của badge nếu muốn
                                            statusBadgeClass = `bg-blue-100 text-blue-800 ${statusPulseClass}`;
                                            break;
                                        case 'unknown':
                                            statusBadgeClass = 'bg-yellow-100 text-yellow-800'; // Hoặc màu xám như trên
                                            break;
                                        // Không cần default vì đã có giá trị ban đầu
                                    }


                                    return (
                                        <React.Fragment key={acronym}>
                                            {/* Sử dụng rowBgClass đã được xác định */}
                                            <tr className={`${rowBgClass} transition-colors duration-150`}>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                                                    <button
                                                        onClick={() => toggleExpand(acronym)}
                                                        className="text-blue-600 hover:text-blue-800 focus:outline-none"
                                                        title={expandedConference === acronym ? 'Collapse Details' : 'Expand Details'}
                                                    >
                                                        {expandedConference === acronym ? <FaChevronUp /> : <FaChevronDown />}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{acronym}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                    {/* Sử dụng statusBadgeClass đã được xác định */}
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeClass}`}>
                                                        {confData.status || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatDuration(confData.durationSeconds)}</td>
                                                <td className="px-2 py-2 whitespace-nowrap text-center text-lg"><StatusIcon success={confData.steps?.search_success} attempted={confData.steps?.search_attempted} /></td>
                                                <td className="px-2 py-2 whitespace-nowrap text-center text-lg"><StatusIcon success={confData.steps?.html_save_success} attempted={confData.steps?.html_save_attempted} /></td>
                                                <td className="px-2 py-2 whitespace-nowrap text-center text-lg"><StatusIcon success={confData.steps?.link_processing_success === confData.steps?.link_processing_attempted} attempted={(confData.steps?.link_processing_attempted ?? 0) > 0} /></td>
                                                <td className="px-2 py-2 whitespace-nowrap text-center text-lg"><StatusIcon success={confData.steps?.gemini_determine_success} attempted={confData.steps?.gemini_determine_attempted} /></td>
                                                <td className="px-2 py-2 whitespace-nowrap text-center text-lg"><StatusIcon success={confData.steps?.gemini_extract_success} attempted={confData.steps?.gemini_extract_attempted} /></td>
                                                <td className={`px-4 py-2 whitespace-nowrap text-sm text-center font-medium ${hasErrors
                                                    ? 'bg-red-200 text-red-800 animate-pulse' // Giữ nguyên style lỗi
                                                    : 'text-green-600'
                                                    }`}>
                                                    {hasErrors && <FaExclamationTriangle className="inline mr-1 mb-0.5" title={`Errors: ${confData.errors.length}`} />}
                                                    {confData.errors?.length || 0}
                                                </td>
                                            </tr>
                                            {/* --- Expanded Row Content (Giữ nguyên) --- */}
                                            {expandedConference === acronym && (
                                                <tr className="bg-gray-50">
                                                    <td colSpan={10} className="px-4 py-4 text-sm text-gray-700">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* Cột 1: Final Result Preview */}
                                                            <div>
                                                                <h4 className="font-semibold mb-2 text-gray-800">Extracted Data Preview:</h4>
                                                                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-80 border border-gray-200">
                                                                    {JSON.stringify(confData.finalResultPreview, null, 2)}
                                                                </pre>
                                                            </div>
                                                            {/* Cột 2: Errors & Steps Details */}
                                                            <div>
                                                                {confData.errors && confData.errors.length > 0 && (
                                                                    <div className="mb-4">
                                                                        <h4 className="font-semibold mb-1 text-red-700">Errors ({confData.errors.length}):</h4>
                                                                        <ul className="list-disc list-inside text-xs text-red-600 max-h-40 overflow-y-auto bg-red-200 p-2 rounded border border-red-200 space-y-1">
                                                                            {confData.errors.map((err, index) => (
                                                                                <li key={index}>{typeof err === 'object' ? JSON.stringify(err) : err}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <h4 className="font-semibold mb-1 text-gray-800">Step Details:</h4>
                                                                    {confData.steps.link_processing_failed && confData.steps.link_processing_failed.length > 0 && (

                                                                        <div className="mb-4">
                                                                            <h4 className="font-semibold mb-1 text-red-700">Access link failed: ({confData.steps.link_processing_failed.length}):</h4>
                                                                            <ul className="list-disc list-inside text-xs text-red-600 max-h-40 overflow-y-auto bg-red-200 p-2 rounded border border-red-200 space-y-1">
                                                                                {confData.steps.link_processing_failed.map((err, index) => (
                                                                                    <li key={index}>{typeof err === 'object' ? JSON.stringify(err) : err}</li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    )}
                                                                    <ul className="list-disc list-inside text-xs space-y-1">


                                                                        <li>Search: <strong>{confData.steps?.search_attempts_count ?? 0}</strong> attempts, <strong>{confData.steps?.search_results_count ?? 0}</strong> results, <strong>{confData.steps?.search_filtered_count ?? 0}</strong> filtered</li>
                                                                        <li>HTML Save: <strong>{confData.steps?.html_save_attempted ? 'Attempted' : 'Skipped'}</strong>, Success: <strong>{confData.steps?.html_save_success ? 'Yes' : 'No'}</strong></li>
                                                                        <li>Links: <strong>{confData.steps?.link_processing_attempted ?? 0}</strong> attempted, <strong>{confData.steps?.link_processing_success ?? 0}</strong> successful</li>

                                                                        <li>Links: <strong>{confData.steps?.link_processing_attempted ?? 0}</strong> attempted, <strong>{confData.steps?.link_processing_success ?? 0}</strong> successful</li>
                                                                        <li>Gemini Determine: <strong>{confData.steps?.gemini_determine_attempted ? 'Attempted' : 'Skipped'}</strong>, Success: <strong>{confData.steps?.gemini_determine_success ? 'Yes' : 'No'}</strong>, Cache: <strong>{confData.steps?.gemini_determine_cache_used ? 'Used' : 'No'}</strong></li>
                                                                        <li>Gemini Extract: <strong>{confData.steps?.gemini_extract_attempted ? 'Attempted' : 'Skipped'}</strong>, Success: <strong>{confData.steps?.gemini_extract_success ? 'Yes' : 'No'}</strong>, Cache: <strong>{confData.steps?.gemini_extract_cache_used ? 'Used' : 'No'}</strong></li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Analysis;