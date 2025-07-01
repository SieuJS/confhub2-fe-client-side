// src/api/user/getNotifications.ts
import { appConfig } from '@/src/middleware';
import { Notification } from '@/src/models/response/user.response';

// Bỏ userId nếu nó không được sử dụng để tạo request
export const getNotifications = async (): Promise<Notification[]> => {
  const token = localStorage.getItem('token');

  if (!token) {
    const error = new Error('Unauthorized: No authentication token found.');
    (error as any).status = 401;
    throw error;
  }

  try {
    const response = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/notification/user`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      const errorMessage = errorBody || response.statusText;
      
      const error = new Error(`${response.status}: ${errorMessage}`);
      (error as any).status = response.status;
      throw error;
    }

    const data: Notification[] = await response.json();
    return data;
  } catch (error: any) {
    // console.error('Error fetching notifications:', error);
    if (!error.status) {
        (error as any).status = 0;
    }
    throw error;
  }
};