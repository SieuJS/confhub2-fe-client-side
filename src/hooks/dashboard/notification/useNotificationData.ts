import { useState, useEffect, useCallback } from 'react';
import { Notification } from '@/src/models/response/user.response';
import { getNotifications } from '@/src/app/apis/user/getNotifications'; // Đảm bảo đường dẫn đúng

/**
 * Hook để lấy dữ liệu thông báo từ API.
 * @param showErrorModal Hàm để hiển thị modal lỗi.
 */
const useNotificationData = (showErrorModal: (title: string, message: string) => void) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
      setIsBanned(false); // Reset isBanned nếu fetch thành công
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      if (error.status === 401) {
        // Xử lý lỗi 401 (Unauthorized) nếu cần, ví dụ: chuyển hướng đến trang đăng nhập
        // Tuy nhiên, NotificationsTab đã có logic xử lý `!loggedIn`
        // Ở đây chỉ cần báo lỗi cho người dùng biết
        showErrorModal('Authentication Required', 'Please sign in to view notifications.');
      } else if (error.status === 403) {
        // Xử lý lỗi 403 (Forbidden) cho tài khoản bị cấm
        setIsBanned(true);
        showErrorModal('Account Banned', 'Your account has been banned. Please contact support.');
      } else {
        showErrorModal('Failed to Load Notifications', error.message || 'An unexpected error occurred while fetching notifications.');
      }
      setNotifications([]); // Xóa dữ liệu cũ nếu có lỗi
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [showErrorModal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    notifications,
    loading,
    isBanned,
    initialLoad,
    fetchData,
  };
};

export default useNotificationData;