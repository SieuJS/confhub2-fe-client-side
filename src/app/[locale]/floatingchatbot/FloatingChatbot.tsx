// src/app/[locale]/floatingchatbot/FloatingChatbot.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { useUiStore } from '@/src/app/[locale]/chatbot/stores';
import { useAppInitialization } from '@/src/hooks/regularchat/useAppInitialization';
import { useFloatingWindowControls } from '@/src/hooks/floatingChatbot/useFloatingWindowControls';
import FloatingChatbotIcon from './FloatingChatbotIcon';
import FloatingChatWindow from './FloatingChatWindow';
import { useFloatingChatbotVisibility } from '@/src/hooks/floatingChatbot/useFloatingChatbotVisibility';
import { usePageContextFetcher } from '@/src/hooks/floatingChatbot/usePageContextFetcher';
import { useFloatingChatbotActions } from '@/src/hooks/floatingChatbot/useFloatingChatbotActions';
import { useEscapeKeyHandler } from '@/src/hooks/floatingChatbot/useEscapeKeyHandler';
import {
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
  MIN_WIDTH,
  MIN_HEIGHT,
  MAX_WIDTH_PERCENTAGE,
  MAX_HEIGHT_PERCENTAGE,
  OPEN_ANIMATION_DURATION,
} from './floatingChatbot.constants';

const FloatingChatbot: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [runOpenAnimation, setRunOpenAnimation] = useState(false);

  const isChatOpen = useUiStore(state => state.isFloatingChatOpen);
  const hasFatalErrorGlobal = useUiStore(state => state.hasFatalError);

  const { shouldRenderFloatingChatbot, currentPathname } = useFloatingChatbotVisibility();

  useAppInitialization(); // Global initialization

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
    isInitialized, // <<< NHẬN STATE MỚI
  } = useFloatingWindowControls({
    initialWidth: DEFAULT_WIDTH,
    initialHeight: DEFAULT_HEIGHT,
    minConstraints: { width: MIN_WIDTH, height: MIN_HEIGHT },
    maxConstraintsPercentage: { width: MAX_WIDTH_PERCENTAGE, height: MAX_HEIGHT_PERCENTAGE },
    localStorageKeys: { position: 'chatbotPosition', size: 'chatbotSize' },
    isEnabled: isChatOpen && shouldRenderFloatingChatbot,
  });

  const {
    openChatbot,
    handleMinimizeChat,
    handleCloseChat,
    toggleSettingsPanel,
  } = useFloatingChatbotActions({
    currentPathname,
    shouldRenderFloatingChatbot,
    position, // Truyền position và size nếu actions cần
    size,
    adjustPositionToFitScreen,
    setIsSettingsOpen,
    setRunOpenAnimation,
    isSettingsOpen,
    // Quan trọng: Truyền isInitialized để action có thể quyết định khi nào chạy animation
    isInitialized,
  });

  usePageContextFetcher({
    isChatOpen,
    currentPathname,
    shouldRender: shouldRenderFloatingChatbot,
  });

  useEscapeKeyHandler({
    isChatOpen,
    isSettingsOpen,
    onMinimize: handleMinimizeChat,
    onCloseSettings: () => setIsSettingsOpen(false),
    shouldRender: shouldRenderFloatingChatbot,
  });

  // Effect để quản lý animation
  useEffect(() => {
    // Chỉ chạy animation nếu chat được mở, đã khởi tạo và cờ runOpenAnimation là true
    if (isChatOpen && isInitialized && runOpenAnimation) {
      const timer = setTimeout(() => setRunOpenAnimation(false), OPEN_ANIMATION_DURATION);
      return () => clearTimeout(timer);
    }
    // Nếu chat đóng hoặc chưa khởi tạo, đảm bảo animation không chạy
    if (!isChatOpen || !isInitialized) {
        setRunOpenAnimation(false);
    }
  }, [isChatOpen, isInitialized, runOpenAnimation]);


  if (!shouldRenderFloatingChatbot) {
    return null;
  }

  // Animation class chỉ được áp dụng khi tất cả điều kiện đều đúng
  const currentAnimationClass = (isChatOpen && isInitialized && runOpenAnimation) ? 'animate-slide-up-fade' : '';

  return (
    <>
      {/* Icon luôn hiển thị khi chat chưa mở (và shouldRenderFloatingChatbot là true) */}
      {!isChatOpen && <FloatingChatbotIcon onOpen={openChatbot} />}

      {/* Chỉ render FloatingChatWindow khi isChatOpen VÀ isInitialized */}
      {isChatOpen && isInitialized && (
        <FloatingChatWindow
          position={position}
          size={size}
          bounds={bounds}
          draggableWrapperRef={draggableWrapperRef}
          dragHandlers={dragHandlers}
          resizeHandlers={resizeHandlers}
          currentMaxWidth={currentMaxWidth}
          currentMaxHeight={currentMaxHeight}
          isSettingsOpen={isSettingsOpen}
          onToggleSettings={toggleSettingsPanel}
          onMinimize={handleMinimizeChat}
          onClose={handleCloseChat}
          onCloseSettings={() => setIsSettingsOpen(false)}
          hasFatalError={hasFatalErrorGlobal}
          animationClass={currentAnimationClass}
        />
      )}
      {/* Optional: Placeholder or loader if needed while !isInitialized and chat is supposed to be open */}
      {/* {isChatOpen && !isInitialized && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '20px',
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '8px',
          zIndex: 9999
        }}>
          Loading Chatbot...
        </div>
      )} */}
    </>
  );
};

export default FloatingChatbot;