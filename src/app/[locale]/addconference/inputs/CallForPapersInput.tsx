// src/app/[locale]/addconference/inputs/CallForPapersInput.tsx
'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import clsx from 'clsx';
import { FileText } from 'lucide-react'; // Import icon

interface CallForPapersInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  t: (key: string) => string;
  error?: string | null;
}

const CallForPapersInput: React.FC<CallForPapersInputProps> = ({
  value,
  onChange,
  maxLength,
  t,
  error,
}) => {
  const characterCount = value.length;

  return (
    <div className="sm:col-span-6">
      <div className="flex justify-between items-center mb-1"> {/* Điều chỉnh mb-1 để có khoảng cách tốt hơn */}
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          <div className="flex items-center"> {/* Flex container cho icon và label text */}
            <FileText className="h-4 w-4 mr-2 text-gray-500" /> {/* Icon */}
            {<span className="text-red-500">* </span>}
            {t('Call_for_Papers')}
          </div>
        </label>
        <span
          className={clsx(
            'text-sm',
            characterCount > maxLength ? 'text-red-600' : 'text-gray-500'
          )}
        >
          {characterCount} / {maxLength}
        </span>
      </div>

      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cột trái: Textarea */}
        <div>
          <textarea
            id="description"
            value={value}
            onChange={e => onChange(e.target.value)}
            rows={15}
            className={clsx(
              'p-2 block w-full rounded-md shadow-sm sm:text-sm font-mono',
              error
                ? 'border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            )}
            placeholder={t('Write_your_call_for_papers_here')}
            aria-invalid={!!error}
            aria-describedby={error ? 'description-error' : undefined}
            spellCheck="false"
          />
        </div>

        {/* Cột phải: Preview */}
        <div className="h-full rounded-md border border-gray-200 bg-gray-10 p-3 overflow-auto">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{value || t('Markdown_preview_will_appear_here')}</ReactMarkdown>
          </div>
        </div>
      </div>

      {error ? (
        <p id="description-error" className="mt-2 text-sm text-red-600">{error}</p>
      ) : (
        <p className="mt-2 text-xs text-gray-500">
          {t('Markdown_is_supported_for_rich_text_formatting')}
        </p>
      )}
    </div>
  );
};

export default CallForPapersInput;