import { ConferenceInfo } from '@/src/models/response/conference.list.response';

const API_FILTERED_CONFERENCES_ENDPOINT = 'http://localhost:3000/api/v1/filter-conferences';

export interface FetchConferencesParams {
  keyword?: string;
  country?: string;
  type?: 'Online' | 'Offline' | 'Hybrid';
  startDate?: string;
  endDate?: string;
  rank?: string;
  sourceYear?: string;
  topics?: string[];
  publisher?: string;
  page?: string;
  sortBy?: 'date' | 'rank' | 'name' | 'submissionDate' | 'startDate' | 'endDate';
  sortOrder?: 'asc' | 'desc';
  limit?: string;
}

export interface FetchConferencesResponse {
  items: ConferenceInfo[];
  total: number;
}

export const fetchConferences = async (params: FetchConferencesParams): Promise<FetchConferencesResponse> => {
  const queryParams = new URLSearchParams();

  // Thêm tất cả tham số vào query string,  kiểm tra undefined/null
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => queryParams.append(key, item));
      } else {
        queryParams.append(key, String(value));
      }
    }
  });

  const url = `${API_FILTERED_CONFERENCES_ENDPOINT}?${queryParams.toString()}`;
  console.log(`Query: ${url}`);

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('No conferences found matching your criteria.'); // Rõ ràng lỗi.
    }
    throw new Error(`HTTP error! status: ${response.status}`); // Giữ lại thông tin lỗi chung.
  }

  const data: FetchConferencesResponse = await response.json(); // Rõ ràng kiểu dữ liệu trả về.
  return data;
};