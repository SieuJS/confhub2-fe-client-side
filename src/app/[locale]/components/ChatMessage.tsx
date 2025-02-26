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


    const handleCopyClick = () => {
        navigator.clipboard.writeText(message);
    };

    return (
        <div>
            <div className={`p-3 rounded-xl mb-3 clear-both max-w-3/4 ${isUser ? 'bg-dropdown float-right text-right' : 'bg-selected  float-left text-left'}`}>
                <ReactMarkdown
                    key={message}
                    remarkPlugins={[remarkGfm]}
                    components={linkTarget}
                >
                    {message}
                </ReactMarkdown>
            </div>
            {/* Thêm nút copy ở đây, căn phải cho tin nhắn user, căn trái cho tin nhắn bot */}
            <div className={`rounded-xl mb-3 clear-both max-w-3/4 ${isUser ? 'text-right float-right' : 'text-left float-left'}`}>
                <button
                    className="p-1 hover:bg-background-secondary focus:outline-none focus:ring-2 focus:ring-background-secondary rounded-md"
                    onClick={handleCopyClick}
                    aria-label="Copy message"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                    </svg>
                </button>
                {isUser && (
                    <button
                    className="p-1 hover:bg-background-secondary focus:outline-none focus:ring-2 focus:ring-background-secondary rounded-md mr-2"
                    onClick={handleCopyClick}
                    aria-label="Edit message"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125m-15.908 9.541a6 6 0 009-9m-9 9H2.25v2.25h2.25m-2.25-2.25l.5.167l2.697 8.092a3.75 3.75 0 002.182 3.124l.321.107a.75.75 0 01.53-.034l.276-.092a.75.75 0 00-.101-.089m.23 5.17l-.23-.077-1.777-.592m2.497.669l-2.497-.832-1.345-4.036" />
                    </svg>
                </button>
                )}
            </div>
        </div>

    );
};

export default ChatMessage;