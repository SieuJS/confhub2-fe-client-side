import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { FaExclamationTriangle, FaChevronUp, FaChevronDown } from 'react-icons/fa'; // Import thêm icon Chevron
import { getBarChartOption, getPieChartOption, transformRecordForBarChart, BarChartData } from './utils/chartUtils'; // Import từ chartUtils
import { LogAnalysisResult } from '../../../../models/logAnalysis/logAnalysis'
import { formatDuration } from './utils/commonUtils';

interface OverallSummaryProps {
    data: LogAnalysisResult; // Data không được null ở đây vì đã check ở component cha
    timeFilterOption: string;
    isExpanded: boolean; // Prop mới: trạng thái mở rộng
    onToggle: () => void; // Prop mới: hàm xử lý toggle
}

const OverallSummary: React.FC<OverallSummaryProps> = ({ data, timeFilterOption, isExpanded, onToggle }) => {

    // --- Các useMemo tính toán dữ liệu biểu đồ giữ nguyên ---
    const overallStatusData = useMemo(() => {
        // ... giữ nguyên logic ...
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
        // ... giữ nguyên logic ...
        if (!data?.googleSearch) return [];
        return [
            { name: 'Successful', value: data.googleSearch.successfulSearches || 0 },
            { name: 'Failed', value: data.googleSearch.failedSearches || 0 },
            { name: 'Skipped', value: data.googleSearch.skippedSearches || 0 },
            { name: 'Quota Errors', value: data.googleSearch.quotaErrors || 0 },
        ].filter(item => item.value > 0);
    }, [data?.googleSearch]);

    const apiStatusData = useMemo(() => {
         // ... giữ nguyên logic ...
        if (!data?.geminiApi) return [];
        const determineRetries = data.geminiApi.retriesByType?.['determine'] || 0;
        const extractRetries = data.geminiApi.retriesByType?.['extract'] || 0;
        const retries = determineRetries + extractRetries;
        return [
            { name: 'Successful', value: data.geminiApi.successfulCalls || 0 },
            { name: 'Failed', value: data.geminiApi.failedCalls || 0 },
            { name: 'Blocked', value: data.geminiApi.blockedBySafety || 0 },
            ...(retries > 0 ? [{ name: 'Retries', value: retries }] : []),
        ].filter(item => item.value > 0);
    }, [data?.geminiApi]);

     const totalGeminiCallsWithRetries = useMemo(() => {
         // ... giữ nguyên logic ...
        const apiData = data?.geminiApi;
        if (!apiData) return 0;
        const determineRetries = apiData.retriesByType?.['determine'] || 0;
        const extractRetries = apiData.retriesByType?.['extract'] || 0;
        return (apiData.totalCalls || 0) + determineRetries + extractRetries;
    }, [data?.geminiApi]);


    const cacheStatusData = useMemo(() => {
        // ... giữ nguyên logic ...
        if (!data?.geminiApi) return [];
        return [
            { name: 'Cache Hits', value: data.geminiApi.cacheHits || 0 },
            { name: 'Cache Misses', value: data.geminiApi.cacheMisses || 0 },
        ].filter(item => item.value > 0);
    }, [data?.geminiApi]);

    const playwrightLinkData = useMemo(() => {
         // ... giữ nguyên logic ...
        if (!data?.playwright?.linkProcessing) return [];
        return [
            { name: 'Successful Access', value: data.playwright.linkProcessing.successfulAccess || 0 },
            { name: 'Failed Access', value: data.playwright.linkProcessing.failedAccess || 0 },
            { name: 'Redirects', value: data.playwright.linkProcessing.redirects || 0 },
        ].filter(item => item.value > 0);
    }, [data?.playwright?.linkProcessing]);

    const callsByModelWithRetriesData = useMemo<BarChartData>(() => {
         // ... giữ nguyên logic ...
        const { callsByModel = {}, retriesByModel = {} } = data?.geminiApi ?? {};
        const combined: Record<string, number> = {};
        const allKeys = new Set([...Object.keys(callsByModel), ...Object.keys(retriesByModel)]);
        allKeys.forEach(model => {
            combined[model] = (callsByModel[model] || 0) + (retriesByModel[model] || 0);
        });
        return transformRecordForBarChart(combined, 0, false);
    }, [data?.geminiApi]);

    const apiKeyUsageData = useMemo<BarChartData>(() => {
         // ... giữ nguyên logic ...
        return transformRecordForBarChart(data?.googleSearch?.keyUsage, 0, false);
    }, [data?.googleSearch?.keyUsage]);

    const callsByTypeWithRetriesData = useMemo<BarChartData>(() => {
         // ... giữ nguyên logic ...
        const { callsByType = {}, retriesByType = {} } = data?.geminiApi ?? {};
        const combined: Record<string, number> = {};
        const allKeys = new Set([...Object.keys(callsByType), ...Object.keys(retriesByType)]);
        allKeys.forEach(type => {
            combined[type] = (callsByType[type] || 0) + (retriesByType[type] || 0);
        });
        return transformRecordForBarChart(combined, 0, false);
    }, [data?.geminiApi]);

    const topErrorsData = useMemo<BarChartData>(() => {
         // ... giữ nguyên logic ...
        return transformRecordForBarChart(data?.errorsAggregated, 10, true);
    }, [data?.errorsAggregated]);

    // --- Render ---
    return (
        <section className="mb-8 bg-white shadow rounded-lg border border-gray-100"> {/* Bọc toàn bộ section để shadow/border bao gồm cả header */}
            {/* --- Header Section with Toggle --- */}
            <div className="flex justify-between items-center p-4 border-b border-gray-300">
                <h2 className="text-xl font-semibold text-gray-700">
                    Overall Crawl Summary {timeFilterOption !== 'latest' && `(${timeFilterOption.replace('_', ' ').replace('last ', 'Last ')})`}
                </h2>
                <button
                    onClick={onToggle}
                    className="p-1 rounded text-gray-500 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    aria-expanded={isExpanded}
                    aria-controls="overall-summary-content" // ID cho content để accessibility liên kết
                    title={isExpanded ? 'Collapse Summary' : 'Expand Summary'} // Tooltip
                >
                    {isExpanded ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
                    <span className="sr-only">{isExpanded ? 'Collapse' : 'Expand'}</span> {/* Accessibility */}
                </button>
            </div>

            {/* --- Collapsible Content Area --- */}
            <div
                id="overall-summary-content" // ID này khớp với aria-controls ở trên
                className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[5000px] opacity-100 p-4' : 'max-h-0 opacity-0 p-0'}`} // Dùng max-h và opacity cho transition. Thêm padding khi mở.
            >
                {/* --- KPI Cards --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Card 1: Duration */}
                    <div className="bg-gray-50 shadow-md rounded-lg p-4 flex items-center space-x-3 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
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
                     <div className="bg-gray-50 shadow-md rounded-lg p-4 flex items-center space-x-3 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
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
                     <div className="bg-gray-50 shadow-md rounded-lg p-4 flex items-center space-x-3 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                         <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14.05 1.73 16.557 1 17.657 1s3.607.73 4.671 2C24.5 5 25 8 25 10c2 1 2.657 1.343 2.657 2.657A8 8 0 0117.657 18.657z" /></svg> {/* Placeholder icon */}
                         </div>
                         <div>
                             <p className="text-sm text-gray-500 mb-1">Gemini API Calls (retries incl.)</p>
                             <p className="text-xl font-semibold text-gray-800">{totalGeminiCallsWithRetries}</p>
                         </div>
                     </div>
                    {/* Card 4: Total Errors */}
                     <div className="bg-gray-50 shadow-md rounded-lg p-4 flex items-center space-x-3 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
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
                     <div className="bg-white shadow rounded-lg p-4 border border-gray-100 min-h-[340px]"> {/* Đặt min-height để giữ layout ổn định */}
                          {overallStatusData.length > 0 ? (
                            <ReactECharts
                                option={getPieChartOption(
                                    'Overall Task Status',
                                    overallStatusData,
                                    ['#91cc75', '#fccb67', '#ee6666'] // Green, Yellow, Red
                                )}
                                style={{ height: '300px', width: '100%' }}
                                notMerge={true} // Đảm bảo cập nhật đúng khi data thay đổi
                                lazyUpdate={true}
                            />
                          ) : (
                             <div className="h-[300px] flex items-center justify-center text-gray-500">No Task Status Data</div>
                          )}
                     </div>
                     {/* Chart: Google Search */}
                     <div className="bg-white shadow rounded-lg p-4 border border-gray-100 min-h-[340px]">
                          {searchStatusData.length > 0 ? (
                             <ReactECharts option={getPieChartOption('Google Search Status', searchStatusData, ['#91cc75', '#ee6666', '#fccb67', '#73c0de'])} style={{ height: '300px', width: '100%' }} notMerge={true} lazyUpdate={true}/>
                           ) : (
                             <div className="h-[300px] flex items-center justify-center text-gray-500">No Search Status Data</div>
                           )}
                     </div>
                     {/* Chart: Gemini API Status */}
                     <div className="bg-white shadow rounded-lg p-4 border border-gray-100 min-h-[340px]">
                         {apiStatusData.length > 0 ? (
                            <ReactECharts option={getPieChartOption('Gemini API Call Status', apiStatusData, ['#91cc75', '#ee6666', '#fac858', '#5470c6'])} style={{ height: '300px', width: '100%' }} notMerge={true} lazyUpdate={true}/>
                         ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-500">No API Status Data</div>
                         )}
                     </div>
                     {/* Chart: Gemini Cache */}
                     <div className="bg-white shadow rounded-lg p-4 border border-gray-100 min-h-[340px]">
                          {cacheStatusData.length > 0 ? (
                            <ReactECharts option={getPieChartOption('Gemini API Cache Usage', cacheStatusData, ['#3ba272', '#fc8452'])} style={{ height: '300px', width: '100%' }} notMerge={true} lazyUpdate={true}/>
                          ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-500">No Cache Usage Data</div>
                          )}
                     </div>
                     {/* Chart: Playwright Link Processing */}
                     <div className="bg-white shadow rounded-lg p-4 border border-gray-100 min-h-[340px]">
                         {playwrightLinkData.length > 0 ? (
                            <ReactECharts option={getPieChartOption('Playwright Link Processing', playwrightLinkData, ['#91cc75', '#ee6666', '#73c0de'])} style={{ height: '300px', width: '100%' }} notMerge={true} lazyUpdate={true}/>
                         ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-500">No Link Processing Data</div>
                         )}
                     </div>
                     {/* Chart: Gemini Model Usage */}
                     <div className="bg-white shadow rounded-lg p-4 border border-gray-100 min-h-[340px]">
                         {callsByModelWithRetriesData.labels.length > 0 ? (
                             <ReactECharts option={getBarChartOption('Gemini Model Usage (incl. Retries)', callsByModelWithRetriesData.labels, callsByModelWithRetriesData.values, 'Calls', '#9a60b4')} style={{ height: '300px', width: '100%' }} notMerge={true} lazyUpdate={true}/>
                         ) : (
                             <div className="h-[300px] flex items-center justify-center text-gray-500">No Gemini Model Usage Data</div>
                         )}
                     </div>
                     {/* Chart: Google API Key Usage */}
                     <div className="bg-white shadow rounded-lg p-4 border border-gray-100 lg:col-span-1 min-h-[340px]">
                         {apiKeyUsageData.labels.length > 0 ? (
                             <ReactECharts option={getBarChartOption('Google API Key Usage', apiKeyUsageData.labels, apiKeyUsageData.values, 'Requests', '#ea7ccc')} style={{ height: '300px', width: '100%' }} notMerge={true} lazyUpdate={true}/>
                         ) : (
                             <div className="h-[300px] flex items-center justify-center text-gray-500">No API Key Usage Data</div>
                         )}
                     </div>
                     {/* Chart: Gemini Calls by Type */}
                     <div className="bg-white shadow rounded-lg p-4 border border-gray-100 lg:col-span-1 min-h-[340px]">
                         {callsByTypeWithRetriesData.labels.length > 0 ? (
                             <ReactECharts option={getBarChartOption('Gemini Calls by Type (incl. Retries)', callsByTypeWithRetriesData.labels, callsByTypeWithRetriesData.values, 'Calls', '#5470c6')} style={{ height: '300px', width: '100%' }} notMerge={true} lazyUpdate={true}/>
                         ) : (
                             <div className="h-[300px] flex items-center justify-center text-gray-500">No Gemini Calls by Type Data</div>
                         )}
                     </div>
                      {/* Chart: Top Errors */}
                     <div className="bg-white shadow rounded-lg p-4 border border-gray-100 md:col-span-2 lg:col-span-1 min-h-[340px]">
                        {topErrorsData.labels.length > 0 ? (
                             <ReactECharts option={getBarChartOption('Top Aggregated Errors', topErrorsData.labels, topErrorsData.values, 'Count', '#ee6666')} style={{ height: '300px', width: '100%' }} notMerge={true} lazyUpdate={true}/>
                        ) : (
                             <div className="h-[300px] flex items-center justify-center text-gray-500">No Aggregated Errors Found</div>
                         )}
                     </div>
                </div>

                {/* --- Log Processing Errors (Nếu có) --- */}
                {data.logProcessingErrors && data.logProcessingErrors.length > 0 && (
                     <div className="bg-yellow-50 border border-yellow-300 shadow-sm rounded-lg p-4 mt-6"> {/* Giữ nguyên padding/margin nếu cần */}
                         <h3 className="text-md font-semibold mb-2 text-yellow-800 flex items-center">
                             <FaExclamationTriangle className="mr-2" />
                             Log Parsing Issues ({data.parseErrors} errors / {data.totalLogEntries} entries)
                         </h3>
                         <ul className="list-disc list-inside text-sm text-yellow-700 max-h-40 overflow-y-auto pl-4 space-y-1">
                             {data.logProcessingErrors.slice(0, 20).map((err, index) => (
                                 <li key={index} className="break-words">{err}</li>
                             ))}
                             {data.logProcessingErrors.length > 20 && <li>... (and {data.logProcessingErrors.length - 20} more)</li>}
                         </ul>
                     </div>
                 )}
            </div> {/* Kết thúc div của content có thể thu gọn */}
        </section>
    );
};

export default OverallSummary;