// src/services/journal.service.ts

import { JournalApiResponse } from '../models/response/journal.response';

// Lấy URL của API từ biến môi trường
const API_BASE_URL = process.env.NEXT_PUBLIC_DATABASE_URL || '';

// Định nghĩa một interface cho các tham số để code được tường minh hơn
interface GetAllJournalsParams {
  search?: string;
  country?: string;
  areas?: string;
  publisher?: string;
  region?: string;
  type?: string;
  quartile?: string;
  category?: string;
  issn?: string;
  topic?: string;
  hIndex?: string;
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any; // Cho phép các thuộc tính khác
}

/**
 * Lấy danh sách các journal đã được filter và phân trang.
 * @param params - Một object chứa các tham số filter, phân trang và sắp xếp.
 * @returns Một Promise trả về JournalApiResponse.
 */
const getAll = async (params: GetAllJournalsParams = {}): Promise<JournalApiResponse> => {
  // Tạo một đối tượng URLSearchParams để xây dựng query string
  const queryParams = new URLSearchParams();

  // Lặp qua object params và thêm các giá trị hợp lệ vào query string
  for (const key in params) {
    const value = params[key];
    // Chỉ thêm vào query nếu giá trị tồn tại (khác null, undefined, chuỗi rỗng)
    if (value !== null && value !== undefined && value !== '') {
      queryParams.append(key, String(value));
    }
  }

  const queryString = queryParams.toString();
  const apiUrl = `${API_BASE_URL}/api/v1/journals?${queryString}`;

  try {
    const response = await fetch(apiUrl, {
      // Thêm các tùy chọn khác nếu cần, ví dụ: cache
      // next: { revalidate: 60 } // Ví dụ: cache request trong 60 giây
    });

    if (!response.ok) {
      // Ném ra lỗi với thông tin chi tiết để có thể bắt được ở nơi gọi
      const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(`API call failed with status ${response.status}: ${errorData.message || response.statusText}`);
    }

    const apiResponse: JournalApiResponse = await response.json();
    return apiResponse;

  } catch (err: any) {
    console.error('Error in journalService.getAll:', err);
    // Ném lại lỗi để component cha có thể xử lý và hiển thị thông báo cho người dùng
    throw err;
  }
};

// Export các hàm service để có thể sử dụng ở nơi khác
export const journalService = {
  getAll,
  // Trong tương lai, bạn có thể thêm các hàm khác ở đây
  // getById: async (id: string) => { ... },
  // create: async (data: NewJournalData) => { ... },
};