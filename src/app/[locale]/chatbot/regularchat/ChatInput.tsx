// src/app/[locale]/chatbot/chat/regularchat/ChatInput.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import Button from '../../utils/Button';
import { GrSend } from 'react-icons/gr';
import { BsCheckLg } from 'react-icons/bs';
import { Paperclip, X as LucideX } from 'lucide-react'; // Added Paperclip and X for files
import { useTranslations } from 'next-intl';

// Define accepted file types and max size (examples, adjust as needed)
const ACCEPTED_FILE_TYPES = "image/jpeg,image/png,application/pdf,text/csv";
const MAX_FILE_SIZE_MB = 10; // Example: 10MB
const MAX_TOTAL_FILES = 5; // Example: Max 5 files

interface ChatInputProps {
  // onSendMessage: (message: string) => void; // Will be replaced or augmented
  onSendFilesAndMessage: (message: string, files: File[]) => void; // <<< NEW PROP for sending text and files
  onRegisterFillFunction: (fillFunc: (text: string) => void) => void;
  disabled?: boolean;
  isEditing?: boolean;
  initialEditText?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendFilesAndMessage,
  onRegisterFillFunction,
  disabled = false,
  isEditing = false,
  initialEditText = '',
}) => {
  const t = useTranslations();

  const [inputValue, setInputValue] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fillFunc = (text: string) => {
      if (!disabled) {
        setInputValue(text);
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
  }, [onRegisterFillFunction, disabled]);

  useEffect(() => {
    if (isEditing) {
      setInputValue(initialEditText);
      setSelectedFiles([]); // Clear files when starting an edit
      inputRef.current?.focus();
    }
  }, [isEditing, initialEditText]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!disabled) {
        setInputValue(e.target.value);
      }
    },
    [disabled]
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      let validFiles: File[] = [];
      let alertShown = false;

      newFiles.forEach(file => {
        if (selectedFiles.length + validFiles.length >= MAX_TOTAL_FILES) {
          if (!alertShown) {
            alert(t('ChatInput_Error_MaxFiles', { max: MAX_TOTAL_FILES }));
            alertShown = true;
          }
          return;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          if (!alertShown) {
            alert(t('ChatInput_Error_FileSize', { name: file.name, maxSize: MAX_FILE_SIZE_MB }));
            alertShown = true;
          }
          return;
        }
        // Add more specific type checks if ACCEPTED_FILE_TYPES string isn't enough for browser
        validFiles.push(file);
      });

      setSelectedFiles(prevFiles => [...prevFiles, ...validFiles].slice(0, MAX_TOTAL_FILES));
      // Reset file input to allow selecting the same file again if removed
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
      if (!isEditing) {
        setInputValue('');
        setSelectedFiles([]);
        if (inputRef.current) {
          inputRef.current.style.height = 'auto';
        }
      }
    }
  }, [inputValue, selectedFiles, onSendFilesAndMessage, disabled, isEditing, t]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (disabled) return;
      if (e.key === 'Enter' && !e.shiftKey) {
        // Prevent sending if only files are attached and enter is pressed (optional, depends on desired UX)
        // if (inputValue.trim() || selectedFiles.length > 0) {
        // }
        e.preventDefault();
        handleSendMessageInternal();
      }
    },
    [handleSendMessageInternal, disabled]
  );

  const placeholderText = t('Type_message_or_attach_files');
  const buttonAriaLabel = isEditing ? t('Update_message') : t('Send_message');

  return (
    <div className='flex flex-col'>
      {/* Selected files preview */}
      {selectedFiles.length > 0 && !isEditing && (
        <div className="mb-2 flex flex-wrap gap-2 px-1 py-1 border-b border-gray-200 dark:border-gray-600 max-h-24 overflow-y-auto">
          {selectedFiles.map(file => (
            <div
              key={file.name}
              className="flex items-center gap-1.5 rounded-md bg-gray-100 dark:bg-gray-600 px-2 py-1 text-xs text-gray-700 dark:text-gray-200"
            >
              <span>{file.name.length > 20 ? `${file.name.substring(0, 17)}...` : file.name}</span>
              <button
                onClick={() => handleRemoveFile(file.name)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={t('ChatInput_Remove_File', { fileName: file.name })}
              >
                <LucideX size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={`flex w-full items-end rounded-2xl bg-white px-1 py-0.5 shadow-sm transition-all duration-200 ease-in-out focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 dark:bg-gray-700 dark:focus-within:border-blue-400 ${selectedFiles.length > 0 && !isEditing ? 'rounded-b-2xl rounded-t-none' : 'rounded-2xl'}`}>
        {!isEditing && ( // Disable file attachment when editing a text message
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
        )}
        <input
          type="file"
          multiple
          accept={ACCEPTED_FILE_TYPES}
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || isEditing || selectedFiles.length >= MAX_TOTAL_FILES}
        />
        <TextareaAutosize
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          className={`
             max-h-28 flex-grow resize-none overflow-y-auto rounded-l-2xl
            bg-transparent px-1.5 py-1 text-sm text-gray-800
            focus:border-transparent focus:outline-none disabled:cursor-not-allowed
            disabled:bg-gray-100 dark:text-gray-100 dark:placeholder-gray-400 dark:disabled:bg-gray-600
            ${isEditing ? 'rounded-r-2xl' : ''} 
          `}
          rows={1}
          disabled={disabled}
        />
        <Button
          variant={isEditing ? 'primary' : 'secondary'}
          size='mini'
          rounded={true}
          onClick={handleSendMessageInternal}
          disabled={disabled || (!inputValue.trim() && selectedFiles.length === 0)}
          aria-label={buttonAriaLabel}
          className='mb-0.5 ml-1.5 mr-0.25 flex-shrink-0 '
        >
          {isEditing ? (
            <BsCheckLg size={12} className='h-4 w-4' />
          ) : (
            <GrSend size={12} className='h-4 w-4' />
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;