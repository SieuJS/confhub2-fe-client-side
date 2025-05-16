// src/hooks/chatbot/useMessageBubbleLogic.ts
import { useState, useEffect, useRef } from 'react';
import { MessageType } from '@/src/app/[locale]/chatbot/lib/regular-chat.types';

interface UseMessageBubbleLogicProps {
  id: string; // For useEffect dependency if needed for re-calculation
  initialMessage: string;
  isUser: boolean;
  type: MessageType;
  isInsideSmallContainer: boolean;
}

export function useMessageBubbleLogic({
  id,
  initialMessage,
  isUser,
  type,
  isInsideSmallContainer,
}: UseMessageBubbleLogicProps) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [modelMessageShouldBeFullWidth, setModelMessageShouldBeFullWidth] = useState(false);

  useEffect(() => {
    // Debounce or throttle this if performance becomes an issue with many messages
    const calculateWidth = () => {
      if (!isUser && isInsideSmallContainer && bubbleRef.current) {
        const bubbleElement = bubbleRef.current;
        const parentElement = bubbleElement.parentElement;
        if (parentElement) {
          // Temporarily set width to auto to measure natural width
          // This might be tricky if CSS transitions are involved
          // A more robust way might be to clone and measure, or use ResizeObserver
          const originalWidth = bubbleElement.style.width;
          bubbleElement.style.width = 'auto';
          const initialBubbleWidth = bubbleElement.offsetWidth;
          bubbleElement.style.width = originalWidth; // Restore

          const parentWidth = parentElement.offsetWidth;
          const thresholdWidth = parentWidth * 0.95;
          setModelMessageShouldBeFullWidth(initialBubbleWidth > thresholdWidth);
        }
      } else {
        setModelMessageShouldBeFullWidth(false);
      }
    };

    calculateWidth(); // Initial calculation

    // Consider adding ResizeObserver here if parent width can change dynamically
    // and affect this logic. For now, keeping it simple based on initial render.

  }, [initialMessage, isUser, isInsideSmallContainer, id, type]);


  const getWidthAndMaxWidthClasses = () => {
    if (isInsideSmallContainer) {
      if (!isUser) {
        if (type === 'map' || type === 'follow_update') return 'w-full max-w-full';
        return modelMessageShouldBeFullWidth ? 'w-full max-w-full' : 'w-auto max-w-full';
      }
      return 'w-auto max-w-full sm:max-w-[90%] md:max-w-[80%]';
    }
    if (type === 'map' || type === 'follow_update') return 'w-auto max-w-full sm:max-w-[90%] md:max-w-[80%] lg:max-w-[75%] xl:max-w-[70%]';
    return 'w-auto max-w-full sm:max-w-[90%] md:max-w-[80%] lg:max-w-[75%] xl:max-w-[70%]';
  };

  const bubbleClasses = `
    group relative
    ${getWidthAndMaxWidthClasses()}
    p-2.5 sm:p-3 rounded-lg shadow-sm flex flex-col text-sm
    ${isUser
      ? 'bg-blue-500 text-white rounded-br-none dark:bg-blue-600'
      : type === 'error'
        ? 'bg-red-100 text-red-700 border border-red-200 rounded-bl-none dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50'
        : type === 'warning'
          ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-bl-none dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700/50'
          : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
    }
  `;

  return { bubbleRef, bubbleClasses };
}