// src/app/[locale]/floatingchatbot/FloatingChatbotIcon.tsx
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FLOATING_ICON_Z_INDEX } from './floatingChatbot.constants';

interface FloatingChatbotIconProps {
  onOpen: () => void;
}

const FloatingChatbotIcon: React.FC<FloatingChatbotIconProps> = ({ onOpen }) => {
  const t = useTranslations('');

  return (
    <button
      onClick={onOpen}
      className='fixed bottom-5 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-400 text-white shadow-lg transition-transform duration-150 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75'
      style={{ zIndex: FLOATING_ICON_Z_INDEX }}
      aria-label={t('Open_Chat')}
      title={t('Open_Chat')}
    >
      <MessageSquare size={28} />
    </button>
  );
};

export default FloatingChatbotIcon;