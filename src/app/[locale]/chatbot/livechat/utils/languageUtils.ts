// src/app/[locale]/chatbot/livechat/utils/languageUtils.ts (hoặc một tên file phù hợp)
import { Language } from '@/src/app/[locale]/chatbot/lib/live-chat.types';

// Định nghĩa các mã BCP-47 cho các ngôn ngữ của bạn
// Quan trọng: Hãy kiểm tra tài liệu của Google API để đảm bảo các mã này là chính xác và được hỗ trợ.
const languageToBcp47Map: Record<Language, string> = {
  'en': 'en-US', // Tiếng Anh (Mỹ)
  'vi': 'vi-VN', // Tiếng Việt (Việt Nam)
  'zh': 'zh-CN', // Tiếng Trung (Giản thể, Trung Quốc) - hoặc zh-TW cho Phồn thể
  'de': 'de-DE', // Tiếng Đức (Đức)
  'fr': 'fr-FR', // Tiếng Pháp (Pháp)
  'es': 'es-ES', // Tiếng Tây Ban Nha (Tây Ban Nha)
  'ru': 'ru-RU', // Tiếng Nga (Nga)
  'ja': 'ja-JP', // Tiếng Nhật (Nhật Bản)
  'ko': 'ko-KR', // Tiếng Hàn (Hàn Quốc)
  'ar': 'ar-XA', // Tiếng Ả Rập (Một mã chung, hoặc chọn cụ thể như ar-SA)
  'fa': 'fa-IR', // Tiếng Ba Tư (Iran)
};

export const getBcp47LanguageCode = (lang: Language): string => {
  return languageToBcp47Map[lang] || 'en-US'; // Mặc định về en-US nếu không tìm thấy
};