// src/components/IntroduceVisualization/types.ts

// Không cần import 'useTranslations' ở đây nữa nếu chúng ta định nghĩa tường minh
// import type { useTranslations } from 'next-intl' // <-- Xóa dòng này hoặc comment lại

export interface ContinentData {
  id: string
  value: number
  colorHex: string
}

export type ChartType = 'bar' | 'pie' | 'line'

/**
 * ĐỊNH NGHĨA SỬA LỖI:
 * Định nghĩa TranslationFunction một cách tường minh.
 * Hàm `t` từ `next-intl` thường nhận:
 * 1. key (chuỗi)
 * 2. Tùy chọn: đối tượng chứa các giá trị nội suy (interpolation values) hoặc các tùy chọn khác.
 * và trả về một chuỗi.
 */
export type TranslationFunction = (
  key: string,
  // Thêm index signature để cho phép mọi thuộc tính string cho options
  options?: { [key: string]: any } // Hoặc Record<string, any>
) => string;

// Hoặc nếu bạn muốn tương thích hoàn toàn với next-intl (nếu cài đặt):
// import type { AbstractIntlMessages } from 'next-intl';
// export type TranslationFunction = <Key extends string>(
//   key: Key,
//   values?: Record<string, any>
// ) => string;
// Với `AbstractIntlMessages`, bạn có thể kiểm tra key chặt chẽ hơn.
// Nhưng định nghĩa đơn giản `(key: string, options?: Record<string, any>) => string`
// là đủ để giải quyết lỗi `never`.