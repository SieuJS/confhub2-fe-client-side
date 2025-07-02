// src/api/user/updateNotifications.ts

import { appConfig } from '@/src/middleware';
import { Notification } from '@/src/models/response/user.response';

// === THAY ĐỔI ===
// Định nghĩa một kiểu dữ liệu cho payload. Nó có thể là một đối tượng Notification đầy đủ
// hoặc một đối tượng chỉ chứa các trường cần thiết để cập nhật.
// Điều này làm cho hàm API linh hoạt hơn.
export type NotificationUpdatePayload = { id: string } & Partial<Omit<Notification, 'id'>>;

interface UpdateNotificationsData {
  notifications: NotificationUpdatePayload[];
}

const API_UPDATE_NOTIFICATIONS_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1`;

async function updateNotifications(data: UpdateNotificationsData): Promise<void> {
  try {
    // Payload gửi đi vẫn là { notifications: [...] }
    const response = await fetch(`${API_UPDATE_NOTIFICATIONS_ENDPOINT}/notification/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to update notifications: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }
  } catch (error: any) {
    throw error;
  }
}

export { updateNotifications };