// src/app/[locale]/floatingchatbot/FloatingChatWindow.tsx
import React from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { Resizable, ResizeCallback, ResizeStartCallback } from 're-resizable';
import FloatingChatWindowHeader from './FloatingChatWindowHeader';
import FloatingChatWindowContent from './FloatingChatWindowContent';
import ChatbotErrorDisplay from '../chatbot/ChatbotErrorDisplay';
import {
  FLOATING_CHATBOT_WRAPPER_ID,
  CHATBOT_WINDOW_Z_INDEX,
  MIN_WIDTH,
  MIN_HEIGHT,
} from '@/src/app/[locale]/floatingchatbot/floatingChatbot.constants';

interface FloatingChatWindowProps {
  position: { x: number; y: number };
  size: { width: number; height: number };
  bounds: string | false | Partial<{ left: number; top: number; right: number; bottom: number; }>;
  draggableWrapperRef: React.RefObject<HTMLDivElement>;
  dragHandlers: {
    onStart: (event: DraggableEvent, data: DraggableData) => void | false;
    onDrag: (event: DraggableEvent, data: DraggableData) => void | false;
    onStop: (event: DraggableEvent, data: DraggableData) => void | false;
  };
  resizeHandlers: {
    onResizeStart: ResizeStartCallback;
    onResize: ResizeCallback;
    onResizeStop: ResizeCallback;
  };
  currentMaxWidth: number;
  currentMaxHeight: number;
  isSettingsOpen: boolean;
  onToggleSettings: (e?: React.MouseEvent) => void;
  onMinimize: () => void;
  onClose: () => void;
  onCloseSettings: () => void;
  hasFatalError: boolean;
  animationClass: string;
}

const FloatingChatWindow: React.FC<FloatingChatWindowProps> = ({
  position,
  size,
  bounds,
  draggableWrapperRef,
  dragHandlers,
  resizeHandlers,
  currentMaxWidth,
  currentMaxHeight,
  isSettingsOpen,
  onToggleSettings,
  onMinimize,
  onClose,
  onCloseSettings,
  hasFatalError,
  animationClass,
}) => {
  const shouldShowErrorDisplay = hasFatalError; // Simplified from original as isChatOpen is implicit here

  return (
    <Draggable
      nodeRef={draggableWrapperRef}
      handle='.chatbot-drag-handle'
      position={position}
      onDrag={dragHandlers.onDrag}
      onStart={dragHandlers.onStart}
      onStop={dragHandlers.onStop}
      bounds={bounds}
      cancel="button, a, input, textarea, select"

    >
      <div
        id={FLOATING_CHATBOT_WRAPPER_ID}
        ref={draggableWrapperRef}
        className={`${animationClass} fixed`}
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
          {shouldShowErrorDisplay && (
            <ChatbotErrorDisplay isFloatingContext={true} />
          )}
          <FloatingChatWindowHeader
            isSettingsOpen={isSettingsOpen}
            onToggleSettings={onToggleSettings}
            onMinimize={onMinimize}
            onClose={onClose}
          />
          <FloatingChatWindowContent
            isSettingsOpen={isSettingsOpen}
            onCloseSettings={onCloseSettings}
          />
        </Resizable>
      </div>
    </Draggable>
  );
};

export default FloatingChatWindow;