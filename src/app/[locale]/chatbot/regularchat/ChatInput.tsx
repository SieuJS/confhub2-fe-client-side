// src/app/[locale]/chatbot/regularchat/ChatInput.tsx
import React, { useRef, useEffect, useCallback } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import Button from '../../utils/Button';
import { GrSend } from 'react-icons/gr';
import { Paperclip, X as LucideX, FileText, ImageIcon, AlertTriangle } from 'lucide-react'; // Added FileText, ImageIcon
import { useTranslations } from 'next-intl';

const ACCEPTED_FILE_TYPES = "image/jpeg,image/png,application/pdf,text/csv";
const MAX_FILE_SIZE_MB = 50; // <--- ĐIỀU CHỈNH TẠI ĐÂY
const MAX_TOTAL_FILES = 5;

interface ChatInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendFilesAndMessage: (message: string, files: File[]) => void;
  onRegisterFillFunction: (fillFunc: (text: string) => void) => void;
  disabled?: boolean;
}

// Helper to get a simple icon based on MIME type
const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return <ImageIcon size={24} className="text-gray-500 dark:text-gray-400" />;
  if (mimeType === 'application/pdf') return <FileText size={24} className="text-blue-500 dark:text-blue-400" />;
  // Add more icons for CSV, etc. if needed
  return <Paperclip size={24} className="text-gray-500 dark:text-gray-400" />; // Default
};


const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  onInputChange,
  onSendFilesAndMessage,
  onRegisterFillFunction,
  disabled = false,
}) => {
  const t = useTranslations();
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fillFunc = (text: string) => {
      if (!disabled) {
        onInputChange(text);
        setTimeout(() =>
          inputRef.current?.dispatchEvent(new Event('input', { bubbles: true })),
          0
        );
        inputRef.current?.focus();
      }
    };
    if (onRegisterFillFunction) {
      onRegisterFillFunction(fillFunc);
    }
  }, [onRegisterFillFunction, disabled, onInputChange]);

  const handleInputChangeInternal = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!disabled) {
        onInputChange(e.target.value);
      }
    },
    [disabled, onInputChange]
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      let validFiles: File[] = [];
      let alertShownForSize = false; // Flag for file size alert
      let alertShownForMaxFiles = false; // Flag for max files alert

      newFiles.forEach(file => {
        if (selectedFiles.length + validFiles.length >= MAX_TOTAL_FILES) {
          if (!alertShownForMaxFiles) {
            alert(t('ChatInput_Error_MaxFiles', { max: MAX_TOTAL_FILES }));
            alertShownForMaxFiles = true;
          }
          return;
        }
        // Kiểm tra kích thước file
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          if (!alertShownForSize) {
            alert(t('ChatInput_Error_FileSize', { name: file.name, maxSize: MAX_FILE_SIZE_MB }));
            alertShownForSize = true;
          }
          return;
        }
        validFiles.push(file);
      });

      setSelectedFiles(prevFiles => [...prevFiles, ...validFiles].slice(0, MAX_TOTAL_FILES));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setSelectedFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
  };

  const handleSendMessageInternal = useCallback(() => {
    const trimmedMessage = inputValue.trim();
    if (!disabled && (trimmedMessage || selectedFiles.length > 0)) {
      onSendFilesAndMessage(trimmedMessage, selectedFiles);
      setSelectedFiles([]); // Clear selected files locally after initiating send
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  }, [inputValue, selectedFiles, onSendFilesAndMessage, disabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (disabled) return;
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessageInternal();
      }
    },
    [handleSendMessageInternal, disabled]
  );

  const placeholderText = t('Type_message_or_attach_files');
  const buttonAriaLabel = t('Send_message');

  return (
    <div className='flex flex-col'>
      {/* Enhanced Selected files preview - similar to user's image */}
      {selectedFiles.length > 0 && (
        <div className="mb-2 p-3 border bg-gray-50 dark:bg-gray-700 rounded-t-lg max-h-48 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {selectedFiles.map(file => (
              <div
                key={file.name}
                className="relative flex flex-col items-center justify-center p-2 border rounded-md shadow-sm bg-white dark:bg-gray-600 dark:border-gray-500"
              >
                <button
                  onClick={() => handleRemoveFile(file.name)}
                  className="absolute top-1 right-1 p-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10"
                  aria-label={t('ChatInput_Remove_File', { fileName: file.name })}
                >
                  <LucideX size={12} />
                </button>
                <div className="flex-shrink-0 mb-1.5">
                  {getFileIcon(file.type)}
                </div>
                <span className="text-xs text-center text-gray-700 dark:text-gray-200 break-all w-full px-1">
                  {file.name.length > 30 ? `${file.name.substring(0, 27)}...` : file.name}
                </span>
                <span className="text-xxs text-gray-500 dark:text-gray-400 mt-0.5">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
                {/* 
                  Placeholder for "Extracting..." or token count if you implement that.
                  This would require more complex state management, possibly from useChatInteractions.
                  For now, this part is omitted until backend provides such info during pre-send.
                */}
                {/* {disabled && <span className="text-xxs text-blue-500 dark:text-blue-400 mt-0.5">Processing...</span>} */}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`flex w-full items-end bg-white px-1 py-0.5 shadow-sm transition-all duration-200 ease-in-out focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 dark:bg-gray-700 dark:focus-within:border-blue-400 ${selectedFiles.length > 0 ? 'rounded-b-2xl rounded-t-none border-t-0' : 'rounded-2xl'}`}>
        <Button
          variant='secondary'
          size='small'
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || selectedFiles.length >= MAX_TOTAL_FILES}
          aria-label={t('ChatInput_Attach_File_Button_Label')}
          className='ml-0.25 rounded-xl mr-1.5 mb-0.5 flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        >
          <Paperclip size={16} />
        </Button>
        <input
          type="file"
          multiple
          accept={ACCEPTED_FILE_TYPES}
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || selectedFiles.length >= MAX_TOTAL_FILES}
        />
        <TextareaAutosize
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChangeInternal}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          className={`
             max-h-28 flex-grow resize-none overflow-y-auto 
            bg-transparent px-1.5 py-1 text-sm text-gray-800
            focus:border-transparent focus:outline-none disabled:cursor-not-allowed
            disabled:bg-gray-100 dark:text-gray-100 dark:placeholder-gray-400 dark:disabled:bg-gray-600
            ${selectedFiles.length > 0 ? 'rounded-l-none' : 'rounded-l-2xl'} 
          `}
          rows={1}
          disabled={disabled}
        />
        <Button
          variant={'secondary'}
          size='mini'
          rounded={true}
          onClick={handleSendMessageInternal}
          disabled={disabled || (!inputValue.trim() && selectedFiles.length === 0)}
          aria-label={buttonAriaLabel}
          className='mb-0.5 ml-1.5 mr-0.25 flex-shrink-0 '
        >
          <GrSend size={12} className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;