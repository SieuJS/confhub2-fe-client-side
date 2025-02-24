// src/api/chatbotApi.ts

const API_BASE_URL = 'http://localhost:3000/api'; // Or your API base URL

interface ChatResponse {
    success: boolean;
    response?: any;
    error?: string;
}


export const sendNonStreamChatRequest = async (userInput: string, history: any[]): Promise<ChatResponse> => {
    console.log("Sending non-stream chat request..."); // Log before fetch

    try {
        const response = await fetch(`${API_BASE_URL}/non-stream-chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userInput, history }),
        });

        const responseText = await response.text(); // Get the response as text

        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = JSON.parse(responseText); // Try to parse as JSON even if not ok
                errorMessage = errorData.error || errorMessage; // Use server error if available
                console.error("Server Error Response (JSON):", errorData);
            } catch (jsonError: any) {
                console.error("Could not parse error response as JSON:", jsonError);
                console.error("Raw Error Response Text (HTML?):", responseText); // Log raw text if JSON parsing fails
            }
            throw new Error(errorMessage);
        }

        const responseData = JSON.parse(responseText); // Parse JSON after checking response.ok
        console.log("Response Data (JSON):", responseData);
        return { success: true, response: responseData };

    } catch (error: any) {
        console.error("Could not send chat message:", error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
};

export const sendStreamChatRequest = async (
    userInput: string,
    history: any[],
    onPartialResponse: (partialResponse: string) => void
): Promise<ChatResponse> => {
    console.log("Sending stream chat request...");

    try {
        const response = await fetch(`${API_BASE_URL}/stream-chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream' // Yêu cầu server-sent events
            },
            body: JSON.stringify({ userInput, history }),
        });

        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const responseText = await response.text();
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.error || errorMessage;
                console.error("Server Error Response (JSON):", errorData);
            } catch (jsonError: any) {
                console.error("Could not parse error response as JSON:", jsonError);
                // Có thể không có JSON, có thể là HTML error page
            }
            throw new Error(errorMessage);
        }

        // Đọc stream response
        const reader = response.body?.getReader(); //Check if response.body exists before calling getReader()
        if (!reader) {
            return { success: false, error: "Response body is null" };
        }
        const decoder = new TextDecoder();
        let partialResponse = ""; // Để lưu response đang xây dựng

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                console.log("Stream complete");
                break;
            }
            const chunk = decoder.decode(value);
            console.log("Raw Chunk from Server:", chunk); // *** LOGGING: Raw data chunk ***
            // Xử lý từng chunk (server-sent event)
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    let content = line.substring(5).trim(); // Loại bỏ "data: " và trim
                    console.log("Extracted Content from Chunk (before newline):", content);
                    if (content) {

                        partialResponse += content; // Cộng dồn vào response
                        onPartialResponse(content); // Gọi callback với partial response
                    }
                } else if (line.trim() !== "") {
                    // If the line is not a data line but contains some text,
                    // consider it part of the previous message and append it with a newline
                    if (partialResponse !== "") {
                        partialResponse += "\n" + line;
                        onPartialResponse("\n" + line)

                    }
                }
            }
        }
        return { success: true }; // Trả về thành công sau khi stream xong


    } catch (error: any) {
        console.error("Could not send chat message:", error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
};