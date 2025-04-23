// src/app/[locale]/chatbot/chat/ChatIntroduction.tsx
import React from 'react';
import { Language } from '@/src/app/[locale]/chatbot/lib/live-chat.types'; // Đảm bảo Language type bao gồm 'zh'

interface IntroductionContent {
    greeting: string;
    description: string;
    suggestions: string[];
}

// Bổ sung tiếng Trung (zh) vào introductions
const introductions: Record<Language, IntroductionContent> = {
    en: {
        greeting: "Hello!",
        description: "I'm a chatbot assistant for finding conference information. Ask a question or choose a suggestion below to get started:",
        suggestions: [
            "List some AI conferences in Asia.",
            "Find Big Data conferences this year.",
            "I want to know about blockchain conferences in Europe.",
        ],
    },
    vi: {
        greeting: "Xin chào!",
        description: "Tôi là chatbot hỗ trợ tìm kiếm thông tin về các hội nghị. Hãy đặt câu hỏi hoặc chọn một trong số các câu hỏi gợi ý sau để bắt đầu:",
        suggestions: [
            "Liệt kê cho tôi một vài hội nghị về lĩnh vực AI tổ chức tại châu Á.",
            "Tìm các hội nghị về Big Data trong năm nay.",
            "Tôi muốn biết về các hội nghị blockchain tại châu Âu.",
        ],
    },
    // --- Thêm tiếng Trung giản thể ---
    zh: {
        greeting: "你好!", // Ni hao!
        description: "我是会议信息查询聊天机器人助手。您可以提问或选择下面的建议开始：", // Wǒ shì huìyì xìnxī cháxún liáotiān jīqìrén zhùshǒu. Nín kěyǐ tíwèn huò xuǎnzé xiàmiàn de jiànyì kāishǐ:
        suggestions: [
            "列出亚洲的一些人工智能会议。", // Liè chū Yàzhōu de yīxiē réngōng zhìnéng huìyì.
            "查找今年的大数据会议。", // Cházhǎo jīnnián de dà shùjù huìyì.
            "我想了解欧洲的区块链会议。", // Wǒ xiǎng liǎojiě Ōuzhōu de qūkuàiliàn huìyì.
        ],
    },
    // ---------------------------------
    // Thêm các ngôn ngữ khác nếu cần
};
// --- Kết thúc định nghĩa nội dung ---


interface ChatIntroductionProps {
    onSuggestionClick: (suggestion: string) => void;
    language: Language;
}

const ChatIntroductionDisplay: React.FC<ChatIntroductionProps> = ({ onSuggestionClick, language }) => {
    // Chọn nội dung dựa trên ngôn ngữ, fallback về 'en'
    // Đảm bảo language có thể là 'zh' thì mới lấy được introductions['zh']
    const content = introductions[language] || introductions['en'];

    return (
        <div className="text-center p-6 bg-gradient-to-b from-blue-50 to-white rounded-lg border border-blue-100 mb-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">{content.greeting}</h2>
            <p className="text-sm text-gray-600 mb-4">
                {content.description}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
                {content.suggestions.map((text, index) => (
                    <button
                        key={index}
                        onClick={() => onSuggestionClick(text)}
                        className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        {text}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ChatIntroductionDisplay;