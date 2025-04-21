// src/app/[locale]/chatbot/chat/ChatIntroduction.tsx
import React from 'react';

interface ChatIntroductionProps {
    // Accept the callback from the parent to handle suggestion clicks
    onSuggestionClick: (suggestion: string) => void;
}

const ChatIntroduction: React.FC<ChatIntroductionProps> = ({ onSuggestionClick }) => {
    // Hardcoded suggestions (could be dynamic later)
    const suggestions = [
        "Liệt kê cho tôi một vài hội nghị về lĩnh vực AI tổ chức tại châu Á.",
        "Tìm các hội nghị về Big Data trong năm nay.",
        "Tôi muốn biết về các hội nghị blockchain tại châu Âu.",
    ];

    return (
        // Use Tailwind classes for styling matching the parent's example
        <div className="text-center p-6 bg-gradient-to-b from-blue-50 to-white rounded-lg border border-blue-100 mb-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Xin chào!</h2>
            <p className="text-sm text-gray-600 mb-4">
                Tôi là chatbot hỗ trợ tìm kiếm thông tin về các hội nghị. Hãy đặt câu hỏi hoặc chọn một trong số các câu hỏi gợi ý sau để bắt đầu:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((text, index) => (
                    // Use buttons for suggestions
                    <button
                        key={index}
                        onClick={() => onSuggestionClick(text)} // Call the passed function
                        className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        {text}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ChatIntroduction;