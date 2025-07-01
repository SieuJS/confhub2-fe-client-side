// src/app/[locale]/chatbot/livechat/hooks/useInteractionHandlers.ts
import {
    StreamingLog,
    LiveOutgoingMessage, // SDKLiveClientMessage
} from "../../lib/live-chat.types";
import { useLoggerStore } from "../lib/store-logger";
import { Part, Content as SDKContent } from "@google/genai"; // SDK types

interface InteractionHandlersProps {
    connected: boolean; // Trạng thái kết nối (từ useConnection, đã đồng bộ với SDK)
    connectWithPermissions: () => Promise<void>; // Từ useConnection
    setMuted: (muted: boolean) => void;
    // client: MultimodalLiveClient; // Loại bỏ client cũ
    sendClientContent: (params: { turns: SDKContent[] | SDKContent, turnComplete?: boolean }) => void; // Hàm mới từ useLiveAPI
    log: (logEntry: StreamingLog) => void;
    startLoading: (sentLogIndex: number) => void;
    stopLoading: () => void;
}

const useInteractionHandlers = ({
    connected,
    connectWithPermissions,
    setMuted,
    sendClientContent, // Sử dụng hàm này
    log,
    startLoading,
    stopLoading
}: InteractionHandlersProps) => {

    const handleSendMessage = async (textInput: string) => {
        if (!connected) {
            log({
                 date: new Date(),
                 type: "info.sendAttempt",
                 message: "Send message attempt while not connected.",
            });
            // Cân nhắc: có nên tự động gọi connectWithPermissions() ở đây không?
            // await connectWithPermissions(); // Nếu muốn tự động kết nối
            // if(!useLiveAPIContext().connected) return; // Kiểm tra lại sau khi connect
            return;
        }
        if (textInput.trim() === "") {
            log({
                 date: new Date(),
                 type: "info.sendAttempt",
                 message: "Attempted to send empty message.",
            });
            return;
        }

        const currentLogs = useLoggerStore.getState().logs;
        const nextLogIndex = currentLogs.length;

        // console.log(`[InteractionHandlers] Triggered handleSendMessage. Next log index: ${nextLogIndex}. Setting loading TRUE.`);
        startLoading(nextLogIndex);

        try {
            const parts: Part[] = [{ text: textInput }];
            const userContent: SDKContent = { role: "user", parts }; // Đảm bảo đúng kiểu SDKContent

            // Log message sẽ được gửi
            const messageToSendForLog: LiveOutgoingMessage = { // SDKLiveClientMessage
                clientContent: {
                    turns: [userContent],
                    turnComplete: true,
                },
            };
            log({
                 date: new Date(),
                 type: "client.send.text",
                 message: messageToSendForLog,
                 count: 1,
            });

            // Gọi hàm sendClientContent từ useLiveAPI
            sendClientContent({ turns: [userContent], turnComplete: true });

            // Loading sẽ được dừng bởi useEffect trong component chính khi có phản hồi hoặc lỗi

        } catch (error) {
            // console.error("Failed to send message via sendClientContent:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            log({
                date: new Date(),
                type: "error.send",
                message: `Failed to send message: ${errorMessage}`,
            });
            // console.log("[InteractionHandlers] Error during sendClientContent. Setting loading FALSE.");
            stopLoading();
        }
    };

    const handleStartVoice = async () => {
        if (!connected) {
            try {
                log({ date: new Date(), type: "info.voice", message: "Not connected. Attempting to connect for voice."});
                await connectWithPermissions();
                // Sau khi connectWithPermissions() thành công, `connected` prop sẽ được cập nhật
                // và useEffect trong component chính sẽ re-render.
                // Không cần kiểm tra lại `connected` ngay tại đây.
            } catch (error) {
                // console.error("Failed to connect with permissions for voice:", error);
                log({
                    date: new Date(),
                    type: "error.connectVoice",
                    message: `Failed to connect for voice: ${error instanceof Error ? error.message : String(error)}`,
                });
                return;
            }
        }
        // Nếu đã connected hoặc vừa connect thành công ở trên:
        setMuted(false);
        log({
            date: new Date(),
            type: "client.voice.start",
            message: "Voice input started (unmuted).",
        });
    };

    return { handleSendMessage, handleStartVoice };
}

export default useInteractionHandlers;