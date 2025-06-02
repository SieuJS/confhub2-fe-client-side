// src/app/[locale]/chatbot/regularchat/SettingsToggleButton.tsx
import React from 'react';
import { Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useUiStore } from '@/src/app/[locale]/chatbot/stores'; // Adjust path
import { useShallow } from 'zustand/react/shallow';

interface SettingsToggleButtonProps {
  isProcessingDeletion: boolean; // To disable button during deletion
}

export default function SettingsToggleButton({ isProcessingDeletion }: SettingsToggleButtonProps) {
  const t = useTranslations();
  const { isRightPanelOpen, setRightPanelOpen } = useUiStore(
    useShallow(state => ({
      isRightPanelOpen: state.isRightPanelOpen,
      setRightPanelOpen: state.setRightPanelOpen,
    }))
  );

  if (isRightPanelOpen) {
    return null;
  }

  return (
    <button
      onClick={() => {
        if (isProcessingDeletion) return;
        setRightPanelOpen(true);
      }}
      disabled={isProcessingDeletion}
      className='bg-white-pure hover:bg-gray-10 fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
      title={t('Open_settings')}
      aria-label={t('Open_settings')}
    >
      <Settings className='h-5 w-5' />
    </button>
  );
}