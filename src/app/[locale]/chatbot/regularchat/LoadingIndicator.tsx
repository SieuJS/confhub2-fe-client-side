import React from 'react';
// Import các icon cần thiết từ react-icons, tương ứng với các "giai đoạn" chính
import {
    FiDownloadCloud, // processing_input
    FiCpu,          // thinking, default/fallback
    FiSettings,     // function_call phase (bao gồm validating, preparing, executing)
    FiSearch,       // retrieving_info phase (bao gồm finding, checking)
    FiDatabase,     // processing_function_result phase (bao gồm parsing)
    FiEdit,         // generating_response
    FiAlertTriangle,// function_error phase (bao gồm các lỗi, not_found)
    FiHelpCircle,   // Có thể dùng làm default nếu muốn khác FiCpu
    // FiCheckCircle, // Icon thành công - thường không hiển thị lâu trong loading
} from 'react-icons/fi';

/**
 * Ánh xạ các step chi tiết (từ backend/ThoughtProcess) vào một IconComponent
 * đại diện cho "giai đoạn" (phase) chính đang diễn ra trong LoadingIndicator.
 */
const getLoadingPhaseIcon = (step: string): React.ElementType => {
    // Chuẩn hóa hoặc sử dụng startsWith/includes nếu tên step có thể thay đổi
    const normalizedStep = step.toLowerCase();

    // --- Giai đoạn Lỗi ---
    if (normalizedStep.includes('error') || normalizedStep.includes('failed') || normalizedStep.includes('not_found') || normalizedStep.includes('unknown_function') || normalizedStep.includes('max_turns')) {
        return FiAlertTriangle;
    }

    // --- Giai đoạn Xử lý Input ---
    if (normalizedStep === 'processing_input') {
        return FiDownloadCloud;
    }

    // --- Giai đoạn Suy nghĩ / Lập kế hoạch ---
    if (normalizedStep === 'thinking') {
        return FiCpu;
    }

    // --- Giai đoạn Gọi Function / Thực thi Hành động ---
    // Bao gồm việc quyết định gọi, chuẩn bị, xác thực và thực thi
    if (normalizedStep.startsWith('function_call') ||
        normalizedStep.startsWith('validating') ||
        normalizedStep.startsWith('preparing') ||
        normalizedStep.startsWith('executing') ||
        normalizedStep.endsWith('action_prepared') || // map_action_prepared, etc.
        normalizedStep.startsWith('determining') || // determining_follow_action
        normalizedStep === 'processing_request') {
        return FiSettings; // Hoặc FiZap nếu muốn nhấn mạnh "hành động"
    }

    // --- Giai đoạn Truy xuất / Tìm kiếm Thông tin ---
    if (normalizedStep.startsWith('retrieving') ||
        normalizedStep.startsWith('finding') || // finding_item_id
        normalizedStep.startsWith('checking')) { // checking_authentication, checking_status
        return FiSearch;
    }

    // --- Giai đoạn Xử lý Kết quả / Dữ liệu ---
    if (normalizedStep.startsWith('processing_function_result') ||
        normalizedStep.startsWith('parsing') ||
        normalizedStep.endsWith('found') || // item_id_found, data_found (có thể bỏ qua nếu nó chuyển quá nhanh)
        normalizedStep.endsWith('checked') || // follow_status_checked
        normalizedStep.endsWith('determined') || // follow_action_determined
        normalizedStep.endsWith('success')) { // Tạm thời map cả success vào đây, hoặc có thể về FiCpu/FiSettings
        return FiDatabase; // Đại diện cho việc xử lý dữ liệu trả về
                          // Cân nhắc: Các bước success có thể nên chuyển sang FiCpu (thinking) để chuẩn bị bước tiếp theo?
    }

    // --- Giai đoạn Tạo Phản hồi ---
    if (normalizedStep === 'generating_response') {
        return FiEdit;
    }

    // --- Mặc định / Fallback ---
    // Nếu không khớp với bất kỳ giai đoạn nào ở trên
    console.warn(`LoadingIndicator: Không nhận diện được step "${step}", sử dụng icon mặc định.`);
    return FiCpu; // Sử dụng 'thinking' làm mặc định hợp lý
};


interface LoadingIndicatorProps {
    step: string;        // Step key chi tiết nhận từ backend
    message: string;     // Thông điệp cụ thể cho step đó
    timeCounter: string; // Chuỗi bộ đếm thời gian
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ step, message, timeCounter }) => {
    // Lấy Icon component dựa trên step chi tiết, ánh xạ vào giai đoạn chính
    const PhaseIconComponent = getLoadingPhaseIcon(step);

    return (
        <div id="loading-container" className="mb-2 flex items-center space-x-2 text-gray-600 dark:text-gray-400 animate-pulse"> {/* Thêm animate-pulse cho toàn bộ container */}
            <button
                disabled // Vẫn là button không tương tác
                type="button"
                // Styling đơn giản hóa, màu chữ kế thừa từ div cha
                className="py-2 px-3 text-sm font-medium bg-gray-100 rounded-lg border border-gray-200 inline-flex items-center dark:bg-gray-700 dark:border-gray-600"
                title={`Current step: ${step.replace(/_/g, ' ')}`} // Thêm title để xem step gốc khi hover (hữu ích khi debug)
            >
                 {/* Tùy chọn: Giữ spinner để có chuyển động */}
                 <svg
                    aria-hidden="true"
                    role="status"
                    className="inline w-3.5 h-3.5 me-2 text-gray-200 animate-spin dark:text-gray-500" // Có thể làm spinner nhỏ hơn một chút
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                 >
                     <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                     <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#1C64F2" />
                 </svg>

                {/* Icon đại diện cho Giai đoạn (Phase) */}
                <PhaseIconComponent className="w-4 h-4 me-2 flex-shrink-0" aria-hidden="true" />

                {/* Thông điệp chi tiết của Step hiện tại */}
                <span className="truncate">{message || 'Processing...'}</span> {/* Thêm truncate nếu message có thể quá dài */}
            </button>
            {/* Hiển thị bộ đếm thời gian */}
            <span id="time-counter" className="text-gray-500 text-sm font-mono flex-shrink-0">{timeCounter}</span>
        </div>
    );
};

export default LoadingIndicator;