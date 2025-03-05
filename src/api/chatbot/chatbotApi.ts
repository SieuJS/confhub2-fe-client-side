// // src/api/chatbotApi.ts
// const API_BASE_URL = 'http://localhost:3000/api'; // Or your server's URL

// // Define types for API responses and requests
// interface TextMessageResponse {
//     type: 'text';
//     message: string;
// }

// interface ChartMessageResponse {
//     type: 'chart';
//     echartsConfig: any; // Replace 'any' with a more specific type if you have one for echartsConfig
//     sqlResult: any;     // Replace 'any' with a more specific type if you have one for sqlResult
//     description: string;
// }

// export type ChatResponse = TextMessageResponse | ChartMessageResponse;

// export interface ErrorResponse {
//     error: string;
// }

// export type HistoryItem =
//     | { role: "user" | "model"; parts: [{ text: string }]; type?: 'text' | 'chart' | 'error' | undefined }
//     | { role: "model"; parts: [{ text: any }]; type: 'chart' }; // Adjust 'any' if parts.text for charts has a specific type

// export type ChatHistoryType = HistoryItem[];

// // Non-streaming chat request
// export const sendNonStreamChatRequest = async (
//     userInput: string,
//     history: ChatHistoryType
// ): Promise<ChatResponse> => {
//     try {
//         const response = await fetch(`${API_BASE_URL}/non-stream-chat`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ userInput, history }),
//         });

//         if (!response.ok) {
//             const errorData: ErrorResponse = await response.json();
//             throw new Error(errorData.error || 'Network response was not ok');
//         }

//         return await response.json() as ChatResponse; // Expecting ChatResponse
//     } catch (error: any) { // Type error as any for generic error handling
//         console.error('Error in sendNonStreamChatRequest:', error);
//         throw error;
//     }
// };

// // Streaming chat request
// export const sendStreamChatRequest = async (
//     userInput: string,
//     history: ChatHistoryType,
//     onPartialResponse: (data: ChatResponse | ErrorResponse) => void // Define type for onPartialResponse data
// ): Promise<void> => {
//     try {
//         const response = await fetch(`${API_BASE_URL}/stream-chat`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ userInput, history }),
//         });

//         if (!response.ok) {
//             const errorData: ErrorResponse = await response.json();
//             throw new Error(errorData.error || 'Network response was not ok');
//         }

//         if (!response.body) {
//             throw new Error('Response body is null');
//         }

//         const reader = response.body.getReader();
//         const decoder = new TextDecoder('utf-8');
//         let buffer = '';

//         while (true) {
//             const { done, value } = await reader.read();
//             if (done) {
//                 break;
//             }

//             buffer += decoder.decode(value, { stream: true });
//             let boundary = buffer.indexOf('\n\n');

//             while (boundary !== -1) {
//                 const chunk = buffer.substring(0, boundary).trim();
//                 buffer = buffer.substring(boundary + 2);
//                 boundary = buffer.indexOf('\n\n');
//                 if (chunk.startsWith('data:')) {
//                     const data = chunk.substring(5);
//                     try {
//                         const parsedData: ChatResponse = JSON.parse(data); // Parse data as ChatResponse
//                          onPartialResponse(parsedData); // Call the callback with the parsed data
//                      } catch (e: any) { // Type error as any for generic error handling
//                           console.error("Error parsing streamed data:", e);
//                           onPartialResponse({ error: "Error parsing stream data." } as ErrorResponse); // Type as ErrorResponse // FIXED HERE
//                     }
//                 }
//             }
//         }
//     } catch (error: any) { // Type error as any for generic error handling
//         console.error('Error in sendStreamChatRequest:', error);
//         onPartialResponse({ error: error.message || 'Unknown streaming error' } as ErrorResponse); // Send error to partial response handler // FIXED HERE
//         throw error; // Re-throw the error so the caller can handle it
//     }
// };

// src/api/chatbot/chatbotApi.ts (No changes needed here, but included for completeness)
const API_BASE_URL = 'http://localhost:3000/api';

interface TextMessageResponse {
    type: 'text';
    message: string;
}

interface ChartMessageResponse {
    type: 'chart';
    echartsConfig: any;
    sqlResult: any;
    description: string;
}

interface InternalNavigationResponse {
    action: 'redirect';
    navigationType: 'internal';
    path: string;
}

interface ExternalNavigationResponse {
    action: 'redirect';
    navigationType: 'external';
    url: string;
}

export type ChatResponse =
    | TextMessageResponse
    | ChartMessageResponse
    | InternalNavigationResponse
    | ExternalNavigationResponse;

export interface ErrorResponse {
    error: string;
}

export type HistoryItem =
    { role: "user" | "model"; parts: [{ text: string }]; type?: 'text' | 'chart' | 'error' | 'navigation' }

export type ChatHistoryType = HistoryItem[];



export const sendNonStreamChatRequest = async (
    userInput: string,
    history: ChatHistoryType
): Promise<ChatResponse | ErrorResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/non-stream-chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userInput, history }),
        });

        if (!response.ok) {
            const errorData: ErrorResponse = await response.json();
            throw new Error(errorData.error || 'Network response was not ok');
        }

        return await response.json();

    } catch (error: any) {
        console.error('Error in sendNonStreamChatRequest:', error);
        return { error: error.message || "An unexpected error occurred." };
    }
};