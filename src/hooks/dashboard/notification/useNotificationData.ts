// src/hooks/dashboard/notification/useNotificationData.ts
import { useState, useEffect, useCallback } from 'react';
import { getNotifications } from '../../../app/apis/user/getNotifications';
import { Notification } from '@/src/models/response/user.response';

const useNotificationData = (userId: string) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);
    const [isBanned, setIsBanned] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true); // Khởi tạo là true

    const fetchData = useCallback(async (currentUserId: string | null) => { // Truyền userId vào như một đối số
        setLoading(true);
        setIsBanned(false);
        setLoggedIn(true); // Giả định là đã đăng nhập khi bắt đầu fetch

        if (!currentUserId) { // Nếu không có userId (kể cả sau khi kiểm tra localStorage)
            setLoggedIn(false);
            setNotifications([]);
            setLoading(false); // Dừng loading
            setInitialLoad(false); // Kết thúc tải ban đầu
            return;
        }

        try {
            const data = await getNotifications(); // getNotifications không cần userId nữa, nó lấy từ token
            setNotifications(data || []);
            setLoggedIn(true);

        } catch (error: any) {
            console.error('useNotificationData: Error fetching notifications:', error);
            setNotifications([]);
            setLoggedIn(false);

            if (error.status === 401) {
                setLoggedIn(false);
            } else if (error.status === 403) {
                setIsBanned(true);
                setLoggedIn(false);
            }
        } finally {
            setLoading(false);
            setInitialLoad(false); // Đặt initialLoad thành false sau khi fetch xong (dù thành công hay thất bại)
        }
    }, []); // Không còn phụ thuộc vào userId từ closure nữa

    useEffect(() => {
        // Log để kiểm tra khi userId thực sự thay đổi
        // console.log(`useNotificationData: useEffect triggered. Current userId: "${userId}"`);
        // Nếu userId không rỗng, hoặc nếu nó thay đổi từ rỗng sang có giá trị
        if (userId) {
            fetchData(userId); // Gọi fetchData với userId hiện tại
        } else {
            // Trường hợp userId ban đầu là rỗng (trước khi localStorage được đọc)
            // hoặc người dùng thực sự không đăng nhập (không có userId)
            // Chúng ta cần kiểm tra localStorage một lần nữa ở đây hoặc đảm bảo
            // userId từ useNotifications đã được xử lý triệt để.
            const storedUserId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : null;
            if (storedUserId) {
                fetchData(storedUserId);
            } else {
                // Người dùng không đăng nhập và không có userId
                setLoading(false);
                setInitialLoad(false);
                setLoggedIn(false);
                setNotifications([]);
            }
        }
    }, [userId, fetchData]); // Phụ thuộc vào userId và fetchData

    return { notifications, loading, loggedIn, isBanned, initialLoad, fetchData: () => fetchData(userId) }; // Trả về fetchData bọc lại để đảm bảo dùng userId hiện tại
};

export default useNotificationData;