// src/components/ThoughtProcess.tsx
import React, { useState } from 'react';
import { ThoughtStep } from '@/src/models/chatbot/chatbot'; // Adjust path

// Re-define or import stepIcons - simpler to redefine here if not shared globally
const stepIcons: { [key: string]: string } = {
    processing_input: '📥',
    thinking: '🤔',
    function_call: '⚙️',
    retrieving_info: '🔍',
    processing_function_result: '📊',
    generating_response: '✍️',
    function_error: '⚠️',
    default: '⏳'
};

interface ThoughtProcessProps {
    thoughts: ThoughtStep[];
}

const ThoughtProcess: React.FC<ThoughtProcessProps> = ({ thoughts }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!thoughts || thoughts.length === 0) {
        return null; // Don't render if no thoughts
    }

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div className="mb-2 text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800">
            <button
                onClick={toggleOpen}
                className="flex items-center justify-between w-full px-2 py-1 text-left font-medium hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                aria-expanded={isOpen}
            >
                <span>{isOpen ? 'Hide' : 'Show'} Thought Process ({thoughts.length} steps)</span>
                {/* Chevron Icon */}
                <svg
                    className={`w-3 h-3 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>

            {/* Collapsible Content */}
            {isOpen && (
                <ul className="border-t border-gray-200 dark:border-gray-700 p-2 space-y-1 max-h-40 overflow-y-auto">
                    {thoughts.map((thought, index) => (
                        <li key={index} className="flex items-start space-x-1.5">
                            <span className="flex-shrink-0 pt-0.5" title={thought.step}>
                                {stepIcons[thought.step] || stepIcons.default}
                            </span>
                            <span className="flex-grow">{thought.message}</span>
                            {/* Optional: Display timestamp or details */}
                            <span className="text-gray-400 text-[10px]">{new Date(thought.timestamp).toLocaleTimeString()}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ThoughtProcess;