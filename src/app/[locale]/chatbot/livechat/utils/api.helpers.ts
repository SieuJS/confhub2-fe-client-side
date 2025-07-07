// src/app/[locale]/chatbot/livechat/utils/api.helpers.ts

// --- IMPORT CÁC TYPE CẦN THIẾT ---
// Giả sử các type này được export từ tool.handlers.ts hoặc một file types chung
import { FollowItem, CalendarItem } from '../services/tool.handlers';

// Placeholder for client-side auth token retrieval
export const getAuthTokenClientSide = async (): Promise<string | null> => {
  // IMPORTANT: Implement this based on your application's auth mechanism
  const token = localStorage.getItem('token');
  if (!token) {
    // console.warn("getAuthTokenClientSide: No token found.");
  }
  return token;
};

// Generic API call helper for frontend
export async function makeFrontendApiCall(
  url: string,
  method: 'GET' | 'POST' | 'DELETE' | 'PUT',
  token: string | null,
  body?: any
): Promise<any> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorData;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = await response.text(); // Fallback if JSON parsing fails
      }
    } else {
      errorData = await response.text();
    }
    const message = (typeof errorData === 'object' && errorData?.message) ? errorData.message :
      (typeof errorData === 'string' && errorData.trim() !== '') ? errorData :
        `API Error (${response.status})`;
    throw new Error(message);
  }

  // Handle 204 No Content or responses with content-length 0
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return { success: true, message: "Operation successful, no content returned." };
  }

  return response.json();
}

// =================================================================
// --- ĐIỀU CHỈNH QUAN TRỌNG NHẤT ---
// =================================================================

/**
 * Fetches the full details of an item (conference) from the API.
 * This function is now more generic and returns the entire item object.
 *
 * @param identifier The value to search for (e.g., "ICML", "12345").
 * @param identifierType The type of the identifier ('acronym', 'title', 'id').
 * @param itemType The type of item to fetch (currently only 'conference').
 * @param databaseUrl The base URL for the API.
 * @returns A promise that resolves to the full item object (e.g., FollowItem, CalendarItem).
 */
export async function fetchItemDetailsFromApi(
  identifier: string,
  identifierType: 'acronym' | 'title' | 'id',
  itemType: 'conference',
  databaseUrl: string
): Promise<FollowItem | CalendarItem> { // CHANGE: Trả về một object đầy đủ
  if (!identifier) throw new Error("Identifier is required.");

  const searchApiUrl = `${databaseUrl}/${itemType}`; // e.g., /api/v1/conference
  const params = new URLSearchParams({ perPage: '1' });

  // API có thể tìm kiếm theo các trường khác nhau
  if (identifierType === 'id') {
    // Nếu tìm theo ID, API có thể có một endpoint riêng, ví dụ /conference/:id
    // Hoặc vẫn dùng query param
    params.set('id', identifier);
  } else if (identifierType === 'acronym') {
    params.set('acronym', identifier);
  } else if (identifierType === 'title') {
    params.set('title', identifier);
  } else {
    throw new Error(`Unsupported identifier type: ${identifierType}`);
  }

  const finalUrl = `${searchApiUrl}?${params.toString()}`;

  const response = await fetch(finalUrl, { method: 'GET', headers: { 'Accept': 'application/json' } });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch ${itemType} details for "${identifier}" from ${finalUrl}: ${response.status} ${errorText.substring(0, 100)}`);
  }
  const result = await response.json();

  // API có thể trả về dữ liệu trong 'payload' hoặc trực tiếp là một mảng
  let itemData;
  if (result && Array.isArray(result.payload) && result.payload.length > 0) {
    itemData = result.payload[0];
  } else if (Array.isArray(result) && result.length > 0) {
    itemData = result[0];
  } else if (result && result.id) { // Trường hợp API trả về một object duy nhất
    itemData = result;
  }

  if (itemData && itemData.id) {
    // CHANGE: Trả về toàn bộ object đã được chuẩn hóa thay vì chỉ id và name
    // Điều này đảm bảo các trường như 'dates', 'location' có sẵn
    return {
      id: itemData.id,
      title: itemData.title || itemData.name || 'Unknown Title',
      acronym: itemData.acronym || '',
      // Cung cấp giá trị mặc định để đảm bảo cấu trúc object luôn hợp lệ
      dates: itemData.dates || [],
      location: itemData.location || { address: '', cityStateProvince: '', country: '', continent: '' },
      // Các trường khác có thể có hoặc không, tùy thuộc vào context
      ...itemData
    };
  } else {
    throw new Error(`${itemType} not found with ${identifierType} "${identifier}", or ID missing in response.`);
  }
}

// --- CÁC HÀM CŨ CÓ THỂ GIỮ LẠI HOẶC XÓA ĐI ---

/**
 * @deprecated This function is no longer needed as UI actions now handle list display.
 * The logic is now handled directly within the tool handlers to create structured responses.
 */
export function formatItemsForModel(items: any[], itemType: string): string {
  if (!items || items.length === 0) {
    return `You are not following any ${itemType}s.`;
  }
  const formatted = items.map(item => {
    let display = `- ${item.title || 'Unknown Title'}`;
    if (item.acronym) display += ` (${item.acronym})`;
    return display;
  }).join('\n');
  return `Here are the ${itemType}s you are following:\n${formatted}`;
}

// Helper to safely get the 'url' argument from function call arguments
export function getUrlArg(fcArgs: any): string | undefined {
    return fcArgs && typeof fcArgs === 'object' && typeof fcArgs.url === 'string'
      ? fcArgs.url
      : undefined;
}