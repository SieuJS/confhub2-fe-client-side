// File chatbotApi.ts:

import { appConfig } from "@/src/middleware";

// Giữ lại base URL
const API_BASE_URL = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api`;

// --- BEGIN: Simplified Response Types ---

// 1. Text Response (Giữ nguyên hoặc điều chỉnh nếu backend thay đổi key)
export interface TextMessageResponse {
    type: 'text';
    message: string;
    // thought?: string; // Có thể giữ lại nếu backend vẫn gửi thought cho text
}

// 2. Unified Error Response (Khớp với backend và lỗi fetch/network)
export interface ApiErrorResponse {
    type: 'error'; // Thêm 'type' để thống nhất
    message: string; // Sử dụng 'message' thay vì 'error' để nhất quán
    thought?: string; // Giữ lại thought để debug
}

// 3. Updated API Response Union Type (Chỉ còn text hoặc error)
export type ApiResponse = TextMessageResponse | ApiErrorResponse;

// --- END: Simplified Response Types ---


// --- BEGIN: Simplified History Item Type for API ---

// Chỉ cần role và parts khi gửi lên API
export interface ApiHistoryItem {
     role: "user" | "model";
     parts: [{ text: string }];
     // Không cần trường 'type' ở đây nữa
}

export type ApiChatHistory = ApiHistoryItem[];

// --- END: Simplified History Item Type for API ---


// --- BEGIN: Updated sendNonStreamChatRequest Function ---
export const sendNonStreamChatRequest = async (
    userInput: string,
    history: ApiChatHistory // Sử dụng type history đã đơn giản hóa
): Promise<ApiResponse> => { // Trả về ApiResponse (Text hoặc Error)
    try {
        const response = await fetch(`${API_BASE_URL}/non-stream-chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Gửi userInput và history đã được map đúng chuẩn ApiHistoryItem
            body: JSON.stringify({ userInput, history }),
        });

        // Phân tích response JSON MỘT LẦN
        const responseData = await response.json();

        if (!response.ok) {
            // Nếu server trả về lỗi (status >= 400), nó nên có dạng ApiErrorResponse
            console.error('API Error Response:', responseData);
            const errorMessage = responseData?.message || responseData?.error || `HTTP error! status: ${response.status}`;
            const errorThought = responseData?.thought;
            // Trả về đối tượng lỗi thống nhất
            return {
                type: 'error',
                message: errorMessage,
                thought: errorThought
            };
        }

        // Nếu response.ok, dữ liệu trả về phải là TextMessageResponse (hoặc error nếu backend xử lý lỗi nhưng trả về 200?)
        // Kiểm tra lại cấu trúc responseData nếu cần, nhưng giả sử nó là ApiResponse hợp lệ
        // Cast sang ApiResponse để đảm bảo type checking
        return responseData as ApiResponse;

    } catch (error: any) {
        // Xử lý lỗi mạng, lỗi parse JSON, hoặc lỗi không mong muốn khác
        console.error('Error in sendNonStreamChatRequest (catch block):', error);
        // Trả về đối tượng lỗi thống nhất
        return {
            type: 'error', // Đánh dấu là lỗi
            message: error.message || "An unexpected network or client-side error occurred.",
            // Không có 'thought' cho lỗi loại này trừ khi bạn muốn thêm thông tin debug cụ thể
        };
    }
};
// --- END: Updated sendNonStreamChatRequest Function ---