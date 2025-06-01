// src/app/[locale]/floatingchatbot/FloatingChatbot.tsx
'use client'

import React, {
  useState,
  useEffect,
  useCallback
} from 'react'
import { X, Settings, Minus, MessageSquare } from 'lucide-react';
import RegularChat from '../chatbot/regularchat/RegularChat'
import FloatingChatbotSettings from './FloatingChatbotSettings'
import {
  useSettingsStore,
  useMessageStore,
  useConversationStore,
  useUiStore
} from '@/src/app/[locale]/chatbot/stores'
import { usePageContextStore } from '@/src/app/[locale]/chatbot/stores/pageContextStore'
import { useTranslations } from 'next-intl'
import { useAppInitialization } from '@/src/hooks/regularchat/useAppInitialization'
import ChatbotErrorDisplay from '../chatbot/ChatbotErrorDisplay'
import { usePathname, pathnames as appPathnames } from '@/src/navigation' // Giữ nguyên cách import usePathname
import { MAIN_CHATBOT_PAGE_PATH } from '@/src/app/[locale]/chatbot/lib/constants'

import Draggable from 'react-draggable';
import { Resizable } from 're-resizable';
import { useFloatingWindowControls } from '@/src/hooks/floatingChatbot/useFloatingWindowControls';

const FLOATING_CHATBOT_WRAPPER_ID = 'floating-chatbot-wrapper-for-text-extraction';


const getCurrentPageTextContent = (
  maxLength: number = 50000
): string | null => {
  if (typeof window !== 'undefined' && document?.body?.innerText) {
    const chatbotWrapper = document.getElementById(FLOATING_CHATBOT_WRAPPER_ID);
    let originalDisplay = '';

    if (chatbotWrapper) {
      originalDisplay = chatbotWrapper.style.display;
      chatbotWrapper.style.display = 'none';
    }

    let text = document.body.innerText;

    if (chatbotWrapper) {
      chatbotWrapper.style.display = originalDisplay;
    }
    text = text.replace(/\s\s+/g, ' ').replace(/\n\n+/g, '\n').trim();
    return text.length > maxLength
      ? text.substring(0, maxLength) + '\n[...content truncated]'
      : text;
  }
  return null;
}

const getCurrentPageUrl = (): string | null => {
  if (typeof window !== 'undefined') {
    return window.location.href;
  }
  return null;
}

const MIN_WIDTH = 320
const MIN_HEIGHT = 400
const DEFAULT_WIDTH = 384
const DEFAULT_HEIGHT = 600
const MAX_WIDTH_PERCENTAGE = 0.9
const MAX_HEIGHT_PERCENTAGE = 0.85
const OPEN_ANIMATION_DURATION = 300;

const FLOATING_ICON_Z_INDEX = 2147483640;
const CHATBOT_WINDOW_Z_INDEX = 2147483645;

const CHATBOT_FULL_PAGE_PATHS_TO_HIDE_FLOATING: (keyof typeof appPathnames)[] = [
  '/chatbot/regularchat',
  '/chatbot/livechat',
  '/chatbot/history',
];


const FloatingChatbot: React.FC = () => {
  const t = useTranslations('')
  const currentPathnameFromHook = usePathname(); // Lấy pathname ở cấp cao nhất của component

  const shouldRenderFloatingChatbot = !CHATBOT_FULL_PAGE_PATHS_TO_HIDE_FLOATING.includes(currentPathnameFromHook as keyof typeof appPathnames);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [runOpenAnimation, setRunOpenAnimation] = useState(false);

  const isChatOpen = useUiStore(state => state.isFloatingChatOpen);
  const setIsChatOpen = useUiStore(state => state.setIsFloatingChatOpen);

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
  const hasFatalErrorGlobal = useUiStore(state => state.hasFatalError)

  const { setPageContext, clearPageContext } = usePageContextStore();

  useAppInitialization()

  const {
    position,
    size,
    bounds,
    draggableWrapperRef,
    dragHandlers,
    resizeHandlers,
    currentMaxWidth,
    currentMaxHeight,
    adjustPositionToFitScreen,
    setPosition: setHookPosition,
    setSize: setHookSize,
  } = useFloatingWindowControls({
    initialWidth: DEFAULT_WIDTH,
    initialHeight: DEFAULT_HEIGHT,
    minConstraints: { width: MIN_WIDTH, height: MIN_HEIGHT },
    maxConstraintsPercentage: { width: MAX_WIDTH_PERCENTAGE, height: MAX_HEIGHT_PERCENTAGE },
    localStorageKeys: { position: 'chatbotPosition', size: 'chatbotSize' },
    isEnabled: isChatOpen && shouldRenderFloatingChatbot,
  });

  useEffect(() => {
    if (!shouldRenderFloatingChatbot && isChatOpen) {
      setIsChatOpen(false);
    }
  }, [shouldRenderFloatingChatbot, isChatOpen, setIsChatOpen]);


  const MIN_REASONABLE_TEXT_LENGTH = 500;
  const MAX_CONTEXT_FETCH_ATTEMPTS = 10;
  const CONTEXT_FETCH_RETRY_DELAY = 500;

  useEffect(() => {
    console.log(
      '[FloatingChatbot] Page context useEffect triggered. Pathname from hook:', currentPathnameFromHook,
      'isChatOpen:', isChatOpen,
      'shouldRender:', shouldRenderFloatingChatbot
    );

    let attemptCount = 0;
    let animationFrameId: number | null = null;
    let retryTimerId: NodeJS.Timeout | null = null;

    const fetchPageContext = (currentPath: string) => { // << Nhận currentPath làm tham số
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (retryTimerId) clearTimeout(retryTimerId);

      animationFrameId = requestAnimationFrame(() => {
        const currentFloatingChatOpenState = useUiStore.getState().isFloatingChatOpen;
        // currentPath đã được truyền vào, không cần gọi lại usePathname()
        const currentShouldRender = !CHATBOT_FULL_PAGE_PATHS_TO_HIDE_FLOATING.includes(currentPath as keyof typeof appPathnames);

        if (currentFloatingChatOpenState && currentShouldRender) {
          const isAnyChatbotFullPage =
            CHATBOT_FULL_PAGE_PATHS_TO_HIDE_FLOATING.includes(currentPath as keyof typeof appPathnames) ||
            currentPath === appPathnames['/chatbot/landingchatbot'];

          if (!isAnyChatbotFullPage) {
            const pageText = getCurrentPageTextContent();
            const pageUrl = getCurrentPageUrl();

            if (pageText && !pageText.toLowerCase().includes("loading...") && pageText.length > MIN_REASONABLE_TEXT_LENGTH) {
              console.log(`[FloatingChatbot] Updating page context (Attempt ${attemptCount + 1}) for: ${currentPath}. Text length: ${pageText.length}`);
              setPageContext(pageText, pageUrl, true);
              attemptCount = 0;
            } else {
              attemptCount++;
              console.warn(`[FloatingChatbot] Page content might be loading or too short (Attempt ${attemptCount}) for: ${currentPath}. Text: "${pageText ? pageText.substring(0, 100) + '...' : 'null'}"`);
              if (attemptCount < MAX_CONTEXT_FETCH_ATTEMPTS) {
                // Truyền currentPath vào lệnh gọi đệ quy
                retryTimerId = setTimeout(() => fetchPageContext(currentPath), CONTEXT_FETCH_RETRY_DELAY);
              } else {
                console.error(`[FloatingChatbot] Max attempts reached for fetching context for: ${currentPath}. Setting context to null.`);
                setPageContext(null, null, false);
                attemptCount = 0;
              }
            }
          } else {
            console.log(`[FloatingChatbot] Clearing page context (rAF) for chatbot page: ${currentPath}`);
            setPageContext(null, null, false);
            attemptCount = 0;
          }
        }
      });
    };

    if (isChatOpen && shouldRenderFloatingChatbot) {
      fetchPageContext(currentPathnameFromHook); // << Truyền currentPathnameFromHook vào đây
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        console.log('[FloatingChatbot] Cleaning up page context rAF.');
      }
      if (retryTimerId) {
        clearTimeout(retryTimerId);
        console.log('[FloatingChatbot] Cleaning up page context retry timer.');
      }
      attemptCount = 0;
    };
  }, [isChatOpen, currentPathnameFromHook, setPageContext, shouldRenderFloatingChatbot]);

  const openChatbot = useCallback(() => {
    if (!shouldRenderFloatingChatbot) return;

    setIsChatOpen(true);
    if (typeof window !== 'undefined') {
      const savedPositionJSON = localStorage.getItem('chatbotPosition');
      const savedSizeJSON = localStorage.getItem('chatbotSize');
      let tempSize = { width: size.width, height: size.height };
      if (savedSizeJSON) {
        try {
          const parsedSize = JSON.parse(savedSizeJSON);
          tempSize.width = Math.min(Math.max(parsedSize.width, MIN_WIDTH), window.innerWidth * MAX_WIDTH_PERCENTAGE);
          tempSize.height = Math.min(Math.max(parsedSize.height, MIN_HEIGHT), window.innerHeight * MAX_HEIGHT_PERCENTAGE);
          if (tempSize.width !== size.width || tempSize.height !== size.height) {
            setHookSize(tempSize);
          }
        } catch (e) { console.error('Failed to parse saved chatbot size on open:', e); }
      }
      if (savedPositionJSON) {
        try {
          const parsedPosition = JSON.parse(savedPositionJSON);
          const newX = Math.min(Math.max(0, parsedPosition.x), Math.max(0, window.innerWidth - tempSize.width));
          const newY = Math.min(Math.max(0, parsedPosition.y), Math.max(0, window.innerHeight - tempSize.height));
          if (newX !== position.x || newY !== position.y) {
            setHookPosition({ x: newX, y: newY });
          }
        } catch (e) { console.error('Failed to parse saved chatbot position on open:', e); }
      }
    }
    setRunOpenAnimation(true);

    const isAnyChatbotFullPageImmediate =
      CHATBOT_FULL_PAGE_PATHS_TO_HIDE_FLOATING.includes(currentPathnameFromHook as keyof typeof appPathnames) ||
      currentPathnameFromHook === appPathnames['/chatbot/landingchatbot'];

    if (!isAnyChatbotFullPageImmediate) {
      // Cân nhắc: Có thể không cần lấy context ngay ở đây nữa nếu useEffect đã xử lý tốt.
      // Hoặc, nếu muốn lấy ngay, đảm bảo DOM đã sẵn sàng.
      // Tạm thời, để useEffect xử lý việc lấy context khi mở.
      // const pageText = getCurrentPageTextContent();
      // const pageUrl = getCurrentPageUrl();
      // setPageContext(pageText, pageUrl, true);
      console.log("[FloatingChatbot openChatbot] Deferring context fetch to useEffect for path:", currentPathnameFromHook);
    } else {
      setPageContext(null, null, false);
    }

    if (activeConversationId === null) {
      if (currentStoreChatMode !== 'regular') {
        setChatMode('regular');
      }
      resetChatUIForNewConversation(true);
    }
    setIsSettingsOpen(false);
    adjustPositionToFitScreen();
  }, [
    shouldRenderFloatingChatbot,
    setIsChatOpen, activeConversationId, currentPathnameFromHook, setPageContext,
    currentStoreChatMode, setChatMode, resetChatUIForNewConversation,
    adjustPositionToFitScreen, position, size, setHookPosition, setHookSize
  ]);

  const handleMinimizeChat = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatbotPosition', JSON.stringify(position));
      localStorage.setItem('chatbotSize', JSON.stringify(size));
    }
    setIsChatOpen(false);
    if (isSettingsOpen) setIsSettingsOpen(false);
  }, [position, size, isSettingsOpen, setIsChatOpen]);

  const handleCloseChat = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatbotPosition', JSON.stringify(position));
      localStorage.setItem('chatbotSize', JSON.stringify(size));
    }
    setIsChatOpen(false);
    setIsSettingsOpen(false);
    clearPageContext();
    setActiveConversationId(null);
    resetChatUIForNewConversation(true);
  }, [
    position, size, clearPageContext, setActiveConversationId,
    resetChatUIForNewConversation, setIsChatOpen
  ]);

  useEffect(() => {
    if (runOpenAnimation) {
      const timer = setTimeout(() => setRunOpenAnimation(false), OPEN_ANIMATION_DURATION);
      return () => clearTimeout(timer);
    }
  }, [runOpenAnimation]);

  const toggleSettingsPanel = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    setIsSettingsOpen(prev => !prev)
  }, [])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (!shouldRenderFloatingChatbot) return;
      if (event.key === 'Escape') {
        if (isSettingsOpen) setIsSettingsOpen(false);
        else if (isChatOpen) handleMinimizeChat();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isChatOpen, isSettingsOpen, handleMinimizeChat, shouldRenderFloatingChatbot]);

  if (!shouldRenderFloatingChatbot) {
    return null;
  }

  const shouldShowErrorDisplayInFloatingChat = isChatOpen && hasFatalErrorGlobal;
  const currentAnimationClass = runOpenAnimation ? 'animate-slide-up-fade' : '';

  return (
    <>
      {!isChatOpen && (
        <button
          onClick={openChatbot}
          className='fixed bottom-5 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-400 text-white shadow-lg transition-transform duration-150 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75'
          style={{ zIndex: FLOATING_ICON_Z_INDEX }}
          aria-label={t('Open_Chat')}
          title={t('Open_Chat')}
        >
          <MessageSquare size={28} />
        </button>
      )}

      {isChatOpen && (
        <Draggable
          nodeRef={draggableWrapperRef}
          handle='.chatbot-drag-handle'
          position={position}
          onDrag={dragHandlers.onDrag}
          onStart={dragHandlers.onStart}
          onStop={dragHandlers.onStop}
          bounds={bounds}
          disabled={isSettingsOpen}
        >
          <div
            id={FLOATING_CHATBOT_WRAPPER_ID}
            ref={draggableWrapperRef}
            className={`${currentAnimationClass} fixed`}
            style={{
              width: size.width,
              height: size.height,
              zIndex: CHATBOT_WINDOW_Z_INDEX,
            }}
          >
            <Resizable
              size={{ width: size.width, height: size.height }}
              minWidth={MIN_WIDTH}
              minHeight={MIN_HEIGHT}
              maxWidth={currentMaxWidth}
              maxHeight={currentMaxHeight}
              onResize={resizeHandlers.onResize}
              onResizeStart={resizeHandlers.onResizeStart}
              onResizeStop={resizeHandlers.onResizeStop}
              enable={{
                top: false, right: true, bottom: true, left: false,
                topRight: false, bottomRight: true, bottomLeft: false, topLeft: false,
              }}
              className="flex h-full w-full flex-col rounded-xl bg-white-pure shadow-2xl dark:border dark:border-gray-700"
            >
              {shouldShowErrorDisplayInFloatingChat && (
                <ChatbotErrorDisplay isFloatingContext={true} />
              )}
              <div
                className={`chatbot-drag-handle flex cursor-move items-center justify-between rounded-t-xl bg-button px-4 py-3 text-button-text`}
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
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleMinimizeChat}
                    className='rounded-full p-1.5 hover:bg-blue-700 hover:text-white focus:outline-none dark:hover:bg-blue-800'
                    aria-label={t('Minimize_Chat')}
                    title={t('Minimize_Chat')}
                  >
                    <Minus size={22} />
                  </button>
                  <button
                    onClick={handleCloseChat}
                    className='rounded-full p-1.5 hover:bg-blue-700 hover:text-white focus:outline-none dark:hover:bg-blue-800'
                    aria-label={t('Close_Chat')}
                    title={t('Close_Chat')}
                  >
                    <X size={22} />
                  </button>
                </div>
              </div>

              <div className={`relative flex-1 overflow-hidden`}>
                <div
                  className={`h-full w-full transition-opacity duration-200 ${isSettingsOpen ? 'pointer-events-none opacity-30' : 'opacity-100'
                    }`}
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
            </Resizable>
          </div>
        </Draggable>
      )}
    </>
  )
}

export default FloatingChatbot