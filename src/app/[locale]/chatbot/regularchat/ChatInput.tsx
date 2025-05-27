// src/app/[locale]/chatbot/chat/regularchat/ChatInput.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import Button from '../../utils/Button'; // Assuming this is your custom Button component
import { GrSend } from 'react-icons/gr';
import { BsCheckLg } from 'react-icons/bs'; // Using Bootstrap Check icon as an example
// Hoặc nếu bạn muốn dùng lucide-react cho nhất quán:
// import { SendHorizonal, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ChatInputProps {
  onSendMessage: (message: string) => void; // This will handle both send and update
  onRegisterFillFunction: (fillFunc: (text: string) => void) => void;
  disabled?: boolean;
  isEditing?: boolean;      // <<< NEW PROP
  initialEditText?: string; // <<< NEW PROP
  // onCancelEdit?: () => void; // Optional: if ChatInput had its own cancel button
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onRegisterFillFunction,
  disabled = false,
  isEditing = false,      // <<< DESTRUCTURE
  initialEditText = '', // <<< DESTRUCTURE
}) => {
  const t = useTranslations();

  const [inputValue, setInputValue] = useState<string>('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    if (onRegisterFillFunction) { // Make sure onRegisterFillFunction is provided
        onRegisterFillFunction(fillFunc);
    }
  }, [onRegisterFillFunction, disabled]);

  // Effect to populate input when edit mode starts or initial text changes
  useEffect(() => {
    if (isEditing) {
      setInputValue(initialEditText);
      // Focus and potentially select text for easier editing
      inputRef.current?.focus();
      // inputRef.current?.select(); // Uncomment if you want text to be selected
    } else {
      // If not editing and inputValue is from a previous edit session that was cancelled
      // by sending a new message, inputValue might still hold the old edit text.
      // We clear it here ONLY IF it wasn't an explicit cancellation that kept the text.
      // For simplicity, if `isEditing` becomes false, and the parent didn't intend to keep
      // the `initialEditText` (e.g., by setting it to the current input), we clear.
      // However, `RegularChat` controls `initialEditText`. If `isEditing` is false,
      // `initialEditText` will likely be `''`.
      // This effect mainly handles setting the text when `isEditing` becomes true.
      // When `isEditing` becomes false, `RegularChat` will pass `initialEditText=""`
      // (unless user sends a new message while editing, then this component resets inputValue via handleSendMessage).
      if (!isEditing && inputValue !== '' && inputValue === initialEditText) {
         // This condition is a bit tricky. If `RegularChat` resets `initialEditText` to `''`
         // when `isEditing` becomes `false`, then `inputValue` should also become `''`.
         // The current logic in `handleSendMessage` clears `inputValue` only if `!isEditing`.
         // This should be sufficient.
      }
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

  const handleSendMessageInternal = useCallback(() => {
    const trimmedMessage = inputValue.trim();
    if (!disabled && trimmedMessage) {
      onSendMessage(trimmedMessage); // Parent (RegularChat) handles clearing editing state
                                     // or resetting input based on `isEditing` prop change.
      if (!isEditing) {
        // Only clear input if sending a NEW message.
        // If editing, the parent will change `isEditing` prop, which will
        // trigger the useEffect above to potentially reset the input via `initialEditText`.
        setInputValue('');
        if (inputRef.current) {
          inputRef.current.style.height = 'auto'; // Reset height for new messages
        }
      }
    }
  }, [inputValue, onSendMessage, disabled, isEditing]); // <<< ADD isEditing dependency

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (disabled) return;
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessageInternal();
      }
    },
    [handleSendMessageInternal, disabled] // <<< Use internal handler
  );

  const placeholderText = t('Type_message_short');

  const buttonAriaLabel = isEditing ? t('Update_message') : t('Send_message'); // <<< Key for update button

  return (
    <div className='flex w-full items-end rounded-2xl bg-white px-1 py-0.5 shadow-sm transition-all duration-200 ease-in-out focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 dark:bg-gray-700 dark:focus-within:border-blue-400'>
      <TextareaAutosize
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholderText}
        className={`
           max-h-28 flex-grow resize-none overflow-y-auto rounded-2xl
          bg-transparent px-1.5 py-1 text-sm text-gray-800
          focus:border-transparent focus:outline-none disabled:cursor-not-allowed
          disabled:bg-gray-100 dark:text-gray-100 dark:placeholder-gray-400 dark:disabled:bg-gray-600
        `}
        rows={1}
        disabled={disabled}
      />
      <Button
        variant={isEditing ? 'primary' : 'secondary'} // <<< Change variant for visual cue
        size='mini'
        rounded={true}
        onClick={handleSendMessageInternal} // <<< Use internal handler
        disabled={disabled || !inputValue.trim()}
        aria-label={buttonAriaLabel}
        className='mb-0.5 ml-1.5 flex-shrink-0 '
      >
        {isEditing ? (
          <BsCheckLg size={12} className='h-4 w-4' /> // <<< Check icon for update
        ) : (
          <GrSend size={12} className='h-4 w-4' /> // Send icon
        )}
      </Button>
    </div>
  );
};

export default ChatInput;