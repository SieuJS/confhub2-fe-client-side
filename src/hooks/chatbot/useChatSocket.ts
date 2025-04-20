// src/hooks/useChatSocket.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import {
    StatusUpdate, ResultUpdate, // Ensure ResultUpdate is imported
    NavigationAction, OpenMapAction, // <<< Import NavigationAction
    ErrorUpdate, ThoughtStep, ChatMessageType, LoadingState, ChatUpdate
} from '@/src/models/chatbot/chatbot'; // Adjust path if needed
import { Language } from '@/src/app/[locale]/chatbot/lib/types'; // <<< Import Language type
import { appConfig } from '@/src/middleware';
import { usePathname } from 'next/navigation';

// --- Interfaces ---
export interface UseChatSocketProps {
    socketUrl: string;
    // language: Language; // <<< ADD language prop
    onConnectionChange?: (isConnected: boolean) => void;
    onInitialConnectionError?: (error: Error) => void;
}

export interface ChatSocketControls {
    chatMessages: ChatMessageType[];
    loadingState: LoadingState;
    isConnected: boolean;
    // Update sendMessage signature
    sendMessage: (userInput: string, isStreaming: boolean, language: Language) => void; // <<< Add language
    socketId: string | null;
}

const generateMessageId = () => `msg-${Date.now()}-${Math.random()}`;
const ANIMATION_INTERVAL_MS = 10;
const MIN_CHARS_PER_INTERVAL = 10;
const MAX_CHARS_PER_INTERVAL = 20;
// --- NEW CONSTANT ---
// Start slowing down when fewer than this many characters remain in the current buffer
const EASING_THRESHOLD_CHARS = MAX_CHARS_PER_INTERVAL * 1.5; // Ví dụ: 15 * 3 = 45 chars

