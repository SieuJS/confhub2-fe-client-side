// src/hooks/useChatSocket.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import {
    StatusUpdate, ResultUpdate, ErrorUpdate, ThoughtStep, ChatMessageType, LoadingState, ChatUpdate
} from '@/src/models/chatbot/chatbot'; // Adjust path if needed

// --- Interfaces (Giữ nguyên) ---
export interface UseChatSocketProps {
    socketUrl: string;
    onConnectionChange?: (isConnected: boolean) => void;
    onInitialConnectionError?: (error: Error) => void;
}

export interface ChatSocketControls {
    chatMessages: ChatMessageType[];
    loadingState: LoadingState;
    isConnected: boolean;
    sendMessage: (userInput: string, isStreaming: boolean) => void;
    socketId: string | null;
}

const generateMessageId = () => `msg-${Date.now()}-${Math.random()}`;

// --- Constants for Animation ---
const ANIMATION_INTERVAL_MS = 20; // Tần suất cập nhật animation (ms) - thử nghiệm giá trị này
const MIN_CHARS_PER_INTERVAL = 1; // Số ký tự tối thiểu thêm mỗi lần cập nhật
const MAX_CHARS_PER_INTERVAL = 3; // Số ký tự tối đa thêm mỗi lần cập nhật (để bắt kịp nếu server gửi nhanh)


export function useChatSocket({
    socketUrl,
    onConnectionChange,
    onInitialConnectionError
}: UseChatSocketProps): ChatSocketControls {
    const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
    const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: false, step: '', message: '' });
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [socketId, setSocketId] = useState<string | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const isMountedRef = useRef(true);
    const loadingStateRef = useRef(loadingState); // Vẫn hữu ích để đọc state hiện tại trong callback

    // --- Refs cho Streaming Animation ---
    const streamingMessageIdRef = useRef<string | null>(null);   // ID của tin nhắn đang được stream
    const fullStreamedTextRef = useRef<string>('');        // Toàn bộ text đã nhận từ server cho tin nhắn hiện tại
    const displayedTextLengthRef = useRef<number>(0);       // Độ dài text đã hiển thị trên UI
    const animationTimerRef = useRef<NodeJS.Timeout | null>(null); // Lưu ID của setTimeout
    const isStreamingCompleteRef = useRef<boolean>(false); // Cờ báo hiệu server đã gửi 'chat_result' chưa

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
            // Nếu component unmounted, không còn stream, hoặc animation đã bị dừng -> thoát
            return;
        }

        const targetLength = fullStreamedTextRef.current.length;
        const currentLength = displayedTextLengthRef.current;
        const streamingId = streamingMessageIdRef.current; // Lấy ID một lần

        if (currentLength < targetLength) {
            // Tính toán số ký tự cần thêm trong lần này
            const remainingChars = targetLength - currentLength;
            // Tăng tốc độ nếu bị chậm nhiều
            const charsToAddFactor = Math.max(1, Math.floor(remainingChars / 10)); // Ví dụ: tăng tốc nếu còn > 10 chars
            const charsToAdd = Math.min(
                remainingChars,
                Math.max(MIN_CHARS_PER_INTERVAL, Math.min(MAX_CHARS_PER_INTERVAL, charsToAddFactor))
            );

            const newLength = currentLength + charsToAdd;
            const textToDisplay = fullStreamedTextRef.current.substring(0, newLength);
            displayedTextLengthRef.current = newLength;

            // Cập nhật state React
            setChatMessages(prev =>
                prev.map(msg =>
                    msg.id === streamingId
                        ? { ...msg, message: textToDisplay }
                        : msg
                )
            );

            // Lên lịch cho frame tiếp theo
            animationTimerRef.current = setTimeout(animateText, ANIMATION_INTERVAL_MS);

        } else if (!isStreamingCompleteRef.current) {
            // Đã hiển thị hết text hiện có, nhưng server chưa báo xong -> chờ chunk tiếp theo
            animationTimerRef.current = setTimeout(animateText, ANIMATION_INTERVAL_MS * 2); // Chờ lâu hơn một chút
        } else {
            // Đã hiển thị hết VÀ server đã báo xong -> Dừng animation tự nhiên
            stopAnimation();
            console.log("Animation completed naturally for:", streamingId);
            // Có thể không cần làm gì thêm ở đây vì handleResult sẽ xử lý state cuối cùng
        }
    }, [stopAnimation]); // Thêm stopAnimation

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

    // --- Xử lý khi nhận kết quả cuối cùng ---
    const handleResult = useCallback((result: ResultUpdate) => {
        if (!isMountedRef.current) return;
        console.log("Socket Result (Full):", result);

        isStreamingCompleteRef.current = true; // Đặt cờ báo hiệu server đã gửi xong

        // Không dừng animation ngay lập tức ở đây, để cho animateText tự hoàn thành
        // stopAnimation(); // <<<< Bỏ dòng này

        const finalStreamingId = streamingMessageIdRef.current; // Lấy ID trước khi reset
        const finalFullText = fullStreamedTextRef.current; // Lấy text cuối cùng từ buffer

        // Reset trạng thái streaming cho lần sau
        streamingMessageIdRef.current = null;
        fullStreamedTextRef.current = '';
        displayedTextLengthRef.current = 0;

        // Đợi một chút để animation có thể hoàn thành frame cuối cùng (tùy chọn, có thể không cần)
        // setTimeout(() => {
        // if (!isMountedRef.current) return;

        setChatMessages(prev => {
            // Cập nhật tin nhắn cuối cùng với nội dung đầy đủ từ result
            // và đổi ID để nó không còn là 'streaming-' nữa
            return prev.map(msg => {
                if (msg.id === finalStreamingId) {
                    // Đảm bảo hiển thị nội dung cuối cùng từ result, có thể khác 1 chút so với stream
                    return {
                        ...msg,
                        id: generateMessageId(), // ID mới, ổn định
                        message: result.message, // Dùng message từ result là chuẩn nhất
                        thoughts: result.thoughts // Cập nhật thoughts
                    };
                }
                return msg;
            });

            /* --- Cách khác: Xóa placeholder và thêm mới ---
            const historyWithoutStreaming = prev.filter(msg => msg.id !== finalStreamingId);
            const finalBotMessage: ChatMessageType = {
                id: generateMessageId(),
                message: result.message,
                isUser: false,
                type: 'text',
                thoughts: result.thoughts
            };
            return [...historyWithoutStreaming, finalBotMessage];
            */
        });

        setLoadingState({ isLoading: false, step: 'result_received', message: '' });
        // }, ANIMATION_INTERVAL_MS * 2); // Đợi gấp đôi interval animation

    }, [/* stopAnimation không còn ở đây */]); // Dependencies có thể không cần thay đổi

    // --- Socket Connection Effect ---
    useEffect(() => {
        console.log("Attempting to establish Socket.IO connection...");
        // ... (Phần khởi tạo socket và gán listener như cũ) ...
        const newSocket = io(socketUrl, { reconnectionAttempts: 5, reconnectionDelay: 1000, reconnectionDelayMax: 5000 });
        socketRef.current = newSocket;
        newSocket.on('connect', handleConnect);
        newSocket.on('disconnect', handleDisconnect);
        newSocket.on('connect_error', handleConnectError);
        newSocket.on('status_update', handleStatusUpdate);
        newSocket.on('chat_update', handlePartialResult); // Dùng handlePartialResult đã cập nhật
        newSocket.on('chat_result', handleResult);       // Dùng handleResult đã cập nhật
        newSocket.on('chat_error', (errorData: any) => handleError(errorData, true));


        return () => {
            console.log("Cleaning up socket connection effect...");
            // ... (Remove listeners như cũ) ...
            newSocket.off('connect', handleConnect);
            newSocket.off('disconnect', handleDisconnect);
            newSocket.off('connect_error', handleConnectError);
            newSocket.off('status_update', handleStatusUpdate);
            newSocket.off('chat_update', handlePartialResult);
            newSocket.off('chat_result', handleResult);
            newSocket.off('chat_error');

            // --- Cleanup Animation ---
            stopAnimation(); // Quan trọng: Dừng animation khi unmount hoặc reconnect
            streamingMessageIdRef.current = null;
            fullStreamedTextRef.current = '';
            displayedTextLengthRef.current = 0;
            isStreamingCompleteRef.current = false;


            if (newSocket.connected) {
                console.log(`Disconnecting socket ${newSocket.id} during cleanup.`);
                newSocket.disconnect();
            }
            socketRef.current = null;
            if (isMountedRef.current) {
                setIsConnected(false);
                setSocketId(null);
            }
            console.log("Socket listeners removed.");
        };
        // Các dependencies cần bao gồm cả các handler mới
    }, [socketUrl, handleConnect, handleDisconnect, handleConnectError, handleStatusUpdate, handlePartialResult, handleResult, handleError, animateText, stopAnimation]);

    // --- Send Chat Message Function (Giữ nguyên) ---
    const sendMessage = useCallback((userInput: string, isStreaming: boolean) => {
        const trimmedMessage = userInput.trim();
        if (!trimmedMessage) return;

        if (!socketRef.current || !socketRef.current.connected) {
            handleError({ message: "Cannot send message: Not connected. Please wait or refresh.", type: 'error' }, false);
            return;
        }
        // Dừng animation của response trước đó (nếu có) trước khi gửi tin nhắn mới
        stopAnimation();
        streamingMessageIdRef.current = null; // Reset trạng thái stream cũ
        isStreamingCompleteRef.current = false;

        setLoadingState({ isLoading: true, step: 'sending', message: 'Sending...' });

        const newUserMessage: ChatMessageType = {
            id: generateMessageId(),
            message: trimmedMessage,
            isUser: true,
            type: 'text'
        };
        // Thêm tin nhắn người dùng vào ĐẦU buffer xử lý animation tiếp theo
        fullStreamedTextRef.current = '';
        displayedTextLengthRef.current = 0;

        setChatMessages(prevMessages => [...prevMessages, newUserMessage]);

        console.log(`Emitting 'send_message' via socket hook (Streaming: ${isStreaming}).`);
        socketRef.current.emit('send_message', {
            userInput: trimmedMessage,
            isStreaming: isStreaming
        });
    }, [handleError, stopAnimation]); // Thêm stopAnimation


    // Return the state and controls
    return {
        chatMessages,
        loadingState,
        isConnected,
        sendMessage,
        socketId
    };
}