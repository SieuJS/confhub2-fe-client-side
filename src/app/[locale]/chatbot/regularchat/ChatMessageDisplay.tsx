// src/app/[locale]/chatbot/chat/ChatMessageDisplay.tsx
import React, { useState } from 'react';
import type { ReactHTML, PropsWithChildren } from 'react'; // Import types

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import { ChatMessageType, MessageType, ThoughtStep } from '@/src/models/chatbot/chatbot'; // Ensure types are correctly imported
import { TriangleAlert, Copy, Pencil, Check } from 'lucide-react';
import { toast } from 'react-toastify'; // Or your preferred toast library
import Map from '../../conferences/detail/Map';


// Helper type (optional, makes it cleaner)
type MarkdownComponentProps<T extends keyof ReactHTML> = PropsWithChildren<
    JSX.IntrinsicElements[T] & {
        node?: unknown; // Type 'node' as unknown (safer than any) if unused
        // Add other potential props from react-markdown if needed (e.g., inline, index)
    }
>;

// --- Props Interface ---
// Inherits all properties from ChatMessageType except timestamp
// Explicitly list props being destructured for clarity
interface ChatMessageDisplayProps {
    id: string; // Keep ID if needed for keys or accessibility
    message: string;
    isUser: boolean;
    type: MessageType; // Use the updated MessageType union ('text' | 'error' | 'warning' | 'map')
    thoughts?: ThoughtStep[];
    location?: string; // <<< ADD location prop
}

const ChatMessageDisplay: React.FC<ChatMessageDisplayProps> = ({
    id, // Destructure id if passed
    message,
    isUser,
    type = 'text', // Default type remains 'text'
    thoughts,
    location // <<< Destructure location
}) => {
    const [isCopied, setIsCopied] = useState(false);

    // --- Event Handlers (Keep existing handlers) ---
    const handleCopyClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (isCopied) return;
        navigator.clipboard.writeText(message)
            .then(() => {
                toast.success("Copied to clipboard!");
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            })
            .catch(err => {
                console.error("Failed to copy message: ", err);
                toast.error("Copy failed. Please try again.");
            });
    };

    const handleEditClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        console.log("Edit button clicked for message:", message);
        // TODO: Implement actual edit functionality (e.g., calling a prop function)
    };

    // --- Dynamic Styling (Keep existing logic) ---
    const bubbleClasses = `
        group relative // Keep group for hover effects
        max-w-[85%] md:max-w-[80%] p-3 rounded-lg shadow-sm flex flex-col text-sm
        ${isUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : type === 'error'
                ? 'bg-red-100 text-red-700 border border-red-200 rounded-bl-none'
                : type === 'warning'
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-bl-none'
                    // Apply default bot style also for 'map' type bubbles
                    : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
        }
        // Ensure map takes full width of the bubble if needed
        ${type === 'map' ? 'w-full md:w-[80%] lg:w-[70%]' : ''} // Allow map bubble to be wider
    `;

    // // --- Markdown Components (Keep existing config) ---
    //   const markdownComponents = {
    //                      p: ({ node, ...props }) => <p {...props} />,
    //                      a: ({ ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
    //                          <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" />
    //                      ),
    //                      pre: ({ node, ...props }) => (
    //                          <pre
    //                              className='overflow-x-auto rounded-md bg-black/5 dark:bg-white/10 p-2 my-2' // Improved styling
    //                              {...props}
    //                          />
    //                      ),
    //                      code: ({ node, ...props }) => (
    //                          <code className='rounded bg-black/5 dark:bg-white/10 px-1 py-0.5 text-red-600 dark:text-red-400' {...props} /> // Improved styling
    //                      ),
    //                      h1: ({ node, ...props }) => (
    //                          <h1 className='my-4 text-2xl font-bold' {...props} />
    //                      ),
    //                      h2: ({ node, ...props }) => (
    //                          <h2 className='my-3 text-xl font-semibold' {...props} />
    //                      ),
    //                      h3: ({ node, ...props }) => (
    //                          <h3 className='my-2 text-lg font-medium' {...props} />
    //                      ),
    //                      ul: ({ node, ...props }) => (
    //                          <ul className='my-2 list-inside list-disc pl-2' {...props} /> // Added padding
    //                      ),
    //                      ol: ({ node, ...props }) => (
    //                          <ol className='my-2 list-inside list-decimal pl-2' {...props} /> // Added padding
    //                      ),
    //                      li: ({ node, ...props }) => <li className='my-1' {...props} />
    //                  };


    return (
        <div className={bubbleClasses}>
            {/* Optional: Icon for Error/Warning */}
            {type === 'error' && <TriangleAlert className="w-4 h-4 mr-1.5 inline-block text-red-600 absolute -top-1.5 -left-1.5 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow" />}
            {type === 'warning' && <TriangleAlert className="w-4 h-4 mr-1.5 inline-block text-yellow-600 absolute -top-1.5 -left-1.5 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow" />}

            {/* === CONDITIONAL CONTENT RENDERING === */}
            {type === 'map' && location ? (
                // --- Render Map Component ---
                <div className="map-content-wrapper py-1"> {/* Wrapper with padding */}
                    {/* Optional: Display the 'message' prop as a label above the map */}
                    {message && message !== `Showing map for: ${location}` && (
                        <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{message}</p>
                    )}
                    <Map location={location} />
                </div>
            ) : (
                // --- Render Standard Text/Markdown Content ---
                <div className={`message-content whitespace-pre-wrap break-words`}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        rehypePlugins={[rehypeRaw]}


                        components={{
                            p: ({ node: _, ...props }: MarkdownComponentProps<'p'>) => <p {...props} />,
                            a: ({ node: _, ...props }: MarkdownComponentProps<'a'>) => (
                                <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" />
                            ),
                            pre: ({ node: _, ...props }: MarkdownComponentProps<'pre'>) => (
                                <pre
                                    className='overflow-x-auto rounded-md bg-black/5 dark:bg-white/10 p-2 my-2'
                                    {...props}
                                />
                            ),
                            code: ({ node: _, ...props }: MarkdownComponentProps<'code'>) => (
                                <code className='rounded bg-black/5 dark:bg-white/10 px-1 py-0.5 text-red-600 dark:text-red-400' {...props} />
                            ),
                            h1: ({ node: _, ...props }: MarkdownComponentProps<'h1'>) => (
                                <h1 className='my-4 text-2xl font-bold' {...props} />
                            ),
                            h2: ({ node: _, ...props }: MarkdownComponentProps<'h2'>) => (
                                <h2 className='my-3 text-xl font-semibold' {...props} />
                            ),
                            h3: ({ node: _, ...props }: MarkdownComponentProps<'h3'>) => (
                                <h3 className='my-2 text-lg font-medium' {...props} />
                            ),
                            ul: ({ node: _, ...props }: MarkdownComponentProps<'ul'>) => (
                                <ul className='my-2 list-inside list-disc pl-2' {...props} />
                            ),
                            ol: ({ node: _, ...props }: MarkdownComponentProps<'ol'>) => (
                                <ol className='my-2 list-inside list-decimal pl-2' {...props} />
                            ),
                            li: ({ node: _, ...props }: MarkdownComponentProps<'li'>) => <li className='my-1' {...props} />,
                        }}
                    // Use defined components
                    >
                        {message}
                    </ReactMarkdown>
                </div>
            )
            }

            {/* --- Action Buttons (Only for specific types if needed) --- */}
            {/* Show copy/edit buttons only for user messages or non-map bot messages */}
            {
                (isUser || (type !== 'map' && !isUser)) && (
                    <div className={`absolute -bottom-1.5 flex space-x-1 transition-opacity duration-150 opacity-0 group-hover:opacity-100 focus-within:opacity-100
                              ${isUser ? '-right-1.5' : '-left-1.5'}`}>
                        {/* Copy Button (Show for non-map messages) */}
                        {type !== 'map' && (
                            <button
                                onClick={handleCopyClick}
                                className={`p-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full shadow-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-colors duration-150 ${isCopied ? 'text-green-500 dark:text-green-400' : ''}`}
                                aria-label={isCopied ? "Copied" : "Copy message"}
                                title={isCopied ? "Copied!" : "Copy message"}
                                disabled={isCopied}
                            >
                                {isCopied ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                        )}

                        {/* Edit Button (Only for User messages) */}
                        {isUser && (
                            <button
                                onClick={handleEditClick}
                                className={`p-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full shadow-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500`}
                                aria-label="Edit message"
                                title="Edit message"
                            >
                                <Pencil size={14} />
                            </button>
                        )}
                    </div>
                )
            }


            {/* --- Thoughts Section (Show for non-user messages, including map type) --- */}
            {
                !isUser && thoughts && thoughts.length > 0 && (
                    <details className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 text-xs opacity-90 cursor-pointer group/details">
                        <summary className="font-medium list-none flex items-center group-hover/details:text-gray-600 dark:group-hover/details:text-gray-300">
                            <span>Show Thoughts ({thoughts.length})</span>
                            {/* Arrow icon */}
                            <svg className="w-3 h-3 ml-1 transform group-open/details:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </summary>
                        <ul className={`list-disc pl-4 mt-1 space-y-1 rounded p-2 text-[0.7rem] leading-snug
                        ${type === 'error' ? 'bg-red-200/30 dark:bg-red-900/30' : type === 'warning' ? 'bg-yellow-200/30 dark:bg-yellow-900/30' : 'bg-gray-200/50 dark:bg-gray-700/50'}` // Adjusted dark mode bg
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
                )
            }
        </div >
    );
};

export default ChatMessageDisplay;