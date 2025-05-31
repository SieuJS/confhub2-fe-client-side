// src/app/[locale]/floatingchatbot/FloatingChatbot.tsx
'use client'

import React, {
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react'
import { X, Settings, Minus } from 'lucide-react';
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
import dynamic from 'next/dynamic'
import ChatbotErrorDisplay from '../chatbot/ChatbotErrorDisplay'
import { usePathname } from '@/src/navigation'
import { MAIN_CHATBOT_PAGE_PATH } from '@/src/app/[locale]/chatbot/lib/constants'

import Draggable, { DraggableData, DraggableEvent } from 'react-draggable'
import { Resizable, ResizeDirection } from 're-resizable'
import type { NumberSize } from 're-resizable'

const DynamicAnimatedIcon = dynamic(() => import('../utils/AnimatedIcon'), {
  ssr: false,
  loading: () => (
    <div className='flex h-14 w-14 items-center justify-center rounded-full bg-blue-400'></div>
  )
})

const getCurrentPageTextContent = (
  maxLength: number = 20000
): string | null => {
  if (typeof window !== 'undefined' && document?.body?.innerText) {
    const text = document.body.innerText
    return text.length > maxLength
      ? text.substring(0, maxLength) + '\n[...content truncated]'
      : text
  }
  return null
}

const MIN_WIDTH = 320
const MIN_HEIGHT = 400
const DEFAULT_WIDTH = 384
const DEFAULT_HEIGHT = 600
const MAX_WIDTH_PERCENTAGE = 0.9
const MAX_HEIGHT_PERCENTAGE = 0.85
const OPEN_ANIMATION_DURATION = 300;

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
  const hasFatalError = useUiStore(state => state.hasFatalError)

  const { setPageContext, clearPageContext } = usePageContextStore.getState()
  const pathname = usePathname()

  useAppInitialization()

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT
  })
  const [isDraggingOrResizing, setIsDraggingOrResizing] = useState(false)
  const [bounds, setBounds] = useState<
    { left: number; top: number; right: number; bottom: number }
  >({ left: 0, top: 0, right: 0, bottom: 0 })

  const draggableWrapperRef = useRef<HTMLDivElement>(null);
  // previousIsDraggingOrResizing không còn cần thiết nếu bỏ useEffect lưu trữ cũ
  const [runOpenAnimation, setRunOpenAnimation] = useState(false);


  const adjustPositionToFitScreen = useCallback(() => {
    if (typeof window === 'undefined') return;
    setPosition(prevPos => {
      const currentWidth = size.width;
      const currentHeight = size.height;
      const maxX = window.innerWidth - currentWidth;
      const maxY = window.innerHeight - currentHeight;
      const safeMaxX = Math.max(0, maxX);
      const safeMaxY = Math.max(0, maxY);
      const newX = Math.min(Math.max(0, prevPos.x), safeMaxX);
      const newY = Math.min(Math.max(0, prevPos.y), safeMaxY);
      if (newX !== prevPos.x || newY !== prevPos.y) {
        return { x: newX, y: newY };
      }
      return prevPos;
    });
  }, [size.width, size.height]);

  // Khôi phục trạng thái từ localStorage khi component mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedPositionJSON = localStorage.getItem('chatbotPosition');
    const savedSizeJSON = localStorage.getItem('chatbotSize');
    let newSize = { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
    if (savedSizeJSON) {
      try {
        const parsedSize = JSON.parse(savedSizeJSON);
        newSize.width = Math.min(
          Math.max(parsedSize.width, MIN_WIDTH),
          window.innerWidth * MAX_WIDTH_PERCENTAGE
        );
        newSize.height = Math.min(
          Math.max(parsedSize.height, MIN_HEIGHT),
          window.innerHeight * MAX_HEIGHT_PERCENTAGE
        );
      } catch (e) {
        console.error('Failed to parse saved chatbot size:', e);
      }
    }
    setSize(newSize); // Cập nhật state size trước

    // Sau đó tính toán và cập nhật position dựa trên newSize
    let newPosition = { x: 0, y: 0 };
    if (savedPositionJSON) {
      try {
        const parsedPosition = JSON.parse(savedPositionJSON);
        newPosition.x = Math.min(
          Math.max(0, parsedPosition.x),
          Math.max(0, window.innerWidth - newSize.width) // Dùng newSize
        );
        newPosition.y = Math.min(
          Math.max(0, parsedPosition.y),
          Math.max(0, window.innerHeight - newSize.height) // Dùng newSize
        );
      } catch (e) {
        console.error('Failed to parse saved chatbot position:', e);
        newPosition.x = Math.max(0, window.innerWidth - newSize.width - 32);
        newPosition.y = Math.max(0, window.innerHeight - newSize.height - 32);
      }
    } else {
      newPosition.x = Math.max(0, window.innerWidth - newSize.width - 32);
      newPosition.y = Math.max(0, window.innerHeight - newSize.height - 32);
    }
    setPosition(newPosition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy một lần khi mount

  // Cập nhật bounds và điều chỉnh vị trí khi kích thước component hoặc cửa sổ thay đổi
  useEffect(() => {
    const handleResizeOrSizeChange = () => {
      if (typeof window !== 'undefined') {
        setBounds({
          left: 0,
          top: 0,
          right: Math.max(0, window.innerWidth - size.width),
          bottom: Math.max(0, window.innerHeight - size.height)
        });
        // Quan trọng: Gọi adjustPositionToFitScreen sau khi size đã được cập nhật
        // và bounds cũng đã được tính toán dựa trên size mới (nếu size thay đổi).
        adjustPositionToFitScreen();
      }
    }
    if (typeof window !== 'undefined') {
        handleResizeOrSizeChange();
        window.addEventListener('resize', handleResizeOrSizeChange);
        return () => window.removeEventListener('resize', handleResizeOrSizeChange);
    }
  }, [size.width, size.height, adjustPositionToFitScreen]);


  const toggleChatbot = useCallback(() => {
    setIsChatOpen(prevIsChatOpen => {
      const newIsChatOpen = !prevIsChatOpen;
      if (newIsChatOpen) { // Mở chat
        // Đọc lại từ localStorage để đảm bảo có position/size mới nhất nếu có thay đổi ngầm
        // Tuy nhiên, useEffect mount đã làm việc này. Nếu component không unmount, state hiện tại là đúng.
        // Chỉ cần đảm bảo adjustPositionToFitScreen được gọi.
        if (typeof window !== 'undefined') {
            const savedPositionJSON = localStorage.getItem('chatbotPosition');
            const savedSizeJSON = localStorage.getItem('chatbotSize');
            let currentSize = size;
            if (savedSizeJSON) {
                try {
                    const parsedSize = JSON.parse(savedSizeJSON);
                    currentSize = {
                        width: Math.min(Math.max(parsedSize.width, MIN_WIDTH), window.innerWidth * MAX_WIDTH_PERCENTAGE),
                        height: Math.min(Math.max(parsedSize.height, MIN_HEIGHT), window.innerHeight * MAX_HEIGHT_PERCENTAGE)
                    };
                    if(currentSize.width !== size.width || currentSize.height !== size.height) setSize(currentSize);
                } catch (e) { /* ignore */ }
            }
            if (savedPositionJSON) {
                try {
                    const parsedPosition = JSON.parse(savedPositionJSON);
                    const newPos = {
                        x: Math.min(Math.max(0, parsedPosition.x), Math.max(0, window.innerWidth - currentSize.width)),
                        y: Math.min(Math.max(0, parsedPosition.y), Math.max(0, window.innerHeight - currentSize.height))
                    };
                    if(newPos.x !== position.x || newPos.y !== position.y) setPosition(newPos);
                } catch (e) { /* ignore */ }
            }
        }


        setRunOpenAnimation(true);
        if (activeConversationId === null) { // Mở mới
          const isMainChatPage = pathname === MAIN_CHATBOT_PAGE_PATH;
          if (!isMainChatPage) {
            const pageText = getCurrentPageTextContent();
            setPageContext(pageText, true);
          } else {
            setPageContext(null, false);
          }
          if (currentStoreChatMode !== 'regular') {
            setChatMode('regular');
          }
          resetChatUIForNewConversation(true);
        } else { // Mở lại từ minimize
          const isMainChatPage = pathname === MAIN_CHATBOT_PAGE_PATH;
            if (!isMainChatPage) {
                const pageText = getCurrentPageTextContent();
                setPageContext(pageText, true); // Cập nhật context
            } else {
                setPageContext(null, false);
            }
        }
        setIsSettingsOpen(false);
        adjustPositionToFitScreen(); // Đảm bảo vừa màn hình
      } else { // Đóng chat từ icon chính (nên coi như Close hoàn toàn)
        if (typeof window !== 'undefined') {
          localStorage.setItem('chatbotPosition', JSON.stringify(position));
          localStorage.setItem('chatbotSize', JSON.stringify(size));
        }
        setIsSettingsOpen(false);
        clearPageContext();
        setActiveConversationId(null);
        resetChatUIForNewConversation(true);
      }
      return newIsChatOpen;
    });
  }, [
    activeConversationId, pathname, setPageContext, clearPageContext,
    currentStoreChatMode, setChatMode, setActiveConversationId,
    resetChatUIForNewConversation, adjustPositionToFitScreen,
    position, size // Thêm position, size vì dùng trong logic đọc lại localStorage
  ]);

  const handleMinimizeChat = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatbotPosition', JSON.stringify(position));
      localStorage.setItem('chatbotSize', JSON.stringify(size));
    }
    setIsChatOpen(false);
    if (isSettingsOpen) setIsSettingsOpen(false);
  }, [position, size, isSettingsOpen]);

  const handleCloseChat = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatbotPosition', JSON.stringify(position)); // Lưu trạng thái cuối
      localStorage.setItem('chatbotSize', JSON.stringify(size));
    }
    setIsChatOpen(false);
    setIsSettingsOpen(false);
    clearPageContext();
    setActiveConversationId(null);
    resetChatUIForNewConversation(true);
  }, [position, size, clearPageContext, setActiveConversationId, resetChatUIForNewConversation, isSettingsOpen]);


  useEffect(() => {
    if (runOpenAnimation) {
      const timer = setTimeout(() => {
        setRunOpenAnimation(false);
      }, OPEN_ANIMATION_DURATION);
      return () => clearTimeout(timer);
    }
  }, [runOpenAnimation]);


  const toggleSettingsPanel = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    setIsSettingsOpen(prev => !prev)
  }, [])

  useEffect(() => {
    if (isChatOpen && currentStoreChatMode !== 'regular') {
      setChatMode('regular')
    }
  }, [isChatOpen, currentStoreChatMode, setChatMode])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else if (isChatOpen) {
          handleMinimizeChat();
        }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isChatOpen, isSettingsOpen, handleMinimizeChat]);

  const handleDrag = (e: DraggableEvent, ui: DraggableData) => {
    setPosition({ x: ui.x, y: ui.y })
  }

  const handleResize = useCallback((
    event: MouseEvent | TouchEvent,
    direction: ResizeDirection,
    elementRef: HTMLElement,
    delta: NumberSize
  ) => {
    setSize(prevSize => ({
      width: prevSize.width + delta.width,
      height: prevSize.height + delta.height
    }));
  }, []);

  const onResizeStartHandler = useCallback((
    e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>,
    dir: ResizeDirection,
    elementRef: HTMLElement
  ) => {
    setIsDraggingOrResizing(true);
  }, []);

  const onResizeStopHandler = useCallback((
    event: MouseEvent | TouchEvent,
    direction: ResizeDirection,
    elementRef: HTMLElement,
    delta: NumberSize
  ) => {
    setIsDraggingOrResizing(false);
    if (typeof window !== 'undefined') {
      // size đã được cập nhật từ handleResize
      localStorage.setItem('chatbotSize', JSON.stringify(size));
      // position có thể cần điều chỉnh và lưu lại
      adjustPositionToFitScreen(); // Điều chỉnh trước
      // Sau khi adjustPositionToFitScreen, state position có thể thay đổi, nhưng nó bất đồng bộ
      // Để lưu position chính xác sau khi adjust, cần một effect hoặc callback
      // Tạm thời lưu position hiện tại, adjustPositionToFitScreen sẽ cập nhật nó cho hiển thị
      localStorage.setItem('chatbotPosition', JSON.stringify(position));
    }
  }, [adjustPositionToFitScreen, size, position]); // Thêm size, position


  const onDragStartInteraction = () => setIsDraggingOrResizing(true)
  const onDragStopInteraction = () => {
    setIsDraggingOrResizing(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatbotPosition', JSON.stringify(position));
    }
  };

  const shouldShowErrorDisplayInFloatingChat = isChatOpen && hasFatalError
  const currentAnimationClass = runOpenAnimation ? 'animate-slide-up-fade' : '';

  const currentMaxWidth = typeof window !== 'undefined' ? window.innerWidth * MAX_WIDTH_PERCENTAGE : DEFAULT_WIDTH * 1.5;
  const currentMaxHeight = typeof window !== 'undefined' ? window.innerHeight * MAX_HEIGHT_PERCENTAGE : DEFAULT_HEIGHT * 1.5;


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
        <Draggable
          nodeRef={draggableWrapperRef}
          handle='.chatbot-drag-handle'
          position={position}
          onDrag={handleDrag}
          onStart={onDragStartInteraction}
          onStop={onDragStopInteraction}
          bounds={bounds}
          disabled={isSettingsOpen}
        >
          <div
            ref={draggableWrapperRef}
            className={`${currentAnimationClass} fixed z-50`}
            style={{
              width: size.width,
              height: size.height,
            }}
          >
            <Resizable
              size={{ width: size.width, height: size.height }}
              minWidth={MIN_WIDTH}
              minHeight={MIN_HEIGHT}
              maxWidth={currentMaxWidth}
              maxHeight={currentMaxHeight}
              onResize={handleResize}
              onResizeStart={onResizeStartHandler}
              onResizeStop={onResizeStopHandler}
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
                  className={`h-full w-full transition-opacity duration-200 ${
                    isSettingsOpen ? 'pointer-events-none opacity-30' : 'opacity-100'
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