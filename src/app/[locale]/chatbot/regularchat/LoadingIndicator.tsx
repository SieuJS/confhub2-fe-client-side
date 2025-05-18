// src/app/[locale]/chatbot/regular/LoadingIndicator.tsx
import React from 'react'
import {
  FiDownloadCloud,
  FiCpu,
  FiSettings,
  FiSearch,
  FiDatabase,
  FiEdit,
  FiAlertTriangle,
  FiHelpCircle,
  FiLoader, // <<< Icon chung cho trạng thái loading/chờ
  FiCheckSquare, // <<< Icon cho trạng thái sẵn sàng/đã load xong (tùy chọn)
  FiFilePlus // <<< Icon cho việc bắt đầu chat mới
} from 'react-icons/fi' // Hoặc thư viện icon bạn đang dùng
import { MdOutlineAltRoute } from 'react-icons/md'
// Import icons from other libraries if needed
import { FaBrain } from 'react-icons/fa'; // Example: Using react-icons/fa for FaBrain
import { GiPapers } from 'react-icons/gi'; // Example: Using react-icons/gi for GiPapers
import { GoGear } from 'react-icons/go'; // Example: Using react-icons/go for GoGear

import { useTranslations } from 'next-intl'

/**
 * Ánh xạ các step chi tiết vào một IconComponent đại diện cho giai đoạn chính.
 */
const getLoadingPhaseIcon = (step: string): React.ElementType => {
  const normalizedStep = step.toLowerCase()

  // --- Giai đoạn Lỗi / Warning ---
  if (
    normalizedStep.includes('error') ||
    normalizedStep.includes('failed') ||
    normalizedStep.includes('not_found') ||
    normalizedStep.includes('unknown_function') ||
    normalizedStep.includes('max_turns') ||
    normalizedStep.includes('warn')
  ) {
    return FiAlertTriangle
  }

  // === CÁC STEP MỚI LIÊN QUAN ĐẾN HISTORY/CONVERSATION ===
  if (
    normalizedStep === 'loading_history' ||
    normalizedStep === 'fetching_list'
  ) {
    // Thêm fetching_list nếu có
    return FiLoader // Icon loading chung khi tải dữ liệu
  }
  if (normalizedStep === 'history_loaded') {
    // Thường không hiển thị loading nữa, nhưng có thể dùng icon check nếu muốn
    return FiCheckSquare // Hoặc trả về null/FiCpu nếu không muốn hiển thị gì đặc biệt
  }
  if (normalizedStep === 'starting_new_chat') {
    return FiFilePlus // Icon cho việc tạo mới
  }
  if (normalizedStep === 'new_chat_ready') {
    // Tương tự history_loaded, có thể không cần icon
    return FiCheckSquare // Hoặc null/FiCpu
  }
  // ======================================================

  // Routing Task
  if (normalizedStep === 'routing_task') {
    return MdOutlineAltRoute
  }

  // --- Giai đoạn Xử lý Input ---
  if (normalizedStep === 'processing_input' || normalizedStep === 'sending') {
    // Thêm 'sending'
    return FiDownloadCloud
  }

  // --- Giai đoạn Suy nghĩ / Lập kế hoạch ---
  if (normalizedStep === 'thinking') {
    return FiCpu
  }

  // --- Giai đoạn Gọi Function / Thực thi Hành động ---
  if (
    normalizedStep.startsWith('function_call') ||
    normalizedStep.startsWith('validating') ||
    normalizedStep.startsWith('preparing') ||
    normalizedStep.startsWith('executing') ||
    normalizedStep.endsWith('action_prepared') ||
    normalizedStep.startsWith('determining') ||
    normalizedStep === 'processing_request' ||
    normalizedStep === 'confirming_email' ||
    // === BỔ SUNG STEP MỚI ===
    normalizedStep === 'follow_check_clear_for_blacklist', // Liên quan đến kiểm tra/xử lý
    normalizedStep === 'blacklist_check_clear_for_follow' // Liên quan đến kiểm tra/xử lý

    // =======================
  ) {
    // Thêm confirming_email
    return FiSettings
  }

  // --- Giai đoạn Truy xuất / Tìm kiếm Thông tin ---
  if (
    normalizedStep.startsWith('retrieving') ||
    normalizedStep.startsWith('finding') ||
    normalizedStep.startsWith('checking') ||
    // === BỔ SUNG STEP MỚI ===
    normalizedStep === 'listing_followed_items' || // Liên quan đến truy xuất danh sách
    normalizedStep === 'listing_calendar_items' || // Liên quan đến truy xuất danh sách
    normalizedStep === 'listing_blacklisted_items' // Liên quan đến truy xuất danh sách


    // =======================
  ) {
    return FiSearch
  }

  // --- Giai đoạn Xử lý Kết quả / Dữ liệu ---
  if (
    normalizedStep.startsWith('processing_function_result') ||
    normalizedStep.startsWith('parsing') ||
    normalizedStep.endsWith('found') ||
    normalizedStep.endsWith('checked') ||
    normalizedStep.endsWith('determined') ||
    normalizedStep.endsWith('success') || // Có thể giữ lại hoặc chuyển về FiCpu
    normalizedStep.startsWith('email_') ||
    // === BỔ SUNG STEP MỚI ===
    normalizedStep === 'function_result_processed' // Đã có từ trước, giữ nguyên
    // =======================
  ) {
    // email_success, email_failed
    return FiDatabase
  }

  // --- Giai đoạn Tạo Phản hồi ---
  if (
    normalizedStep === 'generating_response' ||
    normalizedStep === 'streaming_response'
  ) {
    // Thêm streaming
    return FiEdit
  }

  // === CÁC STEP MỚI ĐƯỢC BỔ SUNG (VÀ CẬP NHẬT ICON NẾU CẦN) ===

  // sub_agent_thinking: Icon liên quan đến suy nghĩ của sub-agent
  if (normalizedStep === 'sub_agent_thinking') {
    return FaBrain; // Sử dụng FaBrain từ react-icons/fa
  }

  // function_result_prepared: Icon liên quan đến kết quả đã chuẩn bị
  if (normalizedStep === 'function_result_prepared') {
    return GiPapers; // Sử dụng GiPapers từ react-icons/gi (có thể thay bằng icon khác tùy ý)
  }

  // sub_agent_processing_complete: Icon liên quan đến xử lý hoàn tất bởi sub-agent
  if (normalizedStep === 'sub_agent_processing_complete') {
    return GoGear; // Sử dụng GoGear từ react-icons/go (có thể thay bằng icon khác tùy ý)
  }


  // follow_no_action_needed: Icon cho trạng thái không cần hành động (hoàn thành kiểm tra)
  if (normalizedStep === 'follow_no_action_needed') {
    return FiCheckSquare; // Icon hoàn thành
  }

  // calendar_no_action_needed: Icon cho trạng thái không cần hành động (hoàn thành kiểm tra)
  if (normalizedStep === 'calendar_no_action_needed') {
    return FiCheckSquare; // Icon hoàn thành
  }

  // blacklist_no_action_needed: Icon cho trạng thái không cần hành động (hoàn thành kiểm tra)
  if (normalizedStep === 'blacklist_no_action_needed') {
    return FiCheckSquare; // Icon hoàn thành
  }

  // ===============================

  // --- Mặc định / Fallback ---
  console.warn(`LoadingIndicator: Unknown step "${step}", using default icon.`)
  return FiCpu // Thinking làm mặc định
}

interface LoadingIndicatorProps {
  step: string
  message: string
  timeCounter: string | undefined
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  step,
  message,
  timeCounter
}) => {
  const PhaseIconComponent = getLoadingPhaseIcon(step)
  const t = useTranslations()

  // --- CẬP NHẬT LOGIC ẨN ---
  // Các step báo hiệu quá trình loading/chờ đã kết thúc và không cần hiển thị indicator nữa
  const completedSteps = [
    'history_loaded',
    'new_chat_ready',
    'result_received', // Thêm result_received nếu đây là trạng thái cuối
    'connected', // Thường không hiển thị loading khi chỉ connected
    'disconnected', // Không hiển thị loading khi disconnected
    'email_success', // Có thể ẩn sau một thời gian ngắn hoặc nếu không có message
    'email_failed', // Tương tự email_success
    'email_cancelled', // Tương tự
    'sub_agent_processing_complete', // Có thể ẩn nếu không có message cuối cùng
    // === BỔ SUNG STEP MỚI VÀO DANH SÁCH HOÀN THÀNH ===
    'follow_no_action_needed', // Step này thường là kết quả cuối của một quy trình kiểm tra
    'calendar_no_action_needed', // Step này thường là kết quả cuối của một quy trình kiểm tra
    'blacklist_no_action_needed', // Step này thường là kết quả cuối của một quy trình kiểm tra

    // ==============================================
    // Thêm các step khác nếu cần
  ]

  // Thêm các step có thể có message cuối cùng mà vẫn muốn hiển thị indicator một lúc
  const completedStepsWithOptionalMessage = [
    'email_success',
    'email_failed',
    'email_cancelled',
    'sub_agent_processing_complete', // Ví dụ: Có thể có message "Sub-agent finished processing."
    // === BỔ SUNG STEP MỚI VÀO DANH SÁCH CÓ MESSAGE TÙY CHỌN ===
    'follow_no_action_needed', // Có thể có message "Không cần hành động."
    'calendar_no_action_needed', // Có thể có message "Không cần hành động."

    'blacklist_no_action_needed', // Có thể có message "Không cần hành động."
    // =========================================================
  ];


  if (completedSteps.includes(step) && (!completedStepsWithOptionalMessage.includes(step) || !message)) {
    return null; // Ẩn hoàn toàn nếu là step hoàn thành VÀ không nằm trong danh sách có message tùy chọn, HOẶC không có message
  }
  // --------------------------


  return (
    <div
      id='loading-container'
      // - `mb-2` có thể giữ nguyên hoặc giảm.
      // - `space-x-2` -> `space-x-1.5 sm:space-x-2`
      className='flex animate-pulse items-center space-x-1.5 text-xs text-gray-600 sm:space-x-2 dark:text-gray-400'
    >
      <button
        disabled
        type='button'
        // - `px-3 py-2 text-sm` -> `px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm`
        className='inline-flex items-center rounded-md border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-medium sm:px-2.5 sm:py-1.5 sm:text-sm dark:border-gray-600 dark:bg-gray-700'
        title={`Current step: ${step.replace(/_/g, ' ')}`}
      >
        {/* Icon spin */}
        <svg
          aria-hidden='true'
          role='status'
          // - `h-3.5 w-3.5` -> `h-3 w-3 sm:h-3.5 sm:w-3.5`
          // - `me-2` -> `me-1.5 sm:me-2`
          className='me-1.5 inline h-3 w-3 animate-spin text-gray-200 sm:me-2 sm:h-3.5 sm:w-3.5 dark:text-gray-500'
          viewBox='0 0 100 101'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
            fill='currentColor'
          />
          <path
            d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
            fill='#1C64F2'
          />
        </svg>

        {/* Icon đại diện giai đoạn */}
        {PhaseIconComponent && (
          // - `h-4 w-4 me-2` -> `h-3.5 w-3.5 me-1.5 sm:h-4 sm:w-4 sm:me-2`
          <PhaseIconComponent
            className='me-1.5 h-3.5 w-3.5 flex-shrink-0 sm:me-2 sm:h-4 sm:w-4'
            aria-hidden='true'
          />
        )}

        {/* Thông điệp Step / Message tùy chỉnh */}
        {message &&
          ![
            'Loading history...',
            'Starting new chat...',
            '',
            'Thinking...', // Ví dụ: nếu bạn có message mặc định cho thinking
            'Processing function result...', // Ví dụ
            // Thêm các message mặc định khác bạn không muốn hiển thị cùng step
            'Listing followed items...', // Thêm message mặc định cho step mới
            'Listing calendar items...', // Thêm message mặc định cho step mới
            'Listing blacklisted items...', // Thêm message mặc định cho step mới
            'Checking for follow clearance...', // Thêm message mặc định cho step mới
            'Checking for calendar clearance...', // Thêm message mặc định cho step mới
            'Checking for blacklist clearance...', // Thêm message mặc định cho step mới
            'No action needed for follow.', // Thêm message mặc định cho step mới
            'No action needed for calendar.', // Thêm message mặc định cho step mới
            'No action needed for blacklist.' // Thêm message mặc định cho step mới
          ].includes(message) && <span className='truncate'>{message}</span>}

        {/* Hiển thị message mặc định nếu không có message tùy chỉnh */}
        {step === 'loading_history' && !message && (
          <span className='truncate'>{t('Loading_history')}</span>
        )}
        {step === 'starting_new_chat' && !message && (
          <span className='truncate'>{t('Starting_new_chat')}</span>
        )}
        {step === 'sending' && !message && (
          <span className='truncate'>{t('Sending')}</span>
        )}
        {step === 'sub_agent_thinking' && !message && (
          <span className='truncate'>{t('Sub_agent_thinking')}</span> // Thêm bản dịch cho step mới
        )}
        {step === 'function_result_prepared' && !message && (
          <span className='truncate'>{t('Function_result_prepared')}</span> // Thêm bản dịch cho step mới
        )}
        {step === 'sub_agent_processing_complete' && !message && (
          <span className='truncate'>{t('Sub_agent_processing_complete')}</span> // Thêm bản dịch cho step mới
        )}
        {step === 'function_result_processed' && !message && (
          <span className='truncate'>{t('Function_result_processed')}</span> // Thêm bản dịch cho step mới
        )}
        {/* === BỔ SUNG MESSAGE MẶC ĐỊNH CHO STEP MỚI === */}
        {step === 'listing_followed_items' && !message && (
          <span className='truncate'>{t('Listing_followed_items')}</span>
        )}
        {step === 'listing_calendar_items' && !message && (
          <span className='truncate'>{t('Listing_calendar_items')}</span>
        )}
        {step === 'listing_blacklisted_items' && !message && (
          <span className='truncate'>{t('Listing_blacklisted_items')}</span>
        )}
        {step === 'follow_check_clear_for_blacklist' && !message && (
          <span className='truncate'>{t('Follow_check_clear_for_blacklist')}</span>
        )}
        {step === 'blacklist_check_clear_for_follow' && !message && (
          <span className='truncate'>{t('blacklist_check_clear_for_follow')}</span>
        )}
        {step === 'follow_no_action_needed' && !message && (
          <span className='truncate'>{t('follow_no_action_needed')}</span>
        )}
        {step === 'calendar_no_action_needed' && !message && (
          <span className='truncate'>{t('calendar_no_action_needed')}</span>
        )}
        {step === 'blacklist_no_action_needed' && !message && (
          <span className='truncate'>{t('Blacklist_no_action_needed')}</span>
        )}
        {/* =============================================== */}
        {/* Thêm các case khác cho step và message mặc định nếu cần */}


      </button>
      {timeCounter && (
        // - `text-sm` -> `text-xs sm:text-sm`
        <span
          id='time-counter'
          className='flex-shrink-0 font-mono text-xs text-gray-500 sm:text-sm'
        >
          {timeCounter}
        </span>
      )}
    </div>
  );
};

export default LoadingIndicator;