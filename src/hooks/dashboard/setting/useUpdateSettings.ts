// src/hooks/useUpdateUser.ts (Đã sửa lỗi)
import { useState, useCallback } from 'react'; // <<<< THÊM useCallback
import { UserResponse, Setting } from '@/src/models/response/user.response';
import { updateUser } from '../../../app/apis/user/updateUser';
import { appConfig } from '@/src/middleware';

interface UpdateUserResult {
  updateUserSetting: (updatedSetting: Partial<Setting>) => Promise<void>;
  updateUserProfile: (userId: string, updatedProfile: Partial<UserResponse>) => Promise<void>;
  loading: boolean;
  error: string | null;
}

interface GetUserSettingResult {
  getUserSettings: () => Promise<Setting | null>;
  error: string | null;
}

export const useUpdateUser = (): UpdateUserResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bọc hàm trong useCallback để nó không bị tạo lại mỗi lần render
  const updateUserSetting = useCallback(async (updatedSetting: Partial<Setting>) => {
    setLoading(true);
    setError(null);
    try {
      const updateResponse = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/notification/user/setting`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          settings: updatedSetting,
        }),
      });
      if (!updateResponse.ok) {
        // Cung cấp thông tin lỗi chi tiết hơn nếu có thể
        const errorBody = await updateResponse.text();
        throw new Error(`Failed to update user setting. Status: ${updateResponse.status}. Body: ${errorBody}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update user setting.');
      // Re-throw lỗi để component gọi nó có thể bắt và xử lý nếu cần
      throw err;
    } finally {
      setLoading(false);
    }
  }, []); // Mảng dependency rỗng vì hàm này không phụ thuộc vào props hay state nào từ bên ngoài

  // Tương tự, bọc hàm này trong useCallback
  const updateUserProfile = useCallback(async (userId: string, updatedProfile: Partial<UserResponse>) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await updateUser(updatedProfile, token);
    } catch (err: any) {
      setError(err.message || 'Failed to update user profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []); // Mảng dependency rỗng

  return { updateUserSetting, updateUserProfile, loading, error };
};

export const useGetUserSetting = (): GetUserSettingResult => {
  const [error, setError] = useState<string | null>(null);

  const getUserSettings = useCallback(async (): Promise<Setting | null> => {
    setError(null);
    try {
      const response = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/notification/user/setting`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to fetch user settings. Status: ${response.status}. Body: ${errorBody}`);
      }
      
      // SỬA LỖI Ở ĐÂY: Trả về trực tiếp object data
      // vì API không gói dữ liệu trong một key 'data'
      const data = await response.json();
      return data; // <<<< THAY ĐỔI TỪ `data.data` THÀNH `data`

    } catch (error: any) {
      setError(error.message || 'Error fetching user settings');
      return null;
    }
  }, []); 

  return { getUserSettings, error };
}
