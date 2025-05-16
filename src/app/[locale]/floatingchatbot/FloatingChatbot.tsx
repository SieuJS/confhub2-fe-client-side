// src/app/[locale]/floatingchatbot/FloatingChatbot.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { X, Settings } from 'lucide-react' // MessageCircle không còn dùng ở đây
import RegularChat from '../chatbot/regularchat/RegularChat'
import FloatingChatbotSettings from './FloatingChatbotSettings'
import {
  useSettingsStore,
  useMessageStore,
  useConversationStore,
  useUiStore // Import useUiStore
} from '@/src/app/[locale]/chatbot/stores'
import { useTranslations } from 'next-intl'
import { useAppInitialization } from '@/src/hooks/regularchat/useAppInitialization'
import dynamic from 'next/dynamic'
import ChatbotErrorDisplay from '../chatbot/ChatbotErrorDisplay' // Import ChatbotErrorDisplay

const DynamicAnimatedIcon = dynamic(() => import('../utils/AnimatedIcon'), {
  ssr: false,
  loading: () => (
    <div className='flex h-14 w-14 items-center justify-center rounded-full bg-blue-600'>
      {/* Placeholder tĩnh hoặc spinner nhỏ */}
    </div>
  )
})

const FloatingChatbot: React.FC = () => {
  const t = useTranslations('')
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const setChatMode = useSettingsStore(state => state.setChatMode)
  const currentStoreChatMode = useSettingsStore(state => state.chatMode)
  const resetChatUIForNewConversation = useMessageStore(
    state => state.resetChatUIForNewConversation
  )
  const setActiveConversationId = useConversationStore(
    state => state.setActiveConversationId
  )
  const activeConversationId = useConversationStore(
    state => state.activeConversationId
  )
  // Lắng nghe UiStore để biết khi nào có lỗi và cần hiển thị ChatbotErrorDisplay
  const hasFatalError = useUiStore(state => state.hasFatalError);
  const fatalErrorCode = useUiStore(state => state.fatalErrorCode); // Lấy thêm mã lỗi

  useAppInitialization(); // Hook này chỉ nên chạy một lần, không phụ thuộc vào isChatOpen

  const toggleChatbot = useCallback(() => {
    setIsChatOpen(prevIsChatOpen => {
      const newIsChatOpen = !prevIsChatOpen;
      if (newIsChatOpen) {
        if (currentStoreChatMode !== 'regular') {
          setChatMode('regular');
        }
        // Reset conversation và UI chỉ khi mở chat *từ trạng thái đóng*
        // và không phải chỉ là đóng/mở settings.
        if (!prevIsChatOpen) { // Chỉ reset nếu trước đó chat đang đóng
          if (activeConversationId !== null) {
            setActiveConversationId(null);
          }
          resetChatUIForNewConversation(true);
        }
        setIsSettingsOpen(false);
      } else {
        setIsSettingsOpen(false); // Luôn đóng settings khi đóng chat
      }
      return newIsChatOpen;
    });
  }, [
    currentStoreChatMode, setChatMode,
    resetChatUIForNewConversation, setActiveConversationId, activeConversationId
  ]);

  const toggleSettingsPanel = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsSettingsOpen(prev => !prev);
  }, []);

  // useEffect này để đảm bảo chatMode là 'regular' khi chat mở.
  // Nó có thể không cần thiết nếu logic trong toggleChatbot đã đủ.
  useEffect(() => {
    if (isChatOpen && currentStoreChatMode !== 'regular') {
      console.log("[FloatingChatbot] Effect: Chat is open and mode is not regular. Setting to regular.");
      setChatMode('regular');
    }
  }, [isChatOpen, currentStoreChatMode, setChatMode]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else if (isChatOpen) {
          // Khi đóng bằng Escape, logic trong toggleChatbot sẽ không chạy
          // nên cần set isChatOpen trực tiếp và đảm bảo settings cũng đóng
          setIsChatOpen(false);
          setIsSettingsOpen(false);
        }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isChatOpen, isSettingsOpen]); // Thêm setIsChatOpen vào deps nếu bạn muốn clean hơn, nhưng nó sẽ không thay đổi


  // Điều kiện để render ChatbotErrorDisplay trong floating chat
  // Nó chỉ nên hiển thị nếu chat đang mở VÀ có lỗi nghiêm trọng
  const shouldShowErrorDisplayInFloatingChat = isChatOpen && hasFatalError;

  // Xác định xem lỗi có phải là lỗi nghiêm trọng cản trở việc chat không
  // Ví dụ: Lỗi xác thực sẽ cản trở, lỗi kết nối cũng vậy.
  // Lỗi không nghiêm trọng (warning) có thể không cần disable input.
  const getIsAuthRelatedOrConnectionError = useCallback((code: string | null): boolean => {
    if (!code) return false;
    const criticalErrorCodes = [
      'AUTH_REQUIRED', 'ACCESS_DENIED', 'TOKEN_EXPIRED',
      'AUTH_CONNECTION_ERROR', 'AUTH_HANDSHAKE_FAILED',
      'CONNECTION_FAILED', 'FATAL_SERVER_ERROR' // Coi lỗi server là nghiêm trọng
    ];
    return criticalErrorCodes.includes(code);
  }, []);

  const isChatInputDisabled = isChatOpen && hasFatalError && getIsAuthRelatedOrConnectionError(fatalErrorCode);


  return (
    <>
      {!isChatOpen && (
        <button
          onClick={toggleChatbot}
          className='fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform duration-150 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75'
          aria-label={t('Open_Chat')}
          title={t('Open_Chat')}
        >
          <DynamicAnimatedIcon className='h-24 w-24' loopOnHover={true} />
        </button>
      )}

      {isChatOpen && (
        <div className='animate-slide-up-fade fixed bottom-5 right-5 z-50 flex h-[calc(100vh-6rem)] max-h-[600px] w-[90vw] max-w-md flex-col rounded-xl bg-white shadow-2xl dark:bg-gray-800 md:bottom-8 md:right-8 md:h-[calc(100vh-8rem)] md:max-h-[700px] md:max-w-lg dark:border dark:border-gray-700'>
          {/* ChatbotErrorDisplay được render có điều kiện bên trong container chính */}
          {/* Nó sẽ tự style dựa trên isFloatingContext={true} */}
          {shouldShowErrorDisplayInFloatingChat && <ChatbotErrorDisplay isFloatingContext={true} />}

          {/* Header của chatbot - KHÔNG còn bị làm mờ bởi shouldShowErrorDisplayInFloatingChat ở đây */}
          <div className={`flex items-center justify-between rounded-t-xl bg-blue-600 px-4 py-3 text-white dark:bg-blue-700`}>
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
              onClick={toggleChatbot}
              className='rounded-full p-1.5 text-gray-200 hover:bg-blue-700 hover:text-white focus:outline-none dark:hover:bg-blue-800'
              aria-label={t('Close_Chat')}
            >
              <X size={22} />
            </button>
          </div>

          <div className={`relative flex-1 overflow-hidden`}>
            <div
              className={`h-full w-full transition-opacity duration-200 ${isSettingsOpen ? 'pointer-events-none opacity-30' : 'opacity-100'}`}
            >
              <RegularChat
                isSmallContext={true}
                // isDisabledDueToError={isChatInputDisabled} // <<<< TRUYỀN PROP MỚI
              />
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
  )
}

export default FloatingChatbot