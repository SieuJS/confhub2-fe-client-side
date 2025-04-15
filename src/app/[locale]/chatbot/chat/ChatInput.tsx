// components/ChatInput.tsx

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react'; // Import CSSProperties
import TextareaAutosize from 'react-textarea-autosize';
import Button from '../../utils/Button'; // Assuming Button component handles its own disabled styling

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    onFillInput?: (fillInputCallback: (text: string) => void) => void;
    disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
    onSendMessage,
    onFillInput,
    disabled = false
}) => {
    const [message, setMessage] = useState<string>('');
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [isFocused, setIsFocused] = useState<boolean>(false);

    useEffect(() => {
        const handleFill = (text: string) => {
            if (!disabled) {
                setMessage(text);
                inputRef.current?.focus(); // Optional chaining for safety
            }
        };

        if (onFillInput) {
            onFillInput(handleFill);
        }
    }, [onFillInput, disabled]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!disabled) {
           setMessage(e.target.value);
        }
    }, [disabled]);

    const handleSendMessage = useCallback(() => {
        const trimmedMessage = message.trim();
        if (!disabled && trimmedMessage) {
            onSendMessage(trimmedMessage); // Send trimmed message
            setMessage('');
        }
    }, [message, onSendMessage, disabled]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
       if (disabled) return;

       // Send on Enter (unless Shift is pressed)
       if (e.key === 'Enter' && !e.shiftKey) {
           e.preventDefault();
           handleSendMessage();
       }
       // Note: Ctrl+Enter is not standard for sending; removed unless specifically required.
       // Default behavior allows Shift+Enter for newlines in TextareaAutosize.
   }, [handleSendMessage, disabled]);

    const handleFocus = useCallback(() => {
        if (!disabled) {
           setIsFocused(true);
        }
    }, [disabled]);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
    }, []);

    // --- Style Objects (Explicitly Typed) ---

    // Define base styles and conditional modifications separately for clarity
    const baseContainerStyle: CSSProperties = {
        display: "flex",
        alignItems: "center",
        padding: "0.5rem",
        borderRadius: "9999px", // Consider using theme variables for values like this
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        border: "1px solid #D1D5DB", // Default border
        backgroundColor: "#FFFFFF",
        transition: 'border-color 0.2s ease-in-out, opacity 0.2s ease-in-out, background-color 0.2s ease-in-out',
    };

    const focusContainerStyle: CSSProperties = {
        border: "2px solid #6366F1", // Focus border
    };

    const disabledContainerStyle: CSSProperties = {
        opacity: 0.6,
        pointerEvents: 'none', // This is now correctly typed within CSSProperties
        backgroundColor: '#F9FAFB',
        border: "1px solid #E5E7EB", // Disabled border
    };

    // Combine styles based on state
    const chatInputContainerStyle: CSSProperties = {
        ...baseContainerStyle,
        ...(isFocused && !disabled ? focusContainerStyle : {}), // Apply focus styles only if not disabled
        ...(disabled ? disabledContainerStyle : {}), // Apply disabled styles
    };

    const inputFieldStyle: CSSProperties = {
        flexGrow: 1,
        padding: "0.5rem",
        margin: 0,
        borderRadius: "0.375rem",
        backgroundColor: "transparent",
        outline: "none",
        border: "none",
        color: disabled ? "#9CA3AF" : "#4B5563",
        fontSize: "1rem",
        lineHeight: "1.5rem", // CSSProperties allows string, TextareaAutosize likely handles it okay internally
        resize: 'none',
        cursor: disabled ? 'not-allowed' : 'text',
        // IMPORTANT: Do not set 'height' here - let TextareaAutosize manage it.
    };

    const sendButtonStyle: CSSProperties = {
      marginLeft: "0.5rem",
      // Button component should handle its own disabled state styling,
      // but cursor can be controlled here if needed.
      cursor: disabled || !message.trim() ? 'not-allowed' : 'pointer',
    };

    return (
        // Removed redundant className styling if all styles are handled by the style prop now
        <div style={chatInputContainerStyle}>
            <TextareaAutosize
                placeholder={disabled ? "Đang xử lý..." : "Nhập tin nhắn (Enter để gửi, Shift+Enter để xuống dòng)"}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                ref={inputRef}
                rows={1}
                style={inputFieldStyle as any} // <-- FIX: Use type assertion
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={disabled}
                tabIndex={disabled ? -1 : 0}
            />
            <Button
                variant="primary"
                size="large"
                rounded={true}
                onClick={handleSendMessage}
                style={sendButtonStyle} // Apply typed style object
                disabled={disabled || !message.trim()}
            >
                Gửi
            </Button>
        </div>
    );
};

export default ChatInput;