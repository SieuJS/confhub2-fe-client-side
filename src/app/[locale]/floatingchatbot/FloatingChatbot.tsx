// src/app/[locale]/floatingchatbot/FloatingChatbot.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, X, Settings } from 'lucide-react';
import RegularChat from '../chatbot/regularchat/RegularChat'; // Đường dẫn đến RegularChat.tsx của bạn
import FloatingChatbotSettings from './FloatingChatbotSettings';
import { useSettingsStore, useMessageStore, useConversationStore } from '@/src/app/[locale]/chatbot/stores';
import { useTranslations } from 'next-intl';
import { useAppInitialization } from '@/src/hooks/chatbot/useAppInitialization';

const FloatingChatbot: React.FC = () => {
  const t = useTranslations('Chatbot');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const setChatMode = useSettingsStore(state => state.setChatMode);
  const currentStoreChatMode = useSettingsStore(state => state.chatMode);
  const resetChatUIForNewConversation = useMessageStore(state => state.resetChatUIForNewConversation);
  const setActiveConversationId = useConversationStore(state => state.setActiveConversationId);
  const activeConversationId = useConversationStore(state => state.activeConversationId);

  useAppInitialization();

  const toggleChatbot = useCallback(() => {
    setIsChatOpen(prev => {
      const newIsChatOpen = !prev;
      if (newIsChatOpen) {
        if (currentStoreChatMode !== 'regular') {
          setChatMode('regular');
        }
        if (activeConversationId !== null) {
          setActiveConversationId(null);
        }
        resetChatUIForNewConversation(true);
        setIsSettingsOpen(false); // Luôn đóng settings khi mở/đóng chat chính
      } else {
        // Nếu đóng chatbot chính, cũng đóng luôn settings
        setIsSettingsOpen(false);
      }
      return newIsChatOpen;
    });
  }, [currentStoreChatMode, setChatMode, resetChatUIForNewConversation, setActiveConversationId, activeConversationId]);

  const toggleSettingsPanel = useCallback((e?: React.MouseEvent) => {
    // Ngăn chặn sự kiện click lan ra toggleChatbot nếu nút settings nằm trong khu vực có thể click để đóng chat
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
        }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isChatOpen, isSettingsOpen]);

  return (
    <>
      {/* Nút mở chatbot chính (khi chatbot đang đóng) */}
      {!isChatOpen && (
        <button
          onClick={toggleChatbot}
          className="fixed bottom-5 right-5 z-[999] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform duration-150 ease-in-out hover:scale-110"
          aria-label={t('Open_Chat')}
          title={t('Open_Chat')}
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Khung chatbot chính (khi chatbot đang mở) */}
      {isChatOpen && (
        // CSS cho khung chatbot chính giữ nguyên như trước
        <div className="fixed bottom-5 right-5 z-[1000] flex h-[calc(100vh-10rem)] max-h-[600px] w-[90vw] max-w-md flex-col rounded-lg bg-white shadow-xl md:bottom-8 md:right-8 md:h-[550px] animate-slide-up-fade">
          {/* Header của chatbot */}
          <div className="flex items-center justify-between rounded-t-lg bg-blue-600 px-4 py-3 text-white">
            {/* Nhóm tiêu đề và nút settings */}
            <div className="flex items-center space-x-3"> {/* Tăng space-x một chút nếu cần */}
              <button
                onClick={toggleSettingsPanel}
                className="rounded-full p-1 text-gray-200 hover:bg-blue-700 hover:text-white focus:outline-none focus:ring-1 focus:ring-white"
                aria-label={isSettingsOpen ? t('Close_Chat_Settings') : t('Open_Chat_Settings')}
                title={isSettingsOpen ? t('Close_Chat_Settings') : t('Open_Chat_Settings')}
                aria-expanded={isSettingsOpen}
              >
                <Settings size={20} />
              </button>
              <h3 className="text-lg font-semibold">{t('Chat_With_Us')}</h3>

            </div>
            {/* Nút đóng chatbot chính */}
            <button
              onClick={toggleChatbot}
              className="text-gray-200 hover:text-white focus:outline-none"
              aria-label={t('Close_Chat')}
            >
              <X size={24} />
            </button>
          </div>

          {/* Vùng nội dung của chatbot (chứa RegularChat và Settings Panel) */}
          {/* Thêm `relative` để FloatingChatbotSettings có thể định vị `absolute` bên trong nó */}
          <div className="relative flex-grow overflow-hidden">
            {/* RegularChat sẽ luôn được render */}
            {/* Áp dụng hiệu ứng làm mờ và vô hiệu hóa tương tác khi settings mở */}
            <div className={`h-full w-full transition-opacity duration-200 ${isSettingsOpen ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              <RegularChat isSmallContext={true} /> {/* <-- TRUYỀN isSmallContext */}
            </div>

            {/* FloatingChatbotSettings sẽ nổi lên trên khi isSettingsOpen là true */}
            {/* Component này đã có `absolute inset-0` nên sẽ chiếm toàn bộ vùng div cha này */}
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