import React, { useState, useRef, useEffect, useCallback } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import Button from '../utils/Button';
import ControlTray from './live-chat/components/control-tray/ControlTray'; // Import ControlTray

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    onFillInput?: (fillInputCallback: (text: string) => void) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onFillInput }) => {
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
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    }, [message, onSendMessage]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.ctrlKey) {
          setMessage(prevMessage => prevMessage + '\n');
          e.preventDefault();
      } else if (e.key === 'Enter' && e.ctrlKey) {
          handleSendMessage();
          e.preventDefault();
      }
  }, [handleSendMessage]);

    const handleFocus = useCallback(() => {
        setIsFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
    }, []);

    const chatInputContainerStyle = {
      display: "flex",
      alignItems: "center",
      padding: "0.5rem",
      borderRadius: "9999px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      border: isFocused ? "2px solid #6366F1" : "1px solid #D1D5DB",
    };

    const inputFieldStyle = {
      flexGrow: 1,
      padding: "0.5rem",
      borderRadius: "0.375rem",
      backgroundColor: "transparent",
      outline: "none",
      border: "none",
      color: "#4B5563",
      fontSize: "1rem",
      lineHeight: "1.5rem",
    };

    const sendButtonStyle = {
      marginLeft: "0.5rem",
    };

    return (
        <div className="chat-input-container bg-gray-100" style={chatInputContainerStyle}>
            {/* Control Tray (Left) */}
            <ControlTray />

            {/* Text Input (Center) */}
            <TextareaAutosize
                className="input-field"
                placeholder="Nhập tin nhắn..."
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                ref={inputRef}
                rows={1}
                style={{...inputFieldStyle, resize: 'none' }}
                onFocus={handleFocus}
                onBlur={handleBlur}
            />

            {/* Send Button (Right) */}
            <Button
                variant="primary"
                size="large"
                rounded={true}
                onClick={handleSendMessage}
                className="send-button"
                style={sendButtonStyle}
            >
                Gửi
            </Button>
        </div>
    );
};

export default ChatInput;
