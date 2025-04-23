import { useCallback } from 'react';
import {
    StatusUpdate, ResultUpdate, ChatUpdate, ChatMessageType, LoadingState,
    ConfirmSendEmailAction, FrontendAction
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; // Adjust path
import { StreamingTextAnimationControls } from '../useStreamingTextAnimation'; // Assuming type export
import { generateMessageId, constructNavigationUrl, openUrlInNewTab } from '@/src/app/[locale]/chatbot/utils/chatUtils'; // Adjust path

// Define dependencies
export interface MessageHandlerDependencies {
    isMountedRef: React.RefObject<boolean>;
    setLoadingState: React.Dispatch<React.SetStateAction<LoadingState>>;
    animationControls: StreamingTextAnimationControls;
    setChatMessages: React.Dispatch<React.SetStateAction<ChatMessageType[]>>;
    setConfirmationData: React.Dispatch<React.SetStateAction<ConfirmSendEmailAction | null>>;
    setShowConfirmationDialog: React.Dispatch<React.SetStateAction<boolean>>;
    BASE_WEB_URL: string;
    currentLocale: string;
}

// Factory function
export function createMessageHandlers(deps: MessageHandlerDependencies) {
    const {
        isMountedRef, setLoadingState, animationControls, setChatMessages,
        setConfirmationData, setShowConfirmationDialog, BASE_WEB_URL, currentLocale
    } = deps;

    const handleStatusUpdate = useCallback((update: StatusUpdate) => {
        if (!isMountedRef.current) return;
        // console.log("[Handler] Event: Status Update", update); // Keep console logs minimal if preferred
        setLoadingState({ isLoading: true, step: update.step, message: update.message });
    }, [isMountedRef, setLoadingState]);

    const handlePartialResult = useCallback((update: ChatUpdate) => {
        if (!isMountedRef.current) return;

        if (!animationControls.isStreaming) {
            const newStreamingId = `streaming-${generateMessageId()}`;
            const newStreamingMessage: ChatMessageType = {
                id: newStreamingId, message: '', isUser: false, type: 'text', thoughts: [],
            };
            setChatMessages(prev => [...prev, newStreamingMessage]);
            setLoadingState(prev => ({ ...prev, isLoading: true, step: 'streaming_response', message: 'Receiving...' }));
            animationControls.startStreaming(newStreamingId);
        }
        animationControls.processChunk(update.textChunk);

    }, [isMountedRef, animationControls, setChatMessages, setLoadingState]);

    
    const handleResult = useCallback((result: ResultUpdate) => {
        if (!isMountedRef.current) return;
        console.log("[Handler] Socket Result Received:", result);

        animationControls.completeStream();
        setLoadingState({ isLoading: false, step: 'result_received', message: '' });

        const finalMessageId = generateMessageId();
        const streamingId = animationControls.currentStreamingId;

        const action = result.action as FrontendAction | undefined; // Type assertion for clarity
        const isNavigationAction = action?.type === 'navigate';
        const isMapAction = action?.type === 'openMap';
        const isConfirmEmailAction = action?.type === 'confirmEmailSend';

        const mapLocation = isMapAction ? action.location : undefined;
        const navigationUrl = isNavigationAction ? action.url : undefined;

        // --- SỬA LỖI Ở ĐÂY ---
        // Kiểu của confirmPayload phải là ConfirmSendEmailAction (hoặc undefined)
        let confirmPayload: ConfirmSendEmailAction | undefined = undefined;
         if (isConfirmEmailAction && action) { // Khi isConfirmEmailAction là true, TypeScript biết action có dạng { type: 'confirmEmailSend', payload: ... }
            // Do đó, action.payload chắc chắn tồn tại và có kiểu ConfirmSendEmailAction
            confirmPayload = action.payload;
         }
        // --- KẾT THÚC SỬA LỖI ---


        let finalMessageData: Partial<ChatMessageType> = {
            message: result.message || '',
            thoughts: result.thoughts,
            isUser: false,
        };

        // Determine message type based on action
        if (isMapAction && mapLocation) {
            finalMessageData.type = 'map';
            finalMessageData.location = mapLocation;
            finalMessageData.message = result.message || `Showing map for: ${mapLocation}`;
        } else if (isConfirmEmailAction) {
            finalMessageData.type = 'text'; // Keep as text, dialog handles interaction
            finalMessageData.message = result.message || 'Please confirm the action.';
        } else {
            finalMessageData.type = 'text';
            if (isNavigationAction && !result.message) {
                finalMessageData.message = `Okay, navigating...`;
            }
        }

        // Update Chat History State
        setChatMessages(prevMessages => {
            const messageExistsIndex = streamingId
                ? prevMessages.findIndex(msg => msg.id === streamingId)
                : -1;

            if (messageExistsIndex !== -1) {
                const updatedMessages = [...prevMessages];
                updatedMessages[messageExistsIndex] = {
                    ...prevMessages[messageExistsIndex],
                    ...finalMessageData,
                    id: finalMessageId, // Assign final ID
                    message: finalMessageData.message ?? '',
                    // Type đã được xác định ở trên, không cần ghi đè ở đây trừ khi cần thiết
                    // type: finalMessageData.type // Có thể thêm nếu cần đảm bảo
                };
                // Ensure no duplicate final IDs if streaming somehow failed
                if (updatedMessages.filter(msg => msg.id === finalMessageId).length > 1) {
                     console.warn(`[Handler] Duplicate final message ID detected (${finalMessageId}). Keeping first.`);
                     return updatedMessages.filter((msg, index) => msg.id !== finalMessageId || index === messageExistsIndex);
                }
                return updatedMessages;
            } else {
                console.warn("[Handler] No streaming placeholder found for ID:", streamingId, "Adding as new message.");
                const newMessage: ChatMessageType = {
                    id: finalMessageId,
                    isUser: false,
                    type: 'text', // Default, will be overridden by finalMessageData
                    ...finalMessageData,
                    message: finalMessageData.message ?? '',
                };
                // Prevent adding if somehow already exists (e.g., rapid events)
                if (!prevMessages.some(msg => msg.id === finalMessageId)) {
                    return [...prevMessages, newMessage];
                } else {
                    console.warn(`[Handler] Final message ID (${finalMessageId}) already exists. Suppressing duplicate add.`);
                    return prevMessages;
                }
            }
        });


        // --- Execute Frontend Action ---
        if (isNavigationAction && navigationUrl) {
            const finalUrl = constructNavigationUrl(BASE_WEB_URL, currentLocale, navigationUrl);
            openUrlInNewTab(finalUrl);
        } else if (isMapAction) {
            console.log(`[Handler] Map action received for location: ${mapLocation}.`);
            // Trigger map display if needed
        } else if (isConfirmEmailAction && confirmPayload) { // Kiểm tra confirmPayload đã được gán giá trị
            console.log(`[Handler] ConfirmEmailSend action received. ID: ${confirmPayload.confirmationId}`);
            // Trigger the confirmation dialog
            setConfirmationData(confirmPayload); // Truyền toàn bộ đối tượng payload - ĐÚNG!
            setShowConfirmationDialog(true);
        }

    }, [isMountedRef, animationControls, setLoadingState, setChatMessages, setConfirmationData, setShowConfirmationDialog, BASE_WEB_URL, currentLocale]);

    return {
        handleStatusUpdate,
        handlePartialResult,
        handleResult,
    };
}