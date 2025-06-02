// src/app/[locale]/floatingchatbot/FloatingChatWindowContent.tsx
import React from 'react';
import FloatingChatbotSettings from './FloatingChatbotSettings'; // Assuming it's moved or path is correct
import RegularChat from '../chatbot/regularchat/RegularChat';

interface FloatingChatWindowContentProps {
  isSettingsOpen: boolean;
  onCloseSettings: () => void;
}

const FloatingChatWindowContent: React.FC<FloatingChatWindowContentProps> = ({
  isSettingsOpen,
  onCloseSettings,
}) => {
  return (
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
          onClose={onCloseSettings}
        />
      )}
    </div>
  );
};

export default FloatingChatWindowContent;