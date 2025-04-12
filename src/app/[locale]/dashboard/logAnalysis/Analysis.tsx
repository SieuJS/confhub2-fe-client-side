import React, { useState, useEffect } from 'react';
import { useLogAnalysisData } from '../../../../hooks/logAnalysis/useLogAnalysisData'; // Điều chỉnh đường dẫn nếu cần
import { FaExclamationTriangle, FaSyncAlt } from 'react-icons/fa'; // Giữ lại icon cho phần loading/error tổng


// Import các component con đã tách
import ConferenceCrawlUploader from './ConferenceCrawlUploader';
import AnalysisHeader from './AnalysisHeader';
import OverallSummary from './OverallSummary';
import ConferenceDetails from './ConferenceDetails';

// Import kiểu dữ liệu nếu cần định nghĩa ở file riêng
// import { LogAnalysisData } from './types';

// (Optional) Import hook quản lý time filter nếu tạo
// import { useTimeFilter } from './hooks/useTimeFilter';

const Analysis: React.FC = () => {
    // --- State cho Bộ lọc Thời gian ---
    const [timeFilterOption, setTimeFilterOption] = useState<string>('latest');
    const [filterStartTime, setFilterStartTime] = useState<number | undefined>(undefined);
    const [filterEndTime, setFilterEndTime] = useState<number | undefined>(undefined);

    // --- State cho việc mở rộng/thu hẹp Overall Summary ---
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(true); // Mặc định mở rộng

    // --- Tính toán startTime/endTime dựa trên lựa chọn filter ---
    useEffect(() => {
        const now = Date.now();
        let start: number | undefined = undefined;
        let end: number | undefined = now; // Mặc định là đến hiện tại

        switch (timeFilterOption) {
            case 'last_hour': start = now - 60 * 60 * 1000; break;
            case 'last_6h': start = now - 6 * 60 * 60 * 1000; break;
            case 'last_24h': start = now - 24 * 60 * 60 * 1000; break;
            case 'last_7d': start = now - 7 * 24 * 60 * 60 * 1000; break;
            case 'latest': // Hoặc 'all_time'
            default: start = undefined; end = undefined; break;
        }
        console.log(`Time filter changed to: ${timeFilterOption}. Start: ${start ? new Date(start).toISOString() : 'None'}, End: ${end ? new Date(end).toISOString() : 'None'}`);
        setFilterStartTime(start);
        setFilterEndTime(end);
    }, [timeFilterOption]);

    // --- Fetch Data ---
    const { data, loading, error, isConnected, refetchData } = useLogAnalysisData(filterStartTime, filterEndTime);

    // --- Hàm xử lý thay đổi bộ lọc ---
    const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setTimeFilterOption(event.target.value);
        // Hook sẽ tự động fetch lại
    };

    // --- Hàm xử lý toggle Summary ---
    const handleToggleSummary = () => {
        setIsSummaryExpanded(prev => !prev);
    };

    // --- Render Logic ---

    // 1. Loading Initial (Không có data cũ)
    if (loading && !data) {
        return (
            <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen font-sans">
                {/* Vẫn render Header ở trạng thái loading */}
                <AnalysisHeader
                    loading={true}
                    error={null}
                    isConnected={isConnected} // Vẫn có thể hiển thị trạng thái connect
                    data={null}
                    timeFilterOption={timeFilterOption}
                    handleFilterChange={handleFilterChange}
                    refetchData={refetchData}
                />
                <div className="flex justify-center items-center h-[calc(100vh-200px)] text-gray-600">
                    Loading Analysis Data...
                    <FaSyncAlt className="ml-2 animate-spin" />

                </div>
            </div>
        );
    }

    // 2. Error Initial (Lỗi và không có data cũ)
    if (error && !data) {
        return (
            <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-100 to-red-50 min-h-screen font-sans">
                {/* Render Header ở trạng thái lỗi */}
                <AnalysisHeader
                    loading={false} // Không loading nữa khi đã có lỗi
                    error={error}
                    isConnected={isConnected}
                    data={null}
                    timeFilterOption={timeFilterOption}
                    handleFilterChange={handleFilterChange}
                    refetchData={refetchData} // Cho phép thử lại
                />
                <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] text-red-600 font-semibold">
                    <FaExclamationTriangle size={32} className="mb-4 text-red-500" />
                    Error loading analysis data:
                    <p className="text-sm mt-2 text-center max-w-md">{error}</p>
                    <span className="text-xs text-gray-500 mt-4">(Check console for more details or try refreshing)</span>
                </div>
            </div>
        );
    }

    // 3. No Data (Không lỗi, không loading, nhưng data là null/undefined hoặc không có gì)
    if (!data || !data.overall) { // Kiểm tra data hoặc một trường quan trọng như overall
        return (
            <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen font-sans">
                {/* Render Header bình thường, cho phép chọn filter/refresh */}
                <AnalysisHeader
                    loading={loading} // Vẫn có thể đang refresh
                    error={error} // Hiển thị lỗi fetch cuối nếu có
                    isConnected={isConnected}
                    data={data} // data có thể là {} rỗng
                    timeFilterOption={timeFilterOption}
                    handleFilterChange={handleFilterChange}
                    refetchData={refetchData}
                />
                <div className="flex justify-center items-center h-[calc(100vh-200px)] text-gray-500">
                    No analysis data available for the selected period or log file.
                </div>
            </div>
        );
    }

    // 4. Success (Có data để hiển thị, có thể đang refresh trong nền)
    return (
        <div className="p-4 md:p-2 lg:p-4 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen font-sans">

            <div className="mb-4">
                <ConferenceCrawlUploader />
            </div>

            {/* Render Header với đầy đủ thông tin */}
            <AnalysisHeader
                loading={loading} // Chỉ báo loading nếu đang refresh
                error={error} // Hiển thị lỗi fetch cuối nếu có
                isConnected={isConnected}
                data={data}
                timeFilterOption={timeFilterOption}
                handleFilterChange={handleFilterChange}
                refetchData={refetchData}
            />

            {/* Render các section con, truyền data và props cho toggle xuống */}
            <OverallSummary
                data={data}
                timeFilterOption={timeFilterOption}
                isExpanded={isSummaryExpanded} // Truyền state xuống
                onToggle={handleToggleSummary} // Truyền handler xuống
            />
            <ConferenceDetails conferenceAnalysis={data.conferenceAnalysis} />

        </div>
    );
};

export default Analysis;