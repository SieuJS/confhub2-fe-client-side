'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import clsx from 'clsx';
import { NotebookText } from 'lucide-react'; // Sử dụng icon khác cho phù hợp

interface SummaryInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  isTouched: boolean;
  maxLength: number;
  t: (key: string) => string;
  error?: string | null;
  required?: boolean; // Thêm prop này để xử lý dấu *
}

const SummaryInput: React.FC<SummaryInputProps> = ({
  value,
  onChange,
  onBlur,
  isTouched,
  maxLength,
  t,
  error,
  required, // Mặc định là không bắt buộc
}) => {
  const characterCount = value.length;
  const showError = !!error && isTouched;

  return (
    <div className="sm:col-span-6">
      <div className="flex justify-between items-center mb-1">
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
          <div className="flex items-center">
            <NotebookText className="h-4 w-4 mr-2 text-gray-500" />
            {required && <span className="text-red-500">* </span>}
            {t('Summary')}
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
            id="summary"
            name="summary" // Thêm name
            value={value}
            onChange={e => onChange(e.target.value)}
            onBlur={onBlur}
            rows={10} // Có thể giảm số dòng so với Call for Papers
            className={clsx(
              'p-2 block w-full rounded-md shadow-sm sm:text-sm font-mono',
              showError
                ? 'border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            )}
            placeholder={t('Write_a_brief_summary_of_the_conference')}
            aria-invalid={showError}
            aria-describedby={showError ? 'summary-error' : undefined}
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

      {showError ? (
        <p id="summary-error" className="mt-2 text-sm text-red-600">{error}</p>
      ) : (
        <p className="mt-2 text-xs text-gray-500">
          {t('Markdown_is_supported_for_rich_text_formatting_brief')}
        </p>
      )}
    </div>
  );
};

export default SummaryInput;