import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useLogAnalysisData } from '../../../../hooks/logAnalysis/useLogAnalysisData'; // Giả định hook này tồn tại
import { FaCheckCircle, FaTimesCircle, FaMinusCircle, FaExclamationTriangle, FaChevronDown, FaChevronUp } from 'react-icons/fa'; // Thêm icons

// --- Helper Functions cho Biểu đồ (Giữ nguyên hoặc cải tiến nhẹ) ---

// Helper function to create Pie chart options (Doughnut)
const getPieChartOption = (title: string, data: Array<{ name: string; value: number }>, colors?: string[]) => {
    return {
        title: {
            text: title,
            left: 'center',
            top: 10,
            textStyle: {
                fontSize: 16,
                fontWeight: 'normal',
                color: '#333' // Màu chữ tiêu đề
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: '{b} : {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 10, // Tăng khoảng cách từ lề trái
            top: 'middle',
            itemGap: 8, // Khoảng cách giữa các mục legend
            data: data.map(item => item.name),
            textStyle: {
                fontSize: 12 // Kích thước chữ legend nhỏ hơn
            }
        },
        series: [
            {
                name: title,
                type: 'pie',
                radius: ['50%', '75%'], // Điều chỉnh độ dày doughnut
                center: ['65%', '55%'], // Điều chỉnh vị trí để không bị che bởi legend
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 8, // Bo tròn mạnh hơn
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false, // Vẫn ẩn label trên slice
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '18',
                        fontWeight: 'bold',
                        formatter: '{b}\n{c} ({d}%)' // Hiển thị cả tên và giá trị khi hover
                    },
                    itemStyle: { // Hiệu ứng khi hover
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                labelLine: {
                    show: false
                },
                data: data,
                color: colors || ['#5470c6', '#ee6666', '#fccb67', '#91cc75', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'] // Bảng màu mặc định
            }
        ]
    };
};

// Helper function to create Bar chart options
const getBarChartOption = (title: string, xAxisData: string[], seriesData: number[], seriesName: string, color?: string) => {
    return {
        title: {
            text: title,
            left: 'center',
            top: 10,
            textStyle: {
                fontSize: 16,
                fontWeight: 'normal',
                color: '#333'
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: xAxisData,
                axisTick: {
                    alignWithLabel: true
                },
                axisLabel: {
                    interval: 0,
                    rotate: 30, // Xoay label nếu cần
                    fontSize: 11, // Giảm kích thước font trục X
                    color: '#555'
                },
                axisLine: {
                    lineStyle: {
                        color: '#ccc' // Màu trục X
                    }
                }
            }
        ],
        yAxis: [
            {
                type: 'value',
                axisLabel: {
                    fontSize: 11,
                    color: '#555'
                },
                splitLine: { // Đường lưới ngang mờ hơn
                    lineStyle: {
                        type: 'dashed',
                        color: '#eee'
                    }
                }
            }
        ],
        series: [
            {
                name: seriesName,
                type: 'bar',
                barWidth: '60%',
                data: seriesData,
                itemStyle: {
                    color: color || '#5470c6', // Màu cột
                    borderRadius: [4, 4, 0, 0] // Bo tròn góc trên của cột
                },
                emphasis: { // Hiệu ứng hover cột
                    itemStyle: {
                        color: '#3b5aa0' // Màu đậm hơn khi hover
                    }
                }
            }
        ]
    };
};

// Helper to transform object record to arrays for Bar chart
const transformRecordForBarChart = (
    record: Record<string, number> | undefined,
    limit: number = 10,
    sortByValue: boolean = true
): { labels: string[]; values: number[] } => {
    if (!record || Object.keys(record).length === 0) return { labels: [], values: [] };

    let entries = Object.entries(record);

    if (sortByValue) {
        entries.sort(([, a], [, b]) => b - a); // Sort descending by value
    } else {
        entries.sort(([a], [b]) => a.localeCompare(b)); // Sort ascending by key/label
    }

    if (limit > 0 && entries.length > limit) {
        entries = entries.slice(0, limit);
    }

    return {
        labels: entries.map(([key]) => key),
        values: entries.map(([, value]) => value)
    };
};

// --- Component Chính ---
const Analysis: React.FC = () => {
    const { data, loading, error, isConnected } = useLogAnalysisData();
    const [expandedConference, setExpandedConference] = useState<string | null>(null); // State để quản lý conference được mở rộng

    if (loading && !data) {
        return <div className="flex justify-center items-center h-screen text-gray-600">Loading Analysis Data...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-600 font-semibold">Error loading data: {error}</div>;
    }

    if (!data) {
        return <div className="flex justify-center items-center h-screen text-gray-500">No analysis data available.</div>;
    }

    // --- Chuẩn bị dữ liệu cho Biểu đồ Tổng quan ---
    const overallStatusData = [
        { name: 'Successful', value: data.overall?.successfulTasks || 0 },
        { name: 'Failed', value: data.overall?.failedTasks || 0 },
    ];

    const searchStatusData = [
        { name: 'Successful', value: data.googleSearch?.successfulSearches || 0 },
        { name: 'Failed', value: data.googleSearch?.failedSearches || 0 },
        { name: 'Skipped', value: data.googleSearch?.skippedSearches || 0 },
        { name: 'Quota Errors', value: data.googleSearch?.quotaErrors || 0 },
    ];

    const apiStatusData = [
        { name: 'Successful', value: data.geminiApi?.successfulCalls || 0 },
        { name: 'Failed', value: data.geminiApi?.failedCalls || 0 },
        { name: 'Blocked', value: data.geminiApi?.blockedBySafety || 0 },
        { name: 'Retries', value: data.geminiApi?.retries || 0 }, // Thêm Retries nếu muốn
    ];

    const cacheStatusData = [
        { name: 'Cache Hits', value: data.geminiApi?.cacheHits || 0 },
        { name: 'Cache Misses', value: data.geminiApi?.cacheMisses || 0 },
        // { name: 'Cache Created', value: data.geminiApi?.cacheCreationSuccess || 0 }, // Thêm nếu cần
    ];

    const playwrightLinkData = [
        { name: 'Successful Access', value: data.playwright?.linkProcessing?.successfulAccess || 0 },
        { name: 'Failed Access', value: data.playwright?.linkProcessing?.failedAccess || 0 },
        { name: 'Redirects', value: data.playwright?.linkProcessing?.redirects || 0 },
    ];

    // Dữ liệu cho Bar chart
    const topErrorsData = transformRecordForBarChart(data.errorsAggregated, 10, true);
    const modelUsageData = transformRecordForBarChart(data.geminiApi?.modelUsage, 0, false);
    const apiKeyUsageData = transformRecordForBarChart(data.googleSearch?.keyUsage, 0, false);
    const geminiCallsByTypeData = transformRecordForBarChart(data.geminiApi?.callsByType, 0, false);

    // Helper function to format duration
    const formatDuration = (seconds: number | null | undefined): string => {
        if (seconds === null || seconds === undefined) return 'N/A';
        if (seconds < 60) return `${seconds.toFixed(1)}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = (seconds % 60).toFixed(0);
        return `${minutes}m ${remainingSeconds}s`;
    };

    // Helper function to render status icons
    const StatusIcon: React.FC<{ success: boolean | null | undefined, attempted?: boolean | null | undefined }> = ({ success, attempted }) => {
        if (attempted === false) return <FaMinusCircle className="text-gray-400" title="Not Attempted" />;
        if (success === true) return <FaCheckCircle className="text-green-500" title="Success" />;
        if (success === false) return <FaTimesCircle className="text-red-500" title="Failed" />;
        return <FaMinusCircle className="text-yellow-500" title="Unknown/Not Run" />; // Trạng thái không xác định
    };

    const toggleExpand = (acronym: string) => {
        setExpandedConference(expandedConference === acronym ? null : acronym);
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen font-sans">
            {/* --- Header --- */}
            <header className="flex flex-col sm:flex-row items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Crawl Process Analysis</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Last Analysis: {data.analysisTimestamp ? new Date(data.analysisTimestamp).toLocaleString() : 'N/A'}
                        {loading && <span className="ml-2 text-blue-600 animate-pulse">(Updating...)</span>}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 truncate" title={data.logFilePath}>Log File: {data.logFilePath || 'N/A'}</p>
                </div>
                <div className={`mt-2 sm:mt-0 text-sm px-4 py-1.5 rounded-full font-medium flex items-center gap-2 ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    Realtime: {isConnected ? 'Connected' : 'Disconnected'}
                </div>
            </header>

            {/* ================================================================== */}
            {/* ================ SECTION 1: OVERALL CRAWL SUMMARY ================ */}
            {/* ================================================================== */}
            <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-300">Overall Crawl Summary</h2>

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
                            <p className="text-sm text-gray-500 mb-1">Gemini API Calls</p>
                            <p className="text-xl font-semibold text-gray-800">{data.geminiApi?.totalCalls || 0}</p>
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
                        <ReactECharts option={getPieChartOption('Overall Task Status', overallStatusData, ['#91cc75', '#ee6666'])} style={{ height: '300px' }} />
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
                        <ReactECharts option={getBarChartOption('Gemini Model Usage', modelUsageData.labels, modelUsageData.values, 'Calls', '#9a60b4')} style={{ height: '300px' }} />
                    </div>
                    {/* Chart: Google API Key Usage */}
                    <div className="bg-white shadow rounded-lg p-4 border border-gray-100 lg:col-span-1"> {/* Điều chỉnh span nếu cần */}
                        <ReactECharts option={getBarChartOption('Google API Key Usage', apiKeyUsageData.labels, apiKeyUsageData.values, 'Requests', '#ea7ccc')} style={{ height: '300px' }} />
                    </div>
                    {/* Chart: Gemini Calls by Type */}
                    <div className="bg-white shadow rounded-lg p-4 border border-gray-100 lg:col-span-1">
                        <ReactECharts option={getBarChartOption('Gemini Calls by Type', geminiCallsByTypeData.labels, geminiCallsByTypeData.values, 'Calls', '#5470c6')} style={{ height: '300px' }} />
                    </div>

                    {/* Chart: Top Errors */}
                    {topErrorsData.labels.length > 0 && (
                        <div className="bg-white shadow rounded-lg p-4 border border-gray-100 md:col-span-2 lg:col-span-1">
                            <ReactECharts option={getBarChartOption('Top Aggregated Errors', topErrorsData.labels, topErrorsData.values, 'Count', '#ee6666')} style={{ height: '300px' }} />
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
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Expand</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Acronym</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Status</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Duration</th>
                                    {/* Thêm các cột cho các bước quan trọng */}
                                    <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Google Search">Search</th>
                                    <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="HTML Save">HTML</th>
                                    <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Link Processing">Links</th>
                                    <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Gemini Determine">Det.</th>
                                    <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Gemini Extract">Ext.</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Errors</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {Object.entries(data.conferenceAnalysis || {}).map(([acronym, confData]) => (
                                    <React.Fragment key={acronym}>
                                        <tr className={`${confData.status === 'failed' ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'} transition-colors duration-150`}>
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
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${confData.status === 'success' ? 'bg-green-100 text-green-800' :
                                                        confData.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {confData.status || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatDuration(confData.durationSeconds)}</td>
                                            {/* Cột Status Icon cho các bước */}
                                            <td className="px-2 py-2 whitespace-nowrap text-center text-lg"><StatusIcon success={confData.steps?.search_success} attempted={confData.steps?.search_attempted} /></td>
                                            <td className="px-2 py-2 whitespace-nowrap text-center text-lg"><StatusIcon success={confData.steps?.html_save_success} attempted={confData.steps?.html_save_attempted} /></td>
                                            <td className="px-2 py-2 whitespace-nowrap text-center text-lg"><StatusIcon success={confData.steps?.link_processing_success === confData.steps?.link_processing_attempted} attempted={confData.steps?.link_processing_attempted > 0} /></td>
                                            <td className="px-2 py-2 whitespace-nowrap text-center text-lg"><StatusIcon success={confData.steps?.gemini_determine_success} attempted={confData.steps?.gemini_determine_attempted} /></td>
                                            <td className="px-2 py-2 whitespace-nowrap text-center text-lg"><StatusIcon success={confData.steps?.gemini_extract_success} attempted={confData.steps?.gemini_extract_attempted} /></td>

                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                {(confData.errors?.length || 0) > 0 ? (
                                                    <span className="text-red-600 font-semibold">{confData.errors.length}</span>
                                                ) : (
                                                    <span className="text-green-600">0</span>
                                                )}
                                            </td>
                                        </tr>
                                        {/* --- Expanded Row Content --- */}
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
                                                                    <ul className="list-disc list-inside text-xs text-red-600 max-h-40 overflow-y-auto bg-red-50 p-2 rounded border border-red-200 space-y-1">
                                                                        {confData.errors.map((err, index) => (
                                                                            <li key={index}>{typeof err === 'object' ? JSON.stringify(err) : err}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <h4 className="font-semibold mb-1 text-gray-800">Step Details:</h4>
                                                                <ul className="text-xs space-y-1">
                                                                    <li>Search: {confData.steps?.search_attempts_count ?? 0} attempts, {confData.steps?.search_results_count ?? 0} results, {confData.steps?.search_filtered_count ?? 0} filtered</li>
                                                                    <li>HTML Save: {confData.steps?.html_save_attempted ? 'Attempted' : 'Skipped'}, Success: {confData.steps?.html_save_success ? 'Yes' : 'No'}</li>
                                                                    <li>Links: {confData.steps?.link_processing_attempted ?? 0} attempted, {confData.steps?.link_processing_success ?? 0} successful</li>
                                                                    <li>Gemini Determine: {confData.steps?.gemini_determine_attempted ? 'Attempted' : 'Skipped'}, Success: {confData.steps?.gemini_determine_success ? 'Yes' : 'No'}, Cache: {confData.steps?.gemini_determine_cache_used ? 'Used' : 'No'}</li>
                                                                    <li>Gemini Extract: {confData.steps?.gemini_extract_attempted ? 'Attempted' : 'Skipped'}, Success: {confData.steps?.gemini_extract_success ? 'Yes' : 'No'}, Cache: {confData.steps?.gemini_extract_cache_used ? 'Used' : 'No'}</li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Analysis;