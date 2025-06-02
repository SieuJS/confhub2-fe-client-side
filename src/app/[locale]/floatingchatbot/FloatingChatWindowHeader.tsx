// src/app/[locale]/floatingchatbot/FloatingChatWindowHeader.tsx
import React from 'react';
import { Settings, Minus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FloatingChatWindowHeaderProps {
  isSettingsOpen: boolean;
  onToggleSettings: (e?: React.MouseEvent) => void;
  onMinimize: () => void;
  onClose: () => void;
}

const FloatingChatWindowHeader: React.FC<FloatingChatWindowHeaderProps> = ({
  isSettingsOpen,
  onToggleSettings,
  onMinimize,
  onClose,
}) => {
  const t = useTranslations('');

  return (
    <div
      className={`chatbot-drag-handle flex cursor-move items-center justify-between rounded-t-xl bg-button px-4 py-1 text-button-text`}
    >
      <div className='flex items-center space-x-3'>
        <button
          onClick={onToggleSettings}
          className='rounded-full p-1.5 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-white dark:hover:bg-blue-800'
          aria-label={isSettingsOpen ? t('Close_Chat_Settings') : t('Open_Chat_Settings')}
          title={isSettingsOpen ? t('Close_Chat_Settings') : t('Open_Chat_Settings')}
          aria-expanded={isSettingsOpen}
        >
          <Settings size={18} />
        </button>
        <h3 className='text-md font-semibold'>{t('Chat_With_Us')}</h3>
      </div>
      <div className="flex items-center space-x-1">
        <button
          onClick={onMinimize}
          className='rounded-full p-1.5 hover:bg-blue-700 hover:text-white focus:outline-none dark:hover:bg-blue-800'
          aria-label={t('Minimize_Chat')}
          title={t('Minimize_Chat')}
        >
          <Minus size={18} />
        </button>
        <button
          onClick={onClose}
          className='rounded-full p-1.5 hover:bg-blue-700 hover:text-white focus:outline-none dark:hover:bg-blue-800'
          aria-label={t('Close_Chat')}
          title={t('Close_Chat')}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default FloatingChatWindowHeader;