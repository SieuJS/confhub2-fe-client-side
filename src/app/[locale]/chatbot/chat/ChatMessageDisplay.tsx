// src/app/[locale]/chatbot/chat/ChatMessageDisplay.tsx
import React, { useState } from 'react'; // Import useState
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import { ChatMessageType } from '@/src/models/chatbot/chatbot';
import { TriangleAlert, Copy, Pencil, Check } from 'lucide-react'; // Import Check icon
import { toast } from 'react-toastify'; // HOẶC: import { toast } from 'sonner'; // HOẶC thư viện toast bạn dùng

// --- GIẢ ĐỊNH: Bạn đã cài đặt và cấu hình react-toastify hoặc sonner ---
// Nếu chưa, hãy cài đặt: npm install react-toastify / npm install sonner
// Và thêm <ToastContainer /> vào layout chính của ứng dụng.

interface ChatMessageDisplayProps extends Omit<ChatMessageType, 'timestamp'> {
    // No additional props needed
}

const ChatMessageDisplay: React.FC<ChatMessageDisplayProps> = ({
    message,
    isUser,
    type = 'text',
    thoughts
}) => {
    // State để quản lý hiệu ứng nút copy
    const [isCopied, setIsCopied] = useState(false);

    // --- Event Handlers ---
    const handleCopyClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();

        // Nếu đang hiển thị trạng thái "đã copy", không làm gì cả
        if (isCopied) return;

        navigator.clipboard.writeText(message)
            .then(() => {
                // --- Thành công ---
                // Hiển thị thông báo thành công
                toast.success("Đã sao chép vào bộ nhớ tạm!"); // Ví dụ thông báo

                // Kích hoạt hiệu ứng nút copy
                setIsCopied(true);

                // Reset hiệu ứng sau 2 giây
                setTimeout(() => {
                    setIsCopied(false);
                }, 2000); // 2000ms = 2 giây
            })
            .catch(err => {
                // --- Thất bại ---
                console.error("Không thể sao chép tin nhắn: ", err);
                // Hiển thị thông báo lỗi
                toast.error("Sao chép thất bại. Vui lòng thử lại."); // Ví dụ thông báo
            });
    };

    const handleEditClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        console.log("Edit button clicked for message:", message);
        // Implement actual edit functionality here
    };

    // --- Dynamic Styling ---
    const bubbleClasses = `
        group relative // Add group for hover effects on children like buttons
        max-w-[85%] md:max-w-[80%] p-3 rounded-lg shadow-sm flex flex-col text-sm
        ${isUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : type === 'error'
                ? 'bg-red-100 text-red-700 border border-red-200 rounded-bl-none'
                : type === 'warning'
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-bl-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200' // Bot default
        }
    `;

    return (
        <div className={bubbleClasses}>
            {/* Optional: Icon for Error/Warning */}
            {type === 'error' && <TriangleAlert className="w-4 h-4 mr-1.5 inline-block text-red-600 absolute -top-1.5 -left-1.5 bg-white rounded-full p-0.5 shadow" />}
            {type === 'warning' && <TriangleAlert className="w-4 h-4 mr-1.5 inline-block text-yellow-600 absolute -top-1.5 -left-1.5 bg-white rounded-full p-0.5 shadow" />}

            {/* Message Content using ReactMarkdown */}
            <div className={`message-content whitespace-pre-wrap break-words`}>
                <ReactMarkdown
                     remarkPlugins={[remarkGfm, remarkBreaks]}
                     rehypePlugins={[rehypeRaw]}
                     components={{
                         p: ({ node, ...props }) => <p {...props} />,
                         a: ({ ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
                             <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" />
                         ),
                         pre: ({ node, ...props }) => (
                             <pre
                                 className='overflow-x-auto rounded-md bg-black/5 dark:bg-white/10 p-2 my-2' // Improved styling
                                 {...props}
                             />
                         ),
                         code: ({ node, ...props }) => (
                             <code className='rounded bg-black/5 dark:bg-white/10 px-1 py-0.5 text-red-600 dark:text-red-400' {...props} /> // Improved styling
                         ),
                         h1: ({ node, ...props }) => (
                             <h1 className='my-4 text-2xl font-bold' {...props} />
                         ),
                         h2: ({ node, ...props }) => (
                             <h2 className='my-3 text-xl font-semibold' {...props} />
                         ),
                         h3: ({ node, ...props }) => (
                             <h3 className='my-2 text-lg font-medium' {...props} />
                         ),
                         ul: ({ node, ...props }) => (
                             <ul className='my-2 list-inside list-disc pl-2' {...props} /> // Added padding
                         ),
                         ol: ({ node, ...props }) => (
                             <ol className='my-2 list-inside list-decimal pl-2' {...props} /> // Added padding
                         ),
                         li: ({ node, ...props }) => <li className='my-1' {...props} />
                     }}
                 >
                     {message}
                 </ReactMarkdown>
            </div>

            {/* Action Buttons */}
            <div className={`absolute -bottom-1.5 flex space-x-1 transition-opacity duration-150 opacity-0 group-hover:opacity-100 focus-within:opacity-100
                         ${isUser ? '-right-1.5' : '-left-1.5'}`}>
                {/* Copy Button */}
                <button
                    onClick={handleCopyClick}
                    className={`p-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full shadow-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-colors duration-150
                                ${isCopied ? 'text-green-500 dark:text-green-400' : ''}`} // Thêm class màu xanh khi đã copy
                    aria-label={isCopied ? "Đã sao chép" : "Sao chép tin nhắn"}
                    title={isCopied ? "Đã sao chép!" : "Sao chép tin nhắn"}
                    disabled={isCopied} // Vô hiệu hóa nút tạm thời để tránh click liên tục
                >
                    {isCopied ? <Check size={14} /> : <Copy size={14} />} {/* Thay đổi icon */}
                </button>

                {/* Edit Button (Only for User messages) */}
                {isUser && (
                    <button
                        onClick={handleEditClick}
                        className={`p-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full shadow-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500`}
                        aria-label="Sửa tin nhắn"
                        title="Sửa tin nhắn"
                    >
                        <Pencil size={14} />
                    </button>
                )}
            </div>

            {/* Thoughts Section */}
            {!isUser && thoughts && thoughts.length > 0 && (
                 <details className="mt-2 pt-2 border-t border-black/10 text-xs opacity-90 cursor-pointer group/details">
                    <summary className="font-medium list-none flex items-center group-hover/details:text-gray-600 dark:group-hover/details:text-gray-300">
                        <span>Show Thoughts ({thoughts.length})</span>
                        <svg className="w-3 h-3 ml-1 transform group-open/details:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </summary>
                    <ul className={`list-disc pl-4 mt-1 space-y-1 rounded p-2 text-[0.7rem] leading-snug
                        ${type === 'error' ? 'bg-red-200/30' : type === 'warning' ? 'bg-yellow-200/30' : 'bg-gray-200/50 dark:bg-gray-700/50'}`
                    }>
                        {thoughts.map((thought, i) => (
                            <li key={i}>
                                <strong className="font-semibold">{thought.step}:</strong> {thought.message}
                                {thought.details && (
                                    <pre className="text-[0.65rem] bg-black/10 dark:bg-white/10 p-1.5 rounded mt-1 overflow-auto max-h-40 font-mono">
                                        {JSON.stringify(thought.details, null, 2)}
                                    </pre>
                                )}
                            </li>
                        ))}
                    </ul>
                </details>
            )}
        </div>
    );
};

export default ChatMessageDisplay;