export function useChatSocket({
    socketUrl,
    // language, // <<< Destructure language prop
    onConnectionChange,
    onInitialConnectionError
}: UseChatSocketProps): ChatSocketControls {
    const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
    const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: false, step: '', message: '' });
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [socketId, setSocketId] = useState<string | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const isMountedRef = useRef(true);
    const loadingStateRef = useRef(loadingState);

    const streamingMessageIdRef = useRef<string | null>(null);
    const fullStreamedTextRef = useRef<string>('');
    const displayedTextLengthRef = useRef<number>(0);
    const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isStreamingCompleteRef = useRef<boolean>(false);

    // Get Base URL and Locale for internal navigation
    const BASE_WEB_URL = appConfig.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:8386"; // Or your specific config key

    const pathname = usePathname()
    const currentLocale = pathname.split('/')[1];

    useEffect(() => {
        loadingStateRef.current = loadingState;
    }, [loadingState]);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            // --- Cleanup Animation ---
            if (animationTimerRef.current) {
                clearTimeout(animationTimerRef.current);
                animationTimerRef.current = null;
            }
        };
    }, []);

    // --- Hàm dừng animation ---
    const stopAnimation = useCallback(() => {
        if (animationTimerRef.current) {
            clearTimeout(animationTimerRef.current);
            animationTimerRef.current = null;
        }
    }, []);

    const handleError = useCallback((error: ErrorUpdate | { message: string; type?: 'error' | 'warning', thoughts?: ThoughtStep[] }, stopLoading = true) => {
        if (!isMountedRef.current) return;
        console.error("Chat Error/Warning:", error);
        stopAnimation(); // Dừng animation nếu có lỗi
        streamingMessageIdRef.current = null; // Reset trạng thái stream
        fullStreamedTextRef.current = '';
        displayedTextLengthRef.current = 0;
        isStreamingCompleteRef.current = false;

        const message = error.message || 'An unknown error occurred.';
        const type = 'type' in error ? error.type : 'error';
        const thoughts = 'thoughts' in error ? error.thoughts : undefined;

        if (stopLoading) {
            setLoadingState({ isLoading: false, step: 'error', message: type === 'error' ? 'Error' : 'Warning' });
        }

        const botMessage: ChatMessageType = {
            id: generateMessageId(),
            message: message,
            isUser: false,
            type: type,
            thoughts: thoughts
        };
        setChatMessages(prev => [...prev, botMessage]);
    }, [stopAnimation]); // Thêm stopAnimation

    const handleConnect = useCallback(() => { if (!isMountedRef.current) return; console.log('Socket connected:', socketRef.current?.id); setIsConnected(true); setSocketId(socketRef.current?.id ?? null); onConnectionChange?.(true); }, [onConnectionChange]);
    const handleDisconnect = useCallback((reason: Socket.DisconnectReason) => { if (!isMountedRef.current) return; console.warn('Socket disconnected:', reason); setIsConnected(false); setSocketId(null); onConnectionChange?.(false); if (loadingStateRef.current.isLoading) { handleError({ message: `Connection lost while processing: ${reason}. Please check connection.`, type: 'error' }, true); } else { handleError({ message: `Connection lost: ${reason}. Reconnection attempts may be in progress.`, type: 'warning' }, false); } setLoadingState(prev => ({ ...prev, isLoading: false, step: 'disconnected', message: 'Disconnected' })); }, [handleError, onConnectionChange]);
    const handleConnectError = useCallback((err: Error) => { console.error('Socket connection error:', err); if (!isMountedRef.current) return; setIsConnected(false); setSocketId(null); onConnectionChange?.(false); onInitialConnectionError?.(err); handleError({ message: `Failed to connect to the chat server: ${err.message}. Please check the server status and your network.`, type: 'error' }, false); setLoadingState({ isLoading: false, step: 'connection_error', message: 'Connection Failed' }); }, [handleError, onConnectionChange, onInitialConnectionError]);
    const handleStatusUpdate = useCallback((update: StatusUpdate) => { if (!isMountedRef.current) return; setLoadingState({ isLoading: true, step: update.step, message: update.message }); }, []);


    // --- Animation Loop ---
    const animateText = useCallback(() => {
        if (!isMountedRef.current || !streamingMessageIdRef.current || animationTimerRef.current === null) {
            return;
        }

        const targetLength = fullStreamedTextRef.current.length;
        const currentLength = displayedTextLengthRef.current;
        const streamingId = streamingMessageIdRef.current; // Lấy ID một lần

        if (currentLength < targetLength) {
            const remainingChars = targetLength - currentLength;

            // --- Bước 1: Tính toán số ký tự cơ bản (logic bắt kịp cũ) ---
            const charsToAddFactor = Math.max(1, Math.floor(remainingChars / 10));
            const baseCharsToAdd = Math.min(
                remainingChars, // Không bao giờ thêm nhiều hơn số còn lại
                Math.max(MIN_CHARS_PER_INTERVAL, Math.min(MAX_CHARS_PER_INTERVAL, charsToAddFactor))
            );

            // --- Bước 2: Áp dụng Easing (Ease-Out) khi gần kết thúc ---
            let finalCharsToAdd = baseCharsToAdd;
            if (remainingChars > 0 && remainingChars <= EASING_THRESHOLD_CHARS) {
                // Tính hệ số giảm tốc (Ease-Out Quadratic: chậm dần đều khi gần 0)
                // (remainingChars / EASING_THRESHOLD_CHARS) tạo ra giá trị từ ~0 đến 1
                // Bình phương nó để tạo đường cong ease-out (thay đổi chậm hơn khi gần 1, nhanh hơn khi gần 0 - nhưng chúng ta muốn ngược lại)
                // -> Sử dụng căn bậc hai (pow 0.5) hoặc 1 - (1 - x)^2 cho ease-out đúng nghĩa hơn
                // Hoặc đơn giản là dùng tỷ lệ tuyến tính rồi căn bậc hai:
                const progressRatio = remainingChars / EASING_THRESHOLD_CHARS; // Gần 0 là gần hết, gần 1 là mới vào ngưỡng
                // Dùng sqrt để tốc độ giảm nhanh hơn khi còn ít ký tự (ease-out effect)
                const slowdownFactor = Math.sqrt(progressRatio); // Factor từ ~0 đến 1

                // Điều chỉnh số ký tự thêm:
                // Nhân với factor, làm tròn lên để tránh = 0 quá sớm,
                // nhưng phải đảm bảo tối thiểu là 1 và không vượt quá baseCharsToAdd
                finalCharsToAdd = Math.max(
                    1, // Luôn thêm ít nhất 1 ký tự nếu còn
                    Math.min(baseCharsToAdd, Math.ceil(baseCharsToAdd * slowdownFactor))
                );

                // console.log(`Easing: remaining=${remainingChars}, base=${baseCharsToAdd}, factor=${slowdownFactor.toFixed(2)}, final=${finalCharsToAdd}`); // Bỏ comment để debug
            }
            // Đảm bảo không thêm nhiều hơn số ký tự thực sự còn lại (quan trọng sau khi làm tròn/tính toán)
            finalCharsToAdd = Math.min(finalCharsToAdd, remainingChars);


            // --- Bước 3: Cập nhật state React (chỉ khi có gì đó để thêm) ---
            if (finalCharsToAdd > 0) {
                const newLength = currentLength + finalCharsToAdd;
                const textToDisplay = fullStreamedTextRef.current.substring(0, newLength);
                displayedTextLengthRef.current = newLength;

                setChatMessages(prev =>
                    prev.map(msg =>
                        msg.id === streamingId
                            ? { ...msg, message: textToDisplay }
                            : msg
                    )
                );

                // Lên lịch cho frame tiếp theo
                animationTimerRef.current = setTimeout(animateText, ANIMATION_INTERVAL_MS);
            } else {
                // Nếu finalCharsToAdd = 0 (đã hiển thị hết hoặc lỗi tính toán)
                // Kiểm tra xem stream đã xong chưa để dừng hoặc đợi
                if (!isStreamingCompleteRef.current) {
                    // Đã hiển thị hết text hiện có, nhưng server chưa báo xong -> chờ chunk tiếp theo
                    animationTimerRef.current = setTimeout(animateText, ANIMATION_INTERVAL_MS * 2); // Chờ lâu hơn một chút
                } else {
                    // Đã hiển thị hết VÀ server đã báo xong -> Dừng animation tự nhiên
                    stopAnimation();
                    console.log("Animation completed naturally (post-easing calc):", streamingId);
                }
            }

        } else if (!isStreamingCompleteRef.current) {
            // Đã hiển thị hết text hiện có, nhưng server chưa báo xong -> chờ chunk tiếp theo
            animationTimerRef.current = setTimeout(animateText, ANIMATION_INTERVAL_MS * 2); // Chờ lâu hơn một chút
        } else {
            // Đã hiển thị hết VÀ server đã báo xong -> Dừng animation tự nhiên
            stopAnimation();
            console.log("Animation completed naturally (already displayed):", streamingId);
        }
    }, [stopAnimation]); // Nhớ thêm các dependencies khác nếu có (MIN_CHARS_..., MAX_CHARS_...)

    // --- Xử lý khi nhận chunk (handlePartialResult) ---
    const handlePartialResult = useCallback((update: ChatUpdate) => {
        if (!isMountedRef.current) return;

        fullStreamedTextRef.current += update.textChunk; // Nối chunk vào buffer đầy đủ

        // Nếu là chunk đầu tiên của một response mới
        if (!streamingMessageIdRef.current) {
            const newStreamingId = `streaming-${generateMessageId()}`;
            streamingMessageIdRef.current = newStreamingId;
            displayedTextLengthRef.current = 0; // Reset độ dài hiển thị
            isStreamingCompleteRef.current = false; // Đặt lại cờ hoàn thành

            const newStreamingMessage: ChatMessageType = {
                id: newStreamingId,
                message: '', // Bắt đầu rỗng, animation sẽ cập nhật
                isUser: false,
                type: 'text',
                thoughts: [] // Có thể cập nhật thoughts sau nếu cần
            };
            setChatMessages(prev => [...prev, newStreamingMessage]);
            setLoadingState(prev => ({ ...prev, isLoading: true, step: 'streaming_response', message: 'Receiving...' }));

            // --- Khởi động Animation ---
            stopAnimation(); // Đảm bảo không có animation cũ nào chạy
            animationTimerRef.current = setTimeout(animateText, ANIMATION_INTERVAL_MS); // Bắt đầu ngay
        }
        // Nếu không phải chunk đầu tiên, animation loop đang chạy sẽ tự động nhận thấy fullStreamedTextRef dài ra và tiếp tục.

    }, [animateText, stopAnimation]); // Thêm animateText, stopAnimation

    // --- Modify handleResult ---

    // --- Modify handleResult ---
    const handleResult = useCallback((result: ResultUpdate) => {
        if (!isMountedRef.current) return;
        console.log("Socket Result Received:", result);

        // 1. Stop loading/streaming indicators
        isStreamingCompleteRef.current = true;
        setLoadingState({ isLoading: false, step: 'result_received', message: '' });

        const finalStreamingId = streamingMessageIdRef.current;
        streamingMessageIdRef.current = null;
        fullStreamedTextRef.current = '';
        displayedTextLengthRef.current = 0;

        // Determine if the action is 'openMap'
        const isOpenMapAction = result.action?.type === 'openMap';
        const mapLocation = isOpenMapAction ? (result.action as OpenMapAction).location : undefined;

        // --- Update Chat History ---
        setChatMessages(prevMessages => {
            const finalMessageId = generateMessageId(); // Stable ID for the final message

            // Check if we need to update the placeholder streaming message
            const messageExistsIndex = finalStreamingId
                ? prevMessages.findIndex(msg => msg.id === finalStreamingId)
                : -1;

            if (messageExistsIndex !== -1) {
                // Update the existing streaming message
                const updatedMessages = [...prevMessages];
                const existingMsg = updatedMessages[messageExistsIndex];

                if (isOpenMapAction && mapLocation) {
                    // --- Transform into a Map Message ---
                    updatedMessages[messageExistsIndex] = {
                        ...existingMsg,
                        id: finalMessageId, // Assign stable ID
                        type: 'map',
                        message: result.message || `Showing map for: ${mapLocation}`, // Use result msg or generate one
                        location: mapLocation,
                        thoughts: result.thoughts,
                    };
                } else {
                     // --- Update as a Regular Text Message (or handle other actions) ---
                     if (result.action?.type === 'navigate') {
                        // Handle navigation action (still opens new tab for now)
                        const action = result.action as NavigationAction;
                        const urlToOpen = action.url;
                        let finalUrlToOpen = urlToOpen;
                         if (urlToOpen.startsWith('/')) {
                             finalUrlToOpen = `${BASE_WEB_URL}/${currentLocale}${urlToOpen}`;
                         }
                         if (typeof window !== 'undefined') {
                             console.log(`[ChatSocket] Executing window.open for navigation: ${finalUrlToOpen}`);
                             window.open(finalUrlToOpen, '_blank', 'noopener,noreferrer');
                         } else {
                            console.warn("[ChatSocket] Cannot execute navigation action: 'window' object not available.");
                            // Optional: add a warning message to chat?
                         }
                        // Update the text message *after* performing the action
                         updatedMessages[messageExistsIndex] = {
                             ...existingMsg,
                             id: finalMessageId,
                             type: 'text',
                             message: result.message,
                             thoughts: result.thoughts,
                             location: undefined, // Ensure location is not set
                         };

                     } else {
                        // Default: Update as plain text
                        updatedMessages[messageExistsIndex] = {
                            ...existingMsg,
                            id: finalMessageId,
                            type: 'text',
                            message: result.message,
                            thoughts: result.thoughts,
                            location: undefined, // Ensure location is not set
                        };
                    }
                }
                return updatedMessages;

            } else {
                // Add as a completely new message (no prior streaming placeholder)
                let newBotMessage: ChatMessageType;
                if (isOpenMapAction && mapLocation) {
                    // --- Add New Map Message ---
                    newBotMessage = {
                        id: finalMessageId,
                        message: result.message || `Showing map for: ${mapLocation}`,
                        isUser: false,
                        type: 'map',
                        location: mapLocation,
                        thoughts: result.thoughts
                    };
                } else {
                     // --- Add New Text Message (or handle other actions) ---
                     if (result.action?.type === 'navigate') {
                         // Handle navigation action (still opens new tab for now)
                         const action = result.action as NavigationAction;
                         const urlToOpen = action.url;
                         let finalUrlToOpen = urlToOpen;
                         if (urlToOpen.startsWith('/')) {
                             finalUrlToOpen = `${BASE_WEB_URL}/${currentLocale}${urlToOpen}`;
                         }
                         if (typeof window !== 'undefined') {
                             console.log(`[ChatSocket] Executing window.open for navigation: ${finalUrlToOpen}`);
                             window.open(finalUrlToOpen, '_blank', 'noopener,noreferrer');
                         } else {
                             console.warn("[ChatSocket] Cannot execute navigation action: 'window' object not available.");
                         }
                     }
                    // Default: Add new plain text message
                    newBotMessage = {
                        id: finalMessageId,
                        message: result.message,
                        isUser: false,
                        type: 'text',
                        thoughts: result.thoughts
                    };
                }

                // Avoid adding duplicates if handleResult is somehow called multiple times rapidly
                if (!prevMessages.some(msg => msg.id === finalMessageId || (msg.id === finalStreamingId) || (msg.message === newBotMessage.message && !msg.isUser && msg.type === newBotMessage.type))) {
                   return [...prevMessages, newBotMessage];
                } else {
                   return prevMessages; // Already added or updated
                }
            }
        });

    }, [BASE_WEB_URL, currentLocale, stopAnimation /* Add other dependencies */]);


     // --- Socket Connection Effect (MODIFIED) ---
     useEffect(() => {
        console.log("Attempting to establish Socket.IO connection...");
        isMountedRef.current = true; // Set mounted flag early

        // --- Get Auth Token ---
        let authToken: string | null = null;
        if (typeof window !== 'undefined') { // Check if running in browser
            authToken = localStorage.getItem('token'); // <<< GET TOKEN
            if (!authToken) {
                console.warn("[ChatSocket] No auth token found in localStorage. Connecting without authentication.");
                // Decide behavior: Connect anonymously or prevent connection?
                // For now, we connect, backend middleware will handle lack of token.
            } else {
                 console.log("[ChatSocket] Auth token found. Sending with connection request.");
            }
        }
        // --- End Get Auth Token ---

        // --- Establish Connection with Auth ---
        const newSocket = io(socketUrl, {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            auth: { // <<< PASS TOKEN HERE
                token: authToken
            }
        });
        socketRef.current = newSocket;
        // --- End Establish Connection ---


        // --- Register Event Handlers ---
        newSocket.on('connect', handleConnect);
        newSocket.on('disconnect', handleDisconnect);
        newSocket.on('connect_error', handleConnectError); // This will fire if middleware rejects connection
        newSocket.on('status_update', handleStatusUpdate);
        newSocket.on('chat_update', handlePartialResult);
        newSocket.on('chat_result', handleResult);
        newSocket.on('chat_error', (errorData: any) => handleError(errorData, true));
        // Listen for specific auth errors from middleware (optional but good practice)
        newSocket.on('auth_error', (error: { message: string }) => {
             console.error("Authentication Error from Server:", error.message);
             handleError({message: `Authentication failed: ${error.message}. Please log in again.`, type: 'error'}, true);
             // Optionally disconnect or prompt user to log in
             // newSocket.disconnect();
        });
        // --- End Register Handlers ---


        // --- Cleanup Function ---
        return () => {
            console.log("Cleaning up socket connection effect...");
            isMountedRef.current = false; // Mark as unmounted

             // Unregister all listeners
             newSocket.off('connect', handleConnect);
             newSocket.off('disconnect', handleDisconnect);
             newSocket.off('connect_error', handleConnectError);
             newSocket.off('status_update', handleStatusUpdate);
             newSocket.off('chat_update', handlePartialResult);
             newSocket.off('chat_result', handleResult);
             newSocket.off('chat_error');
             newSocket.off('auth_error');

            stopAnimation(); // Cleanup animation
            // Reset streaming refs (important if component re-mounts)
            streamingMessageIdRef.current = null;
            fullStreamedTextRef.current = '';
            displayedTextLengthRef.current = 0;
            isStreamingCompleteRef.current = false;


            if (newSocket.connected) {
                console.log(`Disconnecting socket ${newSocket.id} during cleanup.`);
                newSocket.disconnect();
            } else {
                console.log(`Socket ${newSocket.id} already disconnected or never connected.`);
            }
            socketRef.current = null;

            // Reset state if component is truly unmounting (though maybe not needed if state resets on remount anyway)
            // if (!isMountedRef.current) { // Double-check might be redundant
            //     setIsConnected(false);
            //     setSocketId(null);
            // }
             console.log("Socket cleanup complete.");
        };
         // Dependencies: ensure all handlers used in the effect are stable or included
    }, [socketUrl, handleConnect, handleDisconnect, handleConnectError, handleStatusUpdate, handlePartialResult, handleResult, handleError, animateText, stopAnimation, onConnectionChange, onInitialConnectionError]); // <<< Added missing dependencies

    // --- Send Chat Message Function (Giữ nguyên) ---
    // --- Send Chat Message Function (Accept language, emit it) ---
    const sendMessage = useCallback((userInput: string, isStreaming: boolean, language: Language) => { // <<< Accept language
        const trimmedMessage = userInput.trim();
        if (!trimmedMessage) return;

        if (!socketRef.current || !socketRef.current.connected) {
            handleError({ message: "Cannot send message: Not connected. Please wait or refresh.", type: 'error' }, false);
            return;
        }

        stopAnimation();
        streamingMessageIdRef.current = null;
        isStreamingCompleteRef.current = false;


        setLoadingState({ isLoading: true, step: 'sending', message: 'Sending...' });

        const newUserMessage: ChatMessageType = {
            id: generateMessageId(),
            message: trimmedMessage,
            isUser: true,
            type: 'text'
        };

        fullStreamedTextRef.current = ''; // Reset buffer for new message flow
        displayedTextLengthRef.current = 0; // Reset display length


        setChatMessages(prevMessages => [...prevMessages, newUserMessage]);

        console.log(`Emitting 'send_message' via socket hook (Streaming: ${isStreaming}, Language: ${language}).`); // Log language
        socketRef.current.emit('send_message', {
            userInput: trimmedMessage,
            isStreaming: isStreaming,
            language: language // <<< Send language to backend
        });
    }, [handleError, stopAnimation]); // Dependencies likely don't need language as it's just passed through


    // Return the state and controls
    return {
        chatMessages,
        loadingState,
        isConnected,
        sendMessage, // Return the updated function
        socketId
    };
}
