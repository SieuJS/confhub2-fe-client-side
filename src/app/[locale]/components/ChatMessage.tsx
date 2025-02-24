import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
    message: string;
    isUser: boolean;
    isStreaming?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser }) => {
    // Custom link renderer to add target="_blank" and rel="noopener noreferrer"
    const linkTarget = useMemo(() => {
        return {
            a: ({ ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
                <a {...props} target="_blank" rel="noopener noreferrer" />
            ),
        };
    }, []);

    console.log("ChatMessage - message prop received:", message, typeof message); // ADD THIS LOG

    return (
        <div className={`p-3 rounded-xl mb-3 clear-both max-w-3/4 ${isUser ? 'bg-dropdown float-right text-right' : 'bg-selected  float-left text-left'}`}>
            <ReactMarkdown
                key={message}
                remarkPlugins={[remarkGfm]}
                components={linkTarget}
            >
                {message}
            </ReactMarkdown>
        </div>
    );
};

export default ChatMessage;