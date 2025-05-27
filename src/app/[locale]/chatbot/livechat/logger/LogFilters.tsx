// src/app/[locale]/chatbot/livechat/logger/LogFilters.tsx
import {
  StreamingLog,
  isClientContentMessage,
  isToolCallMessage,
  isToolCallCancellationMessage,
  isToolResponseMessage,
  isServerContentMessage,
  isClientAudioMessage,
  isServerAudioMessage,
  SDKMessageUnion, // Import SDKMessageUnion
  TranscriptionPayload // Import TranscriptionPayload để kiểm tra
} from "../../lib/live-chat.types";

export type LoggerFilterType = "conversations" | "tools" | "none";

// Helper type guard để kiểm tra xem có phải là TranscriptionPayload không
// (dựa trên cấu trúc, vì chúng ta không có type guard isTranscriptionPayload từ thư viện)
const isTranscriptionLogMessage = (msg: any): msg is TranscriptionPayload => {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    typeof msg.text === 'string' &&
    typeof msg.finished === 'boolean'
    // Bạn có thể thêm các kiểm tra khác nếu cần để phân biệt rõ hơn
  );
};

// Helper type guard để kiểm tra xem có phải là SDKMessageUnion không (đã có trong MessageRenderer)
// Bạn có thể import nó từ MessageRenderer hoặc định nghĩa lại ở đây nếu muốn tách biệt
const isSDKMessage = (msg: any): msg is SDKMessageUnion => {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    ('setup' in msg || 'clientContent' in msg || 'realtimeInput' in msg || 'toolResponse' in msg ||
     'setupComplete' in msg || 'serverContent' in msg || 'toolCall' in msg || 'toolCallCancellation' in msg || 'usageMetadata' in msg)
  );
};


export const filters: Record<LoggerFilterType, (log: StreamingLog) => boolean> = {
  tools: (log: StreamingLog) => {
    const message = log.message; // Gán vào biến để dễ đọc

    // 1. Loại trừ các kiểu không phải SDKMessageUnion và không phải tool-related
    if (
        typeof message === 'string' ||
        isClientAudioMessage(message) ||
        isServerAudioMessage(message) ||
        isTranscriptionLogMessage(message) // << THÊM KIỂM TRA NÀY
    ) {
        return false;
    }

    // 2. Bây giờ message có khả năng cao là SDKMessageUnion
    //    Sử dụng isSDKMessage để thu hẹp kiểu một cách an toàn hơn
    if (isSDKMessage(message)) {
        // Các type guard này giờ nhận đầu vào đã được thu hẹp thành SDKMessageUnion
        return isToolCallMessage(message) ||
               isToolResponseMessage(message) ||
               isToolCallCancellationMessage(message);
    }

    return false; // Nếu không phải các kiểu trên, không phải là tool message
  },
  conversations: (log: StreamingLog) => {
    const message = log.message;

    // 1. Loại trừ các kiểu không phải SDKMessageUnion và không phải conversation-related
    if (
        typeof message === 'string' ||
        // isClientAudioMessage(message) || // Sẽ được xử lý bởi isClientContentMessage nếu audio là một phần của content
        // isServerAudioMessage(message) || // Sẽ được xử lý bởi isServerContentMessage nếu audio là một phần của content
        isTranscriptionLogMessage(message) // << THÊM KIỂM TRA NÀY
    ) {
        // Nếu bạn muốn hiển thị audio log trong "conversations", hãy bỏ comment các dòng trên
        // và đảm bảo logic không bị trùng lặp.
        // Hiện tại, chúng ta giả định audio messages (ClientAudioMessage, ServerAudioMessage)
        // không phải là một phần của "conversations" filter này.
        return false;
    }

    // 2. Kiểm tra SDKMessageUnion
    if (isSDKMessage(message)) {
        return isClientContentMessage(message) ||
               isServerContentMessage(message);
               // Các isClientAudioMessage/isServerAudioMessage ở đây là thừa nếu đã lọc ở trên
               // và nếu chúng không phải là một phần của SDKMessageUnion theo cách bạn định nghĩa.
    }
    // Nếu bạn muốn ClientAudioMessage và ServerAudioMessage (loại debounced)
    // được coi là một phần của "conversations", bạn có thể thêm chúng vào đây:
    // return isClientAudioMessage(message) || isServerAudioMessage(message);
    // Tuy nhiên, điều này có thể làm cho filter "conversations" bao gồm cả audio logs
    // mà có thể bạn muốn tách riêng.

    return false;
  },
  none: () => true,
};