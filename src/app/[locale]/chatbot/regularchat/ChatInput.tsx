// src/app/[locale]/chatbot/regularchat/ChatInput.tsx
import React, { useRef, useEffect, useCallback, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import Button from '../../utils/Button';
import { GrSend } from 'react-icons/gr';
import { Paperclip, FileText, ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePageContextStore } from '@/src/app/[locale]/chatbot/stores/pageContextStore';
import {
  CURRENT_PAGE_CONTEXT_COMMAND,
  CURRENT_PAGE_CONTEXT_DISABLED_TEXT_KEY
} from '@/src/app/[locale]/chatbot/lib/constants';
import { Tooltip } from 'react-tooltip';

// ... (Các hằng số, icon, và utility function giữ nguyên) ...
export const ACCEPTED_FILE_TYPES = 'image/jpeg,image/png,application/pdf,text/csv'
export const MAX_FILE_SIZE_MB = 50
export const MAX_TOTAL_FILES = 5

const SpinnerIcon = () => (
  <svg
    className='h-5 w-5 animate-spin text-white'
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
  >
    <circle
      className='opacity-25'
      cx='12'
      cy='12'
      r='10'
      stroke='currentColor'
      strokeWidth='4'
    ></circle>
    <path
      className='opacity-100'
      fill='currentColor'
      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
    ></path>
  </svg>
);

export const getFileIcon = (mimeType: string): React.ReactNode => {
  if (mimeType.startsWith('image/')) return <ImageIcon size={24} className='' />;
  if (mimeType === 'application/pdf')
    return <FileText size={24} className='text-blue-500 dark:text-blue-400' />;
  return <Paperclip size={24} className='' />;
};


export interface ChatInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendFilesAndMessage: (message: string, files: File[], shouldUsePageContext: boolean) => void;
  disabled?: boolean;
  onRegisterFillFunction: (fillInputCallback: (text: string) => void) => void;
  isSmallContext?: boolean;
  onSetContextMessage: (message: string | null) => void;
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFile: (fileName: string) => void;
  showAlertDialog: (title: string, message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  onInputChange,
  onSendFilesAndMessage,
  disabled = false,
  onRegisterFillFunction,
  isSmallContext = false,
  onSetContextMessage,
  selectedFiles,
  setSelectedFiles,
  handleFileChange,
  showAlertDialog,
}) => {
  const t = useTranslations();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const {
    isCurrentPageFeatureEnabled,
    isContextAttachedNextSend,
    toggleContextAttachedNextSend,
    // <<< THAY ĐỔI: Không cần resetContextAttachedNextSend ở đây nữa >>>
    // resetContextAttachedNextSend // Loại bỏ
  } = usePageContextStore();

  // ... (Các hooks useEffect, handleInputChangeInternal giữ nguyên) ...
  useEffect(() => {
    const fillFunc = (text: string) => {
      if (disabled) return;
      onInputChange(text);
      setTimeout(() => inputRef.current?.dispatchEvent(new Event('input', { bubbles: true })), 0);
      inputRef.current?.focus();
    };
    if (onRegisterFillFunction) {
      onRegisterFillFunction(fillFunc);
    }
  }, [onRegisterFillFunction, disabled, onInputChange]);

  const handleInputChangeInternal = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (disabled) return;
    onInputChange(e.target.value);
  }, [disabled, onInputChange]);


  const handleSendMessageInternal = useCallback(() => {
    const commandPattern = new RegExp(CURRENT_PAGE_CONTEXT_COMMAND.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*', 'g');
    const messageToSend = inputValue.replace(commandPattern, '').trim();
    const shouldUseContext = isContextAttachedNextSend && isCurrentPageFeatureEnabled;

    if (!disabled && (messageToSend || selectedFiles.length > 0 || shouldUseContext)) {
      onSendFilesAndMessage(messageToSend, selectedFiles, shouldUseContext);
      setSelectedFiles([]);
      onInputChange('');
      
      // <<< THAY ĐỔI QUAN TRỌNG: Vô hiệu hóa dòng này >>>
      // resetContextAttachedNextSend(); // KHÔNG reset trạng thái context nữa
      
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  }, [inputValue, selectedFiles, onSendFilesAndMessage, disabled, isCurrentPageFeatureEnabled, isContextAttachedNextSend, onInputChange, setSelectedFiles]);

  // ... (Các hàm handleKeyDown, handlePaste, handleDragOver, handleDragLeave, handleDrop, handleToggleContext giữ nguyên) ...
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessageInternal();
    }
  }, [handleSendMessageInternal, disabled]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const blob = item.getAsFile();
        if (blob) {
          const now = new Date();
          const fileName = `pasted_image_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}_${now.getMilliseconds().toString().padStart(3, '0')}.png`;
          const pastedFile = new File([blob], fileName, { type: blob.type });

          setSelectedFiles(prevFiles => {
            const isDuplicate = prevFiles.some(
              f => f.name === pastedFile.name && f.size === pastedFile.size && f.type === pastedFile.type
            );
            if (isDuplicate) {
              return prevFiles;
            }
            if (prevFiles.length >= MAX_TOTAL_FILES) {
              showAlertDialog(t('File_Upload_Error'), t('File_Upload_MaxFilesExceeded', { maxFiles: MAX_TOTAL_FILES }));
              return prevFiles;
            }
            return [...prevFiles, pastedFile];
          });
        }
      }
    }
  }, [disabled, setSelectedFiles, showAlertDialog, t]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragActive(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    const currentFilesCount = selectedFiles.length;
    const newFilesToAdd: File[] = [];

    for (const file of droppedFiles) {
      if (!ACCEPTED_FILE_TYPES.split(',').includes(file.type)) {
        showAlertDialog(t('File_Upload_Error'), t('File_Upload_InvalidType', { fileName: file.name }));
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        showAlertDialog(t('File_Upload_Error'), t('File_Upload_TooLarge', { fileName: file.name, maxSize: MAX_FILE_SIZE_MB }));
        continue;
      }
      if (currentFilesCount + newFilesToAdd.length >= MAX_TOTAL_FILES) {
        showAlertDialog(t('File_Upload_Error'), t('File_Upload_MaxFilesExceeded', { maxFiles: MAX_TOTAL_FILES }));
        break;
      }
      if (selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
        continue;
      }
      newFilesToAdd.push(file);
    }

    if (newFilesToAdd.length > 0) {
      setSelectedFiles(prevFiles => [...prevFiles, ...newFilesToAdd]);
    }
  }, [disabled, selectedFiles, setSelectedFiles, showAlertDialog, t]);

  const handleToggleContext = () => {
    if (!isCurrentPageFeatureEnabled) {
        onSetContextMessage(t(CURRENT_PAGE_CONTEXT_DISABLED_TEXT_KEY));
        setTimeout(() => onSetContextMessage(null), 3000);
        return;
    }
    toggleContextAttachedNextSend();
  }

  const placeholderText = isSmallContext ? t('Type_message_or_attach_files_floating') : t('Type_message_or_attach_files');
  const buttonAriaLabel = t('Send_message');
  const inputWrapperClass = `flex w-full items-center gap-2 ${isDragActive ? 'border-blue-500 ring-2 ring-blue-500' : ''}`;

  return (
    // ... (JSX giữ nguyên) ...
    <div className='w-full'>
      <div
        ref={inputContainerRef}
        onPaste={handlePaste}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={inputWrapperClass}
      >
        <Button
          variant='secondary'
          size='small'
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || selectedFiles.length >= MAX_TOTAL_FILES}
          aria-label={t('ChatInput_Attach_File_Button_Label')}
          className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-600 sm:h-9 sm:w-9'
          data-tooltip-id='attach-file-tooltip'
          data-tooltip-content={t('Attach_files')}
          rounded
        >
          <Paperclip size={18} className="sm:h-5 sm:w-5" />
        </Button>
        <input
          type='file'
          multiple
          accept={ACCEPTED_FILE_TYPES}
          ref={fileInputRef}
          onChange={handleFileChange}
          className='hidden'
          disabled={disabled || selectedFiles.length >= MAX_TOTAL_FILES}
        />

        {isSmallContext && (
          <Button
            variant='secondary'
            size='small'
            onClick={handleToggleContext}
            disabled={disabled}
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:w-9 ${isContextAttachedNextSend && isCurrentPageFeatureEnabled
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600'
              }`}
            aria-label={t('Use_page_context')}
            data-tooltip-id='page-context-tooltip'
            data-tooltip-content={isContextAttachedNextSend ? t('Using_page_context') : t('Use_page_context')}
            rounded
          >
            <FileText size={16} className='h-4 w-4 sm:h-5 sm:w-5' />
          </Button>
        )}

        <TextareaAutosize
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChangeInternal}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          className={`min-h-[32px] pt-1.75 w-full flex-grow resize-none self-center bg-transparent px-2 py-1.5 align-middle text-sm text-gray-900 outline-none disabled:cursor-not-allowed dark:text-gray-100 placeholder:truncate sm:min-h-[36px]`}
          rows={1}
          maxRows={5}
          disabled={disabled}
          spellCheck="false"
        />

        <Button
          variant={'primary'}
          size='small'
          onClick={handleSendMessageInternal}
          disabled={disabled || (!inputValue.trim() && selectedFiles.length === 0 && !isContextAttachedNextSend)}
          aria-label={buttonAriaLabel}
          className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400 dark:disabled:bg-gray-800 sm:h-9 sm:w-9'
          data-tooltip-id='send-message-tooltip'
          data-tooltip-content={buttonAriaLabel}
          rounded
        >
          {disabled ? <SpinnerIcon /> : <GrSend size={14} className='h-3.5 w-3.5 sm:h-4 sm:w-4' />}
        </Button>
      </div>

      <Tooltip id="attach-file-tooltip" place="top" />
      <Tooltip id="page-context-tooltip" place="top" />
      <Tooltip id="send-message-tooltip" place="top" />
    </div>
  )
}

export default ChatInput;