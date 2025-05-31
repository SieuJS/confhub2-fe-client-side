// src/app/[locale]/floatingchatbot/FloatingChatbot.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { X, Settings } from 'lucide-react'
import RegularChat from '../chatbot/regularchat/RegularChat'
import FloatingChatbotSettings from './FloatingChatbotSettings'
import {
  useSettingsStore,
  useMessageStore,
  useConversationStore,
  useUiStore
} from '@/src/app/[locale]/chatbot/stores'
import { usePageContextStore } from '@/src/app/[locale]/chatbot/stores/pageContextStore'; // <<< IMPORT MỚI
import { useTranslations } from 'next-intl'
import { useAppInitialization } from '@/src/hooks/regularchat/useAppInitialization'
import dynamic from 'next/dynamic'
import ChatbotErrorDisplay from '../chatbot/ChatbotErrorDisplay'
import { usePathname } from '@/src/navigation'; // <<< IMPORT usePathname
import { MAIN_CHATBOT_PAGE_PATH } from '@/src/app/[locale]/chatbot/lib/constants'; // <<< TẠO FILE NÀY

const DynamicAnimatedIcon = dynamic(() => import('../utils/AnimatedIcon'), {
  ssr: false,
  loading: () => (
    <div className='flex h-14 w-14 items-center justify-center rounded-full bg-blue-400'>
    </div>
  )
})

// Helper để lấy text, có thể giới hạn độ dài
const getCurrentPageTextContent = (maxLength: number = 20000): string | null => {
  if (typeof window !== 'undefined' && document?.body?.innerText) {
    const text = document.body.innerText;
    return text.length > maxLength ? text.substring(0, maxLength) + "\n[...content truncated]" : text;
  }
  return null;
};

const FloatingChatbot: React.FC = () => {
  const t = useTranslations('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const setChatMode = useSettingsStore(state => state.setChatMode);
  const currentStoreChatMode = useSettingsStore(state => state.chatMode);
  const resetChatUIForNewConversation = useMessageStore(
    state => state.resetChatUIForNewConversation
  );
  const setActiveConversationId = useConversationStore(
    state => state.setActiveConversationId
  );
  const activeConversationId = useConversationStore(
    state => state.activeConversationId
  );
  const hasFatalError = useUiStore(state => state.hasFatalError);
  const fatalErrorCode = useUiStore(state => state.fatalErrorCode);

  const { setPageContext, clearPageContext } = usePageContextStore.getState(); // <<< LẤY ACTIONS
  const pathname = usePathname(); // <<< LẤY PATHNAME HIỆN TẠI

  useAppInitialization();

  const toggleChatbot = useCallback(() => {
    setIsChatOpen(prevIsChatOpen => {
      const newIsChatOpen = !prevIsChatOpen;
      if (newIsChatOpen) {
        // Logic cho context trang hiện tại
        const isMainChatPage = pathname === MAIN_CHATBOT_PAGE_PATH; // So sánh với path của trang chatbot chính
        if (!isMainChatPage) {
          const pageText = getCurrentPageTextContent();
          setPageContext(pageText, true);
        } else {
          setPageContext(null, false); // Vô hiệu hóa tính năng trên trang chatbot chính
        }

        if (currentStoreChatMode !== 'regular') {
          setChatMode('regular');
        }
        if (!prevIsChatOpen) {
          if (activeConversationId !== null) {
            setActiveConversationId(null);
          }
          resetChatUIForNewConversation(true);
        }
        setIsSettingsOpen(false);
      } else {
        setIsSettingsOpen(false);
        clearPageContext(); // Xóa context khi đóng chatbot
      }
      return newIsChatOpen;
    });
  }, [
    currentStoreChatMode,
    setChatMode,
    resetChatUIForNewConversation,
    setActiveConversationId,
    activeConversationId,
    pathname, // <<< THÊM PATHNAME VÀO DEPENDENCIES
    setPageContext,
    clearPageContext
  ]);

  const toggleSettingsPanel = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsSettingsOpen(prev => !prev);
  }, []);

  useEffect(() => {
    if (isChatOpen && currentStoreChatMode !== 'regular') {
      setChatMode('regular');
    }
  }, [isChatOpen, currentStoreChatMode, setChatMode]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else if (isChatOpen) {
          setIsChatOpen(false);
          setIsSettingsOpen(false);
          clearPageContext(); // Xóa context khi đóng bằng Escape
        }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isChatOpen, isSettingsOpen, clearPageContext]); // Thêm clearPageContext

  const shouldShowErrorDisplayInFloatingChat = isChatOpen && hasFatalError;

  const getIsAuthRelatedOrConnectionError = useCallback(
    (code: string | null): boolean => {
      if (!code) return false;
      const criticalErrorCodes = [
        'AUTH_REQUIRED', 'ACCESS_DENIED', 'TOKEN_EXPIRED',
        'AUTH_CONNECTION_ERROR', 'AUTH_HANDSHAKE_FAILED',
        'CONNECTION_FAILED', 'FATAL_SERVER_ERROR'
      ];
      return criticalErrorCodes.includes(code);
    },
    []
  );

  // isChatInputDisabled không cần thay đổi

  return (
    <>
      {!isChatOpen && (
        <button
          onClick={toggleChatbot}
          className='fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-blue-400 text-white shadow-lg transition-transform duration-150 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75'
          aria-label={t('Open_Chat')}
          title={t('Open_Chat')}
        >
          <DynamicAnimatedIcon className='h-24 w-24' loopOnHover={true} />
        </button>
      )}

      {isChatOpen && (
        <div className='animate-slide-up-fade fixed bottom-5 right-5 z-50 flex h-[calc(100vh-6rem)] max-h-[600px] w-[90vw] max-w-md flex-col rounded-xl bg-white-pure shadow-2xl dark:border dark:border-gray-700  md:bottom-8 md:right-8 md:h-[calc(100vh-8rem)] md:max-h-[700px] md:max-w-lg'>
          {shouldShowErrorDisplayInFloatingChat && (
            <ChatbotErrorDisplay isFloatingContext={true} />
          )}
          <div
            className={`flex items-center justify-between rounded-t-xl bg-button px-4 py-3 text-button-text`}
          >
            <div className='flex items-center space-x-3'>
              <button
                onClick={toggleSettingsPanel}
                className='rounded-full p-1.5 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-white dark:hover:bg-blue-800'
                aria-label={isSettingsOpen ? t('Close_Chat_Settings') : t('Open_Chat_Settings')}
                title={isSettingsOpen ? t('Close_Chat_Settings') : t('Open_Chat_Settings')}
                aria-expanded={isSettingsOpen}
              >
                <Settings size={20} />
              </button>
              <h3 className='text-lg font-semibold'>{t('Chat_With_Us')}</h3>
            </div>
            <button
              onClick={toggleChatbot} // toggleChatbot đã bao gồm clearPageContext
              className='rounded-full p-1.5  hover:bg-blue-700 hover:text-white focus:outline-none dark:hover:bg-blue-800'
              aria-label={t('Close_Chat')}
            >
              <X size={22} />
            </button>
          </div>

          <div className={`relative flex-1 overflow-hidden`}>
            <div
              className={`h-full w-full transition-opacity duration-200 ${isSettingsOpen ? 'pointer-events-none opacity-30' : 'opacity-100'}`}
            >
              <RegularChat isSmallContext={true} />
            </div>
            {isSettingsOpen && (
              <FloatingChatbotSettings
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;