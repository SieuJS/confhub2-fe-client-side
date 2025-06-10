// src/utils/validation/index.ts

// --- Export lại các types và các hàm validation chính ---
export * from './types';
export { fieldValidationSchema } from './fieldValidationSchema';
export { validateDatesArray } from './dateArrayValidation';

// --- Import các thành phần cần thiết cho hàm helper ---
import { ConferenceFormData } from '@/src/models/send/addConference.send';
import { fieldValidationSchema } from './fieldValidationSchema';
import { TranslationFunction } from './types';

/**
 * Một hàm helper để chạy validation cho một trường cụ thể dựa trên schema.
 * @param fieldName - Tên trường (e.g., 'title', 'location.address').
 * @param allValues - Toàn bộ dữ liệu của form.
 * @param t - Hàm translation.
 * @returns Chuỗi lỗi đầu tiên tìm thấy, hoặc null.
 */
export const validateField = (
  fieldName: string,
  allValues: Partial<ConferenceFormData>,
  t: TranslationFunction
): string | null => {
  // Đổi tên biến để phù hợp với tên file mới
  const rules = fieldValidationSchema[fieldName];
  if (!rules) {
    return null;
  }

  // Lấy giá trị của trường, hỗ trợ cả nested object như 'location.address'
  const value = fieldName.split('.').reduce((o: any, i) => o?.[i], allValues);

  for (const rule of rules) {
    const errorMessage = rule(value, allValues, t);
    if (errorMessage) {
      return errorMessage; // Trả về lỗi đầu tiên tìm thấy
    }
  }

  return null; // Hợp lệ
};