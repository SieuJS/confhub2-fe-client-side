import React, { useState, useRef, useEffect, useCallback } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import Button from '../utils/Button'; // Import your Button component

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    onFillInput?: (fillInputCallback: (text: string) => void) => void; // Optional prop
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onFillInput }) => {
    const [message, setMessage] = useState<string>('');
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [isFocused, setIsFocused] = useState<boolean>(false); // State to track focus

    // useEffect to handle programmatic input filling
    useEffect(() => {
        const handleFill = (text: string) => {
            setMessage(text);  // Update local state directly
            if (inputRef.current) {
                inputRef.current.focus(); // Keep focus
            }
        };

        // Define a function to be called from parent components
        if (onFillInput) {
            onFillInput(handleFill); // Pass the handleFill function to the parent
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
            // Xuống dòng khi chỉ nhấn Enter (không kèm Ctrl)
          setMessage(prevMessage => prevMessage + '\n');
          e.preventDefault(); // Ngăn hành động mặc định (gửi form)
        } else if (e.key === 'Enter' && e.ctrlKey) {
            // Gửi tin nhắn khi nhấn Ctrl + Enter
          handleSendMessage();
          e.preventDefault(); //ngăn xuống dòng
        }
    }, [handleSendMessage]);

    const handleFocus = useCallback(() => {
        setIsFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
    }, []);


    return (
        <div className={`rounded-full shadow-md flex items-center py-4 px-4 space-x-4 border ${isFocused ? 'border-button border-2' : 'border-button'}  `}>
            <TextareaAutosize
              className="flex-grow rounded-l-md py-2 px-4 bg-transparent focus:outline-none focus:ring-0 placeholder-primary"
              placeholder="Nhập tin nhắn..."
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              ref={inputRef} // Attach ref
              rows={1} // Bắt đầu với 1 dòng
              style={{ resize: 'none' }} // Ngăn người dùng resize thủ công
              onFocus={handleFocus} // Add onFocus handler
              onBlur={handleBlur}   // Add onBlur handler
            />
            <Button // Replaced <button> with <Button>
            variant="primary" // Or "secondary" based on your design
            size="large"     // Or "small", "large"
            rounded={true}   // Make button rounded
            onClick={handleSendMessage}
            className="ml-2 rounded-full" // Make button rounded and add margin
            >
            Gửi {/* Children of the Button component */}
            </Button>
        </div>
    );
};

export default ChatInput;