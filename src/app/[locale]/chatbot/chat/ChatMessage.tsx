// Trong ChatMessage.tsx
import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';



interface ChatMessageProps {
    message: string;
    isUser: boolean;
}

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message, isUser }) => {
    const linkTarget = useMemo(() => {
        return {
            a: ({ ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
                <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" />
            ),
        };
    }, []);

    const handleCopyClick = () => {
        navigator.clipboard.writeText(message);
    };

    const handleEditClick = () => {
        console.log("Edit button clicked for message:", message);
    };

    return (
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            {/* Thay đổi ở đây: bỏ max-w-md hoặc thay bằng giá trị lớn hơn, có thể bỏ w-full */}
            <div className={`p-4 rounded-lg  ${isUser ? 'bg-dropdown text-gray-700' : 'bg-selected text-black'} break-words`}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={linkTarget}
                    >
                        {message}
                    </ReactMarkdown>
            </div>
            <div className="mt-2 space-x-2">
                <button
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 rounded-md transition-colors duration-200"
                    onClick={handleCopyClick}
                    aria-label="Copy message"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                    </svg>
                </button>
                {isUser && (
                    <button
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 rounded-md transition-colors duration-200"
                        onClick={handleEditClick}
                        aria-label="Edit message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125m-15.908 9.541a6 6 0 009-9m-9 9H2.25v2.25h2.25m-2.25-2.25l.5.167l2.697 8.092a3.75 3.75 0 002.182 3.124l.321.107a.75.75 0 01.53-.034l.276-.092a.75.75 0 00-.101-.089m.23 5.17l-.23-.077-1.777-.592m2.497.669l-2.497-.832-1.345-4.036" />
                    </svg>
                </button> )
                }
            </div>
        </div>
    );
};

export default ChatMessageComponent;