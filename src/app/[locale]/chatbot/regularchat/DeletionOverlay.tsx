// src/app/[locale]/chatbot/regularchat/DeletionOverlay.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DeletionOverlayProps {
  isVisible: boolean;
}

export default function DeletionOverlay({ isVisible }: DeletionOverlayProps) {
  const t = useTranslations();

  if (!isVisible) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white bg-opacity-75 dark:bg-black dark:bg-opacity-75">
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-xl flex items-center text-gray-700 dark:text-gray-200">
        <Loader2 size={24} className="animate-spin mr-3" />
        <span>{t('Deleting_conversation_ellipsis')}</span>
      </div>
    </div>
  );
}