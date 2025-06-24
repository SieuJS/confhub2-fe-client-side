// src/app/[locale]/addconference/inputs/callForPaperInput.tsx
'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import clsx from 'clsx'
import { FileText } from 'lucide-react'

// *** THAY ĐỔI 1: CẬP NHẬT INTERFACE ***
interface callForPaperInputProps {
  value: string
  onChange: (value: string) => void
  onBlur: () => void // Thêm onBlur
  isTouched: boolean // Thêm isTouched
  maxLength: number
  t: (key: string) => string
  error?: string | null
  required?: boolean // Thêm prop này để xử lý dấu *
}

const callForPaperInput: React.FC<callForPaperInputProps> = ({
  value,
  onChange,
  onBlur, // Nhận onBlur
  isTouched, // Nhận isTouched
  maxLength,
  t,
  error,
  required
}) => {
  const characterCount = value.length
  // *** THAY ĐỔI 2: TẠO BIẾN `showError` ***
  // Lỗi chỉ hiển thị khi trường có lỗi VÀ đã được "touch"
  const showError = !!error && isTouched

  return (
    <div className='sm:col-span-6'>
      <div className='mb-1 flex items-center justify-between'>
        <label htmlFor='callForPaper' className='block text-sm font-medium '>
          <div className='flex items-center'>
            <FileText className='mr-2 h-4 w-4 ' />
            {required && <span className='text-red-500'>* </span>}
            {t('Call_for_paper')}
          </div>
        </label>
        <span
          className={clsx(
            'text-sm',
            characterCount > maxLength ? 'text-red-600' : ''
          )}
        >
          {characterCount} / {maxLength}
        </span>
      </div>

      <div className='mt-2 grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Cột trái: Textarea */}
        <div>
          <textarea
            id='callForPaper'
            value={value}
            onChange={e => onChange(e.target.value)}
            onBlur={onBlur} // *** THAY ĐỔI 3: GẮN SỰ KIỆN onBlur ***
            rows={15}
            className={clsx(
              'block w-full rounded-md p-2 font-mono shadow-sm sm:text-sm',
              // *** THAY ĐỔI 4: SỬ DỤNG `showError` ĐỂ QUYẾT ĐỊNH STYLE ***
              showError
                ? 'border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            )}
            placeholder={t('Write_your_Call_for_paper_here')}
            aria-invalid={showError}
            aria-describedby={showError ? 'callForPaper-error' : undefined}
            spellCheck='false'
          />
        </div>

        {/* Cột phải: Preview */}
        <div className='h-full overflow-auto rounded-md border border-gray-200 bg-gray-10 p-3'>
          <div className='prose prose-sm max-w-none [&_*]:text-[var(--primary)]'>
            <ReactMarkdown>
              {value || t('Markdown_preview_will_appear_here')}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* *** THAY ĐỔI 5: SỬ DỤNG `showError` ĐỂ HIỂN THỊ LỖI *** */}
      {showError ? (
        <p id='callForPaper-error' className='mt-2 text-sm text-red-600'>
          {error}
        </p>
      ) : (
        <p className='mt-2 text-xs '>
          {t('Markdown_is_supported_for_rich_text_formatting')}
        </p>
      )}
    </div>
  )
}

export default callForPaperInput
