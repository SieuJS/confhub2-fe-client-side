// src/app/[locale]/chatbot/regularchat/ChatArea.tsx
import React, { useRef, useEffect, useCallback } from 'react';
import ChatHistory from './ChatHistory';
import ChatIntroductionDisplay from './ChatIntroduction';
import { ChatMessageType } from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import { LanguageCode } from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import { useMessageStore } from '@/src/app/[locale]/chatbot/stores/messageStore/messageStore'; // <<< THÊM LẠI

interface ChatAreaProps {
    messages: ChatMessageType[];
    showIntroduction: boolean;
    isSmallContext: boolean;
    languageCode: string;
    showConfirmationDialog: boolean;
    onSuggestionClick: (suggestion: string) => void;
    onConfirmEdit: (messageId: string, newText: string) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
    messages,
    showIntroduction,
    isSmallContext,
    languageCode,
    showConfirmationDialog,
    onSuggestionClick,
    onConfirmEdit,
}) => {
    const chatHistoryRef = useRef<HTMLDivElement>(null);
    const wasAtBottomRef = useRef(true);
    const observerRef = useRef<MutationObserver | null>(null);
    const lastMessageIdRef = useRef<string | null>(null);
    const isStreamingRef = useRef(false); // Ref để theo dõi trạng thái streaming

    // Lấy trạng thái loading từ messageStore để biết khi nào đang streaming
    const isLoading = useMessageStore(state => state.loadingState.isLoading);
    const loadingStep = useMessageStore(state => state.loadingState.step);
    const pendingBotMessageId = useMessageStore(state => state.pendingBotMessageId);

    useEffect(() => {
        // Cập nhật isStreamingRef dựa trên loadingState và pendingBotMessageId
        // Điều này quan trọng để biết khi nào thực sự có text đang được stream vào một tin nhắn cụ thể.
        const currentLastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
        isStreamingRef.current =
            isLoading &&
            (loadingStep === 'streaming_response' || loadingStep === 'updating_message') && // Có thể thêm các step khác nếu cần
            !!pendingBotMessageId &&
            currentLastMessage?.id === pendingBotMessageId &&
            !currentLastMessage?.isUser;
    }, [isLoading, loadingStep, pendingBotMessageId, messages]);


    const scrollToBottom = useCallback((force: boolean = false) => {
        const element = chatHistoryRef.current;
        if (element && (wasAtBottomRef.current || force || isStreamingRef.current /* <<< THÊM ĐIỀU KIỆN NÀY */)) {
            requestAnimationFrame(() => {
                if (chatHistoryRef.current) {
                    chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
                    // Sau khi cuộn do streaming, đảm bảo wasAtBottomRef là true
                    if (isStreamingRef.current) {
                        wasAtBottomRef.current = true;
                    }
                }
            });
        }
    }, []); // isStreamingRef.current sẽ được đọc giá trị mới nhất mỗi khi hàm được gọi

    // Effect để theo dõi vị trí cuộn và cập nhật wasAtBottomRef
    useEffect(() => {
        const element = chatHistoryRef.current;
        if (!element) return;

        const handleScroll = () => {
            // CHỈ cập nhật wasAtBottomRef nếu KHÔNG đang streaming.
            // Trong khi streaming, chúng ta muốn giữ wasAtBottomRef là true (nếu ban đầu là true)
            // để đảm bảo cuộn liên tục.
            if (!isStreamingRef.current) {
                const scrollThreshold = 20; // Tăng threshold một chút nữa
                const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + scrollThreshold;
                wasAtBottomRef.current = isAtBottom;
            }
        };

        handleScroll(); // Initial check
        element.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            if (element) {
                element.removeEventListener('scroll', handleScroll);
            }
        };
    }, []); // Dependencies rỗng để chỉ chạy một lần

    // Effect để cuộn khi có tin nhắn mới được thêm vào danh sách (không phải streaming update)
    useEffect(() => {
        if (showConfirmationDialog || isStreamingRef.current) return; // Không chạy nếu đang stream hoặc có dialog

        const currentLastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

        if (currentLastMessage && currentLastMessage.id !== lastMessageIdRef.current) {
            // Chỉ cuộn mạnh khi tin nhắn mới không phải là tin nhắn đang được stream
            if (currentLastMessage.id !== pendingBotMessageId) {
                scrollToBottom(true);
            }
            lastMessageIdRef.current = currentLastMessage.id;
        } else if (messages.length === 0 && lastMessageIdRef.current !== null) {
            lastMessageIdRef.current = null;
        }

    }, [messages, showConfirmationDialog, scrollToBottom, pendingBotMessageId]);


    // Effect để sử dụng MutationObserver cho việc cuộn trong khi stream
    useEffect(() => {
        const element = chatHistoryRef.current;

        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }

        if (!element || showConfirmationDialog || !isStreamingRef.current /* <<< CHỈ OBSERVE KHI ĐANG STREAMING */) {
            return;
        }

        // Khi bắt đầu observe (tức là bắt đầu streaming), nếu người dùng đang ở cuối,
        // đảm bảo cuộn một lần.
        if (wasAtBottomRef.current) {
             scrollToBottom();
        }

        const observer = new MutationObserver((mutationsList) => {
            // Chỉ cuộn nếu người dùng đang ở cuối (hoặc chúng ta đang ở giữa quá trình streaming và muốn tiếp tục cuộn)
            // và thực sự đang streaming.
            if ((wasAtBottomRef.current || isStreamingRef.current) && isStreamingRef.current) {
                const contentChanged = mutationsList.some(
                    (mutation) => mutation.type === 'characterData' || (mutation.type === 'childList' && mutation.addedNodes.length > 0)
                );
                if (contentChanged) {
                    scrollToBottom(); // Không force, để nó tôn trọng wasAtBottomRef nếu không streaming
                                      // nhưng vì có isStreamingRef.current trong scrollToBottom, nó sẽ vẫn cuộn
                }
            }
        });

        observer.observe(element, {
            childList: true,
            subtree: true,
            characterData: true,
        });
        observerRef.current = observer;

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
        };
    // Quan trọng: Thêm isStreamingRef.current vào dependencies của MutationObserver effect
    // để nó được thiết lập lại khi trạng thái streaming thay đổi.
    }, [showConfirmationDialog, scrollToBottom, isStreamingRef.current]);


    return (
        <div
            ref={chatHistoryRef}
            className='flex-grow space-y-3 overflow-y-auto p-3 md:p-4 dark:bg-gray-800'
            role="log"
            aria-live="polite"
        >
            {showIntroduction && (
                <ChatIntroductionDisplay
                    onSuggestionClick={onSuggestionClick}
                    language={languageCode as LanguageCode}
                />
            )}
            {(!showIntroduction || messages.length > 0) && (
                <ChatHistory
                    messages={messages}
                    isInsideSmallContainer={isSmallContext}
                    onConfirmEdit={onConfirmEdit}
                />
            )}
        </div>
    );
};

export default ChatArea;