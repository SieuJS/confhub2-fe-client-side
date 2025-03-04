import React from 'react';

interface ChatIntroductionProps {
    onFillInput: (fill: (text: string) => void) => void; // Thêm định nghĩa cho prop onFillInput
}

const ChatIntroduction: React.FC<ChatIntroductionProps> = ({ onFillInput }) => { // Destructure prop onFillInput
    return (
        <div id="ChatIntroduction" className="text-gray-600 text-center p-4">
            <p className="mb-4">Xin chào! Tôi là chatbot hỗ trợ tìm kiếm thông tin về các hội nghị. Hãy đặt câu hỏi hoặc chọn
                một trong số các câu hỏi gợi ý sau để bắt đầu:</p>
            <p className="mb-2">Ví dụ:</p>
            <ul className="list-disc list-inside">
                <li className="cursor-pointer hover:underline">
                    Liệt kê cho tôi một vài hội nghị về lĩnh vực AI tổ chức tại châu Á.
                </li>
                <li className="cursor-pointer hover:underline">
                    Tìm các hội nghị về Big Data trong năm nay.
                </li>
                <li className="cursor-pointer hover:underline">
                    Tôi muốn biết về các hội nghị blockchain tại châu Âu.
                </li>
            </ul>
        </div>
    );
};

export default ChatIntroduction;