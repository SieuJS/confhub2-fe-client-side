// src/app/[locale]/chatbot/livechat/OutputFormatSelector.tsx
import React from 'react';
// Import Modality enum from SDK and your OutputModality type (which should be an alias)
import { Modality as SDKModality } from '@google/genai';
import { OutputModality } from '@/src/app/[locale]/chatbot/lib/live-chat.types'; // This is SDKModality
import { Volume2, Text } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface OutputFormatSelectorProps {
  currentModality: OutputModality; // This is SDKModality
  onModalityChange: (modality: OutputModality) => void; // Expects SDKModality
  disabled: boolean;
}

const OutputFormatSelector: React.FC<OutputFormatSelectorProps> = ({
  currentModality,
  onModalityChange,
  disabled,
}) => {
  const t = useTranslations();

  // Compare with SDK enum members
  const isAudioSelected = currentModality === SDKModality.AUDIO;
  const isTextSelected = currentModality === SDKModality.TEXT;
  // Note: SDKModality.IMAGE is also an option if you support it.

  return (
    <div>
      <label className='mb-3 block text-sm font-medium '>
        {t('Output_Format')}
      </label>
      <div className='grid grid-cols-2 gap-3'>
        <button
          type='button'
          onClick={() => onModalityChange(SDKModality.AUDIO)} // Pass SDK enum member
          disabled={disabled}
          className={`group flex flex-col items-center justify-center rounded-lg border p-3 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${isAudioSelected ? 'bg-gray-10 border-blue-500 ring-1 ring-blue-500 ' : 'bg-white-pure hover:bg-gray-10 border-gray-300 hover:border-gray-400 '}`}
          aria-pressed={isAudioSelected}
        >
          <Volume2
            stroke='currentColor'
            className={`mb-1 h-6 w-6 ${isAudioSelected ? 'text-blue-600' : '0 group-hover:text-gray-500'}`}
            aria-hidden='true'
            size={24}
          />
          <span
            className={`text-sm font-medium ${isAudioSelected ? 'text-blue-700' : ' group-hover:text-gray-500'}`}
          >
            {t('Audio')}
          </span>
        </button>
        <button
          type='button'
          onClick={() => onModalityChange(SDKModality.TEXT)} // Pass SDK enum member
          disabled={disabled}
          className={`group flex flex-col items-center justify-center rounded-lg border p-3 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${isTextSelected ? 'bg-gray-10 border-blue-500 ring-1 ring-blue-500 ' : 'bg-white-pure hover:bg-gray-10 border-gray-300 hover:border-gray-400 '}`}
          aria-pressed={isTextSelected}
        >
          <Text
            stroke='currentColor'
            className={`mb-1 h-6 w-6 ${isTextSelected ? 'text-blue-600' : ' group-hover:text-gray-500'}`}
            aria-hidden='true'
            size={24}
          />
          <span
            className={`text-sm font-medium ${isTextSelected ? 'text-blue-700' : ' group-hover:text-gray-500'}`}
          >
            {t('Text')}
          </span>
        </button>
        {/* Add button for IMAGE if you plan to support it
        <button
          type='button'
          onClick={() => onModalityChange(SDKModality.IMAGE)}
          // ...
        >
          Image
        </button>
        */}
      </div>
    </div>
  );
};

export default OutputFormatSelector;