// src/app/[locale]/chatbot/regularchat/ChatArea.tsx
import React, { useRef, useEffect, useCallback } from 'react';
import ChatHistory from './ChatHistory';
import ChatIntroductionDisplay from './ChatIntroduction';
import { ChatMessageType } from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import { LanguageCode } from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import { useMessageStore } from '@/src/app/[locale]/chatbot/stores/messageStore/messageStore';
// <<< NEW: Import FeedbackType
import { FeedbackType } from './feedback/FeedbackModal';

interface ChatAreaProps {
    messages: ChatMessageType[];
    showIntroduction: boolean;
    isSmallContext: boolean;
    languageCode: string;
    showConfirmationDialog: boolean;
    onSuggestionClick: (suggestion: string) => void;
    onConfirmEdit: (messageId: string, newText: string) => void;
    // <<< NEW PROP
    onOpenFeedbackModal: (messageId: string, type: FeedbackType) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
    messages,
    showIntroduction,
    isSmallContext,
    languageCode,
    showConfirmationDialog,
    onSuggestionClick,
    onConfirmEdit,
    // <<< NEW PROP
    onOpenFeedbackModal,
}) => {
    // ... (toàn bộ logic hooks và effects của bạn giữ nguyên, không cần thay đổi) ...
    const chatHistoryRef = useRef<HTMLDivElement>(null);
    const wasAtBottomRef = useRef(true);
    const observerRef = useRef<MutationObserver | null>(null);
    const lastMessageIdRef = useRef<string | null>(null);
    const isStreamingRef = useRef(false);

    const isLoading = useMessageStore(state => state.loadingState.isLoading);
    const loadingStep = useMessageStore(state => state.loadingState.step);
    const pendingBotMessageId = useMessageStore(state => state.pendingBotMessageId);

    useEffect(() => {
        const currentLastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
        isStreamingRef.current =
            isLoading &&
            (loadingStep === 'streaming_response' || loadingStep === 'updating_message') &&
            !!pendingBotMessageId &&
            currentLastMessage?.id === pendingBotMessageId &&
            !currentLastMessage?.isUser;
    }, [isLoading, loadingStep, pendingBotMessageId, messages]);


    const scrollToBottom = useCallback((force: boolean = false) => {
        const element = chatHistoryRef.current;
        if (element && (wasAtBottomRef.current || force || isStreamingRef.current)) {
            requestAnimationFrame(() => {
                if (chatHistoryRef.current) {
                    chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
                    if (isStreamingRef.current) {
                        wasAtBottomRef.current = true;
                    }
                }
            });
        }
    }, []);

    useEffect(() => {
        const element = chatHistoryRef.current;
        if (!element) return;

        const handleScroll = () => {
            if (!isStreamingRef.current) {
                const scrollThreshold = 20;
                const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + scrollThreshold;
                wasAtBottomRef.current = isAtBottom;
            }
        };

        handleScroll();
        element.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            if (element) {
                element.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    useEffect(() => {
        if (showConfirmationDialog || isStreamingRef.current) return;

        const currentLastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

        if (currentLastMessage && currentLastMessage.id !== lastMessageIdRef.current) {
            if (currentLastMessage.id !== pendingBotMessageId) {
                scrollToBottom(true);
            }
            lastMessageIdRef.current = currentLastMessage.id;
        } else if (messages.length === 0 && lastMessageIdRef.current !== null) {
            lastMessageIdRef.current = null;
        }

    }, [messages, showConfirmationDialog, scrollToBottom, pendingBotMessageId]);


    useEffect(() => {
        const element = chatHistoryRef.current;

        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }

        if (!element || showConfirmationDialog || !isStreamingRef.current) {
            return;
        }

        if (wasAtBottomRef.current) {
             scrollToBottom();
        }

        const observer = new MutationObserver((mutationsList) => {
            if ((wasAtBottomRef.current || isStreamingRef.current) && isStreamingRef.current) {
                const contentChanged = mutationsList.some(
                    (mutation) => mutation.type === 'characterData' || (mutation.type === 'childList' && mutation.addedNodes.length > 0)
                );
                if (contentChanged) {
                    scrollToBottom();
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
                    // <<< PASS THE PROP DOWN
                    onOpenFeedbackModal={onOpenFeedbackModal}
                />
            )}
        </div>
    );
};

export default ChatArea;