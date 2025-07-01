// src/hooks/auth/useUserBlacklist.ts
import { useState, useEffect, useCallback } from 'react';
import { appConfig } from '@/src/middleware';
import { useAuth } from '@/src/contexts/AuthContext'; // <<<< THAY ĐỔI QUAN TRỌNG

interface UseUserBlacklistResult {
  blacklistedEventIds: string[];
  loading: boolean;
  error: string | null;
  refetch: () => void; // Giữ lại refetch thủ công nếu cần
}

const API_GET_BLACKLIST_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/blacklist-conference`;

const useUserBlacklist = (): UseUserBlacklistResult => {
  const [blacklistedEventIds, setBlacklistedEventIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // Bắt đầu là false, chỉ true khi fetch
  const [error, setError] = useState<string | null>(null);

  // <<<< THAY ĐỔI QUAN TRỌNG: Lấy thông tin từ AuthContext >>>>
  const { isLoggedIn, getToken, isInitializing: isAuthInitializing } = useAuth();

  const fetchData = useCallback(async () => {
    // Không fetch nếu AuthProvider chưa khởi tạo xong hoặc người dùng chưa đăng nhập
    if (isAuthInitializing || !isLoggedIn) {
      setBlacklistedEventIds([]); // Xóa blacklist nếu không đăng nhập hoặc đang khởi tạo
      setLoading(false); // Đảm bảo loading là false
      setError(null); // Xóa lỗi cũ nếu có
      return;
    }

    const token = getToken(); // Lấy token từ AuthContext

    if (!token) {
      // console.warn('[useUserBlacklist] User is logged in, but no token found. Cannot fetch blacklist.');
      setBlacklistedEventIds([]);
      setLoading(false);
      setError('Authentication token not available.'); // Thông báo lỗi rõ ràng hơn
      return;
    }

    // console.log('[useUserBlacklist] Fetching blacklist data...');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_GET_BLACKLIST_ENDPOINT, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error fetching blacklist' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Giả sử API trả về: { success: true, data: [{ conferenceId: "id1" }, { conferenceId: "id2" }] }
      // Hoặc chỉ là mảng: [{ conferenceId: "id1" }, { conferenceId: "id2" }]
      const responseData: any = await response.json();

      let ids: string[] = [];
      if (responseData && Array.isArray(responseData.data)) { // Nếu có trường 'data' là mảng
        ids = responseData.data.map((item: any) => item.conferenceId).filter((id: any) => typeof id === 'string');
      } else if (Array.isArray(responseData)) { // Nếu response là một mảng trực tiếp
         ids = responseData.map((item: any) => item.conferenceId).filter((id: any) => typeof id === 'string');
      } else {
        // console.warn('[useUserBlacklist] Unexpected data format for blacklist:', responseData);
      }

      setBlacklistedEventIds(ids);

    } catch (err: any) {
      // console.error('[useUserBlacklist] Failed to fetch blacklist data:', err);
      setError(err.message || 'Failed to fetch blacklist data');
      setBlacklistedEventIds([]);
    } finally {
      setLoading(false);
    }
    // Dependencies cho fetchData:
    // isAuthInitializing, isLoggedIn, getToken là các giá trị/hàm từ useAuth,
    // chúng nên ổn định hoặc thay đổi khi trạng thái auth thực sự thay đổi.
  }, [isAuthInitializing, isLoggedIn, getToken]);

  // Fetch data khi component mount và khi trạng thái đăng nhập hoặc token thay đổi
  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData đã bao gồm các dependencies cần thiết từ useAuth

  // Hàm refetch thủ công vẫn giữ nguyên cách hoạt động là gọi lại fetchData
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Không cần trả về isLoggedIn nữa vì component sử dụng hook này có thể lấy từ useAuth()
  return {
    blacklistedEventIds,
    loading,
    error,
    refetch,
  };
};

export default useUserBlacklist;