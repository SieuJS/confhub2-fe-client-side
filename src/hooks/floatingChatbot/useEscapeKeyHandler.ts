// src/hooks/floatingchatbot/useEscapeKeyHandler.ts
import { useEffect } from 'react';

interface UseEscapeKeyHandlerProps {
  isChatOpen: boolean;
  isSettingsOpen: boolean;
  onMinimize: () => void;
  onCloseSettings: () => void;
  shouldRender: boolean;
}

export const useEscapeKeyHandler = ({
  isChatOpen,
  isSettingsOpen,
  onMinimize,
  onCloseSettings,
  shouldRender,
}: UseEscapeKeyHandlerProps) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (!shouldRender) return;
      if (event.key === 'Escape') {
        if (isSettingsOpen) {
          onCloseSettings();
        } else if (isChatOpen) {
          onMinimize();
        }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isChatOpen, isSettingsOpen, onMinimize, onCloseSettings, shouldRender]);
};