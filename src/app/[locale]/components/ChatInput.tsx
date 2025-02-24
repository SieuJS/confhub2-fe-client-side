import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    onFillInput?: (fillInputCallback: (text: string) => void) => void; // Optional prop
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onFillInput }) => {
    const [message, setMessage] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);

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


    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
    }, []);

    const handleSendMessage = useCallback(() => {
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    }, [message, onSendMessage]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    }, [handleSendMessage]);


    return (
        <div className="flex items-center p-4">
            <input
                type="text"
                className="flex-grow rounded-l-md py-2 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tin nhắn..."
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                ref={inputRef} // Attach ref
            />
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-md focus:outline-none focus:shadow-outline"
                onClick={handleSendMessage}
            >
                Gửi
            </button>
        </div>
    );
};

export default ChatInput;