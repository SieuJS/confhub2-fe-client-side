// src/app/[locale]/floatingchatbot/FloatingChatbot.tsx
'use client'

import React, {
  useState,
  useEffect,
  useCallback
  // useRef // No longer needed directly here for draggableWrapperRef
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

import Draggable from 'react-draggable'; // Keep for Draggable component
import { Resizable } from 're-resizable'; // Keep for Resizable component
// Import the new hook (adjust path as needed)
import { useFloatingWindowControls } from '@/src/hooks/floatingChatbot/useFloatingWindowControls'; 

const DynamicAnimatedIcon = dynamic(() => import('../utils/AnimatedIcon'), {
  ssr: false,
  loading: () => (
    <div className='flex h-14 w-14 items-center justify-center rounded-full bg-blue-400'></div>
  )
})

const getCurrentPageTextContent = (
  maxLength: number = 50000
): string | null => {
  if (typeof window !== 'undefined' && document?.body?.innerText) {
    const text = document.body.innerText
    return text.length > maxLength
      ? text.substring(0, maxLength) + '\n[...content truncated]'
      : text
  }
  return null
}

const getCurrentPageUrl = (): string | null => {
  if (typeof window !== 'undefined') {
    return window.location.href;
  }
  return null;
}

// These constants will be passed to the hook
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

  const { setPageContext, clearPageContext } = usePageContextStore();
  const pathname = usePathname()

  useAppInitialization()

  const [runOpenAnimation, setRunOpenAnimation] = useState(false);

  // Use the custom hook
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
    // isInteracting, // Hook manages this, parent doesn't directly use it for now
    setPosition: setHookPosition, // Renamed to avoid conflict if any local 'setPosition' existed
    setSize: setHookSize,       // Renamed to avoid conflict if any local 'setSize' existed
  } = useFloatingWindowControls({
    initialWidth: DEFAULT_WIDTH,
    initialHeight: DEFAULT_HEIGHT,
    minConstraints: { width: MIN_WIDTH, height: MIN_HEIGHT },
    maxConstraintsPercentage: { width: MAX_WIDTH_PERCENTAGE, height: MAX_HEIGHT_PERCENTAGE },
    localStorageKeys: { position: 'chatbotPosition', size: 'chatbotSize' },
    isEnabled: isChatOpen,
  });

  // The original logic for loading from localStorage on toggleChatbot (when opening)
  // is preserved here to ensure the exact same behavior of eagerly loading/overriding.
  // The hook also loads when `isEnabled` becomes true, but this explicit load
  // in toggleChatbot ensures values are set before the hook's effect might run.
  const toggleChatbot = useCallback(() => {
    setIsChatOpen(prevIsChatOpen => {
      const newIsChatOpen = !prevIsChatOpen;
      if (newIsChatOpen) {
        // Eagerly load from localStorage and apply, similar to original logic
        if (typeof window !== 'undefined') {
          const savedPositionJSON = localStorage.getItem('chatbotPosition');
          const savedSizeJSON = localStorage.getItem('chatbotSize');
          
          let tempSize = { width: size.width, height: size.height }; // Start with current hook size
          if (savedSizeJSON) {
            try {
              const parsedSize = JSON.parse(savedSizeJSON);
              tempSize.width = Math.min(
                Math.max(parsedSize.width, MIN_WIDTH),
                window.innerWidth * MAX_WIDTH_PERCENTAGE
              );
              tempSize.height = Math.min(
                Math.max(parsedSize.height, MIN_HEIGHT),
                window.innerHeight * MAX_HEIGHT_PERCENTAGE
              );
              // Only update if different from hook's current size to avoid unnecessary re-renders
              if (tempSize.width !== size.width || tempSize.height !== size.height) {
                setHookSize(tempSize);
              }
            } catch (e) { console.error('Failed to parse saved chatbot size on toggle:', e); }
          }

          if (savedPositionJSON) {
            try {
              const parsedPosition = JSON.parse(savedPositionJSON);
              const newX = Math.min(
                Math.max(0, parsedPosition.x),
                Math.max(0, window.innerWidth - tempSize.width) // Use potentially updated tempSize
              );
              const newY = Math.min(
                Math.max(0, parsedPosition.y),
                Math.max(0, window.innerHeight - tempSize.height) // Use potentially updated tempSize
              );
              if (newX !== position.x || newY !== position.y) {
                 setHookPosition({ x: newX, y: newY });
              }
            } catch (e) { console.error('Failed to parse saved chatbot position on toggle:', e); }
          }
        }

        setRunOpenAnimation(true);
        if (activeConversationId === null) {
          const isMainChatPage = pathname === MAIN_CHATBOT_PAGE_PATH;
          if (!isMainChatPage) {
            const pageText = getCurrentPageTextContent();
            
            const pageUrl = getCurrentPageUrl();
            console.log('[FloatingChatbot] Setting page context. URL:', pageUrl, 'Text length:', pageText?.length);

            setPageContext(pageText, pageUrl, true);
          } else {
            setPageContext(null, null, false);
          }
          if (currentStoreChatMode !== 'regular') {
            setChatMode('regular');
          }
          resetChatUIForNewConversation(true);
        } else {
          const isMainChatPage = pathname === MAIN_CHATBOT_PAGE_PATH;
          if (!isMainChatPage) {
            const pageText = getCurrentPageTextContent();
            const pageUrl = getCurrentPageUrl();
            setPageContext(pageText, pageUrl, true);
          } else {
            setPageContext(null, null, false);
          }
        }
        setIsSettingsOpen(false);
        // Ensure position is correct after potential size/pos changes from localStorage
        // and after the component is definitely going to be open.
        // adjustPositionToFitScreen will use the latest size from the hook's state.
        adjustPositionToFitScreen();
      } else { // Closing chat
        if (typeof window !== 'undefined') {
          localStorage.setItem('chatbotPosition', JSON.stringify(position)); // Use position from hook
          localStorage.setItem('chatbotSize', JSON.stringify(size));       // Use size from hook
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
    position, size, // Current position and size from hook (for saving on close and comparing on open)
    setHookPosition, setHookSize // Setters from hook for eager load
  ]);

  const handleMinimizeChat = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatbotPosition', JSON.stringify(position)); // Use position from hook
      localStorage.setItem('chatbotSize', JSON.stringify(size));       // Use size from hook
    }
    setIsChatOpen(false);
    if (isSettingsOpen) setIsSettingsOpen(false);
  }, [position, size, isSettingsOpen]); // position and size from hook

  const handleCloseChat = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatbotPosition', JSON.stringify(position)); // Use position from hook
      localStorage.setItem('chatbotSize', JSON.stringify(size));       // Use size from hook
    }
    setIsChatOpen(false);
    setIsSettingsOpen(false);
    clearPageContext();
    setActiveConversationId(null);
    resetChatUIForNewConversation(true);
  }, [position, size, clearPageContext, setActiveConversationId, resetChatUIForNewConversation]);


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
          handleMinimizeChat(); // This already uses hook's position/size for saving
        }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isChatOpen, isSettingsOpen, handleMinimizeChat]);

  // Drag and resize state and handlers (handleDrag, handleResize, onResizeStart, onResizeStop, etc.)
  // are now managed by useFloatingWindowControls hook.

  const shouldShowErrorDisplayInFloatingChat = isChatOpen && hasFatalError
  const currentAnimationClass = runOpenAnimation ? 'animate-slide-up-fade' : '';

  // currentMaxWidth, currentMaxHeight are now provided by the hook.

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
          nodeRef={draggableWrapperRef} // From hook
          handle='.chatbot-drag-handle'
          position={position} // From hook
          onDrag={dragHandlers.onDrag} // From hook
          onStart={dragHandlers.onStart} // From hook
          onStop={dragHandlers.onStop} // From hook
          bounds={bounds} // From hook
          disabled={isSettingsOpen}
        >
          <div
            ref={draggableWrapperRef} // From hook
            className={`${currentAnimationClass} fixed z-50`}
            style={{
              width: size.width, // From hook
              height: size.height, // From hook
            }}
          >
            <Resizable
              size={{ width: size.width, height: size.height }} // From hook
              minWidth={MIN_WIDTH} // Constant
              minHeight={MIN_HEIGHT} // Constant
              maxWidth={currentMaxWidth} // From hook
              maxHeight={currentMaxHeight} // From hook
              onResize={resizeHandlers.onResize} // From hook
              onResizeStart={resizeHandlers.onResizeStart} // From hook
              onResizeStop={resizeHandlers.onResizeStop} // From hook
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