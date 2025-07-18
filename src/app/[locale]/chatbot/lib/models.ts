// src/app/[locale]/chatbot/lib/models.ts
import { Zap, Brain, ChevronsRight } from 'lucide-react'; // Ví dụ icons

export interface ModelOption {
  name: string;
  value: string;
  // description: string; // Mô tả ngắn cho dropdown
  detailedDescription: string; // Mô tả chi tiết cho tooltip
  icon?: React.ElementType; // Icon cho model (tùy chọn)
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    name: 'Sirius',
    value: 'gemini-2.5-flash',
    // description: 'Ngôi sao cân bằng: Hiệu suất tối ưu, tốc độ ấn tượng.',
    detailedDescription:
      "Ngôi sao cân bằng: Hiệu suất tối ưu, tốc độ ấn tượng.",
    icon: Zap,
  },
  {
    name: 'Mercury',
    value: 'gemini-2.5-pro',
    // description: 'Bậc thầy phân tích: Sức mạnh vượt trội, giải quyết vấn đề chuyên sâu.',
    detailedDescription:
      'Bậc thầy phân tích: Sức mạnh vượt trội, giải quyết vấn đề chuyên sâu.',
    icon: Brain,
  },
  {
    name: 'Nebula',
    value: 'gemini-2.5-flash-lite-preview-06-17',
    // description: 'Chớp nhoáng tức thời: Phản hồi siêu tốc, độ trễ cực thấp.',
    detailedDescription:
      'Chớp nhoáng tức thời: Phản hồi siêu tốc, độ trễ cực thấp.',
    icon: ChevronsRight,
  },
];

export const DEFAULT_MODEL = AVAILABLE_MODELS[0];