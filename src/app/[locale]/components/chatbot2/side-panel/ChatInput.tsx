// ChatInput.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import Button from '../../utils/Button';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFillInput?: (fillInputCallback: (text: string) => void) => void;
  disabled?: boolean; // Add the disabled prop
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onFillInput, disabled = false }) => { // Add disabled with default
  const [message, setMessage] = useState<string>('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  useEffect(() => {
    const handleFill = (text: string) => {
      setMessage(text);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    if (onFillInput) {
      onFillInput(handleFill);
    }
  }, [onFillInput]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  }, []);

  const handleSendMessage = useCallback(() => {
    if (message.trim() && !disabled) { // Check disabled here too
      onSendMessage(message);
      setMessage('');
    }
  }, [message, onSendMessage, disabled]); // Add disabled to dependency array

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (disabled) { // Prevent key presses if disabled
        e.preventDefault();
        return;
    }

    if (e.key === 'Enter' && !e.ctrlKey) {
        setMessage(prevMessage => prevMessage + '\n');
        e.preventDefault();
    } else if (e.key === 'Enter' && e.ctrlKey) {
        handleSendMessage();
        e.preventDefault();
    }
}, [handleSendMessage, disabled]); // Add disabled to the dependency array


  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);



  return (
    <div className="flex-grow flex rounded-full focus-within:border-blue-500" >
      <TextareaAutosize
        className="flex-grow px-4 p-4 text-gray-900 bg-transparent outline-none resize-none"
        placeholder="Nhập tin nhắn..."
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        rows={1}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled} // Apply disabled to TextareaAutosize
      />
      <Button
          variant="primary"
          size="medium"
          rounded={true}
          onClick={handleSendMessage}
          className="text-blue-500 hover:bg-gray-600 p-2 m-1"
          style={{minWidth: '36px'}}
          disabled={disabled} // Apply disabled to the Button

      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
          />
        </svg>
      </Button>
    </div>
  );
};

export default ChatInput;