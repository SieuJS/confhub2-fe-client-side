// src/hooks/dashboard/notification/useNotifications.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import useNotificationData from './useNotificationData';
import useNotificationState from './useNotificationState';
import useSelection from './useSelection';
import useFilteredNotifications from './useFilteredNotifications';
import useBulkReadActions from './useBulkReadActions';
import useBulkImportantActions from './useBulkImportantActions';
import { Notification } from '@/src/models/response/user.response'; // Đảm bảo import đúng đường dẫn

// Giả định rằng các hooks con (useNotificationData, etc.) đã được định nghĩa ở đâu đó.
// Nếu chưa, bạn cần cung cấp định nghĩa của chúng.
// Ví dụ:
// const useNotificationData = (userId: string) => ({ notifications: [], loading: false, loggedIn: true, fetchData: async () => {} });
// const useNotificationState = (initial: Notification[], userId: string) => ({ notifications: initial, setNotifications: (n: Notification[]) => {}, handleUpdateSeenAt: async (id:string) => {}, /* ... more handlers ... */ updateUserNotifications: async (n: Notification[]) => {} });
// const useSelection = (itemIds: string[]) => ({ checkedIndices: [], setCheckedIndices: (ids: string[]) => {}, selectAllChecked: false, handleCheckboxChange: (id:string, checked:boolean) => {}, handleSelectAllChange: (e: React.ChangeEvent<HTMLInputElement>) => {} });
// const useFilteredNotifications = (notifications: Notification[], searchTerm: string) => notifications;
// const useBulkReadActions = (checkedIds: string[], allNotifications: Notification[], updateFn: any) => ({ handleMarkSelectedAsRead: async () => {}, handleMarkSelectedAsUnread: async () => {}, allSelectedAreRead: false });
// const useBulkImportantActions = (checkedIds: string[], allNotifications: Notification[], updateFn: any) => ({ handleMarkSelectedAsImportant: async () => {}, handleMarkSelectedAsUnimportant: async () => {}, allSelectedAreImportant: false });


interface UseNotificationsReturn {
    notifications: Notification[];
    checkedIndices: string[];
    setCheckedIndices: React.Dispatch<React.SetStateAction<string[]>>;
    loading: boolean;
    loggedIn: boolean;
    searchTerm: string;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    fetchData: () => Promise<void>;
    handleUpdateSeenAt: (id: string) => Promise<void>;
    handleToggleImportant: (id: string) => Promise<void>;
    handleDeleteNotification: (id: string) => Promise<void>;
    handleMarkUnseen: (id: string) => Promise<void>;
    handleCheckboxChangeTab: (id: string, checked: boolean) => void;
    handleDeleteSelected: () => Promise<void>;
    handleMarkSelectedAsRead: () => Promise<void>;
    handleMarkSelectedAsUnread: () => Promise<void>;
    handleMarkSelectedAsImportant: () => Promise<void>;
    handleMarkSelectedAsUnimportant: () => Promise<void>;
    // Các giá trị này có thể vẫn hữu ích nếu cần logic select all dựa trên search term ở đâu đó
    _internalSelectAllFilteredChecked: boolean;
    _internalHandleSelectAllFilteredChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const useNotifications = (): UseNotificationsReturn => {
    const [searchTerm, setSearchTerm] = useState('');
    const [userId, setUserId] = useState<string>('');

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                if (user && user.id) {
                    setUserId(user.id);
                } else {
                    console.error("User data from localStorage is missing id:", user);
                }
            } catch (error) {
                console.error("Error parsing user data from localStorage:", error);
            }
        }
    }, []);

    const {
        notifications: initialNotifications,
        loading,
        loggedIn,
        fetchData
    } = useNotificationData(userId);

    const {
        notifications: rawNotifications,
        setNotifications,
        handleUpdateSeenAt,
        handleToggleImportant,
        handleDeleteNotification,
        handleMarkUnseen,
        updateUserNotifications
    } = useNotificationState(initialNotifications, userId);

    const sortedNotifications = useMemo(() => {
        return [...rawNotifications].sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            const validTimeA = !isNaN(timeA) ? timeA : 0;
            const validTimeB = !isNaN(timeB) ? timeB : 0;
            return validTimeB - validTimeA; // Mới nhất lên trước
        });
    }, [rawNotifications]);

    useEffect(() => {
        // Cập nhật rawNotifications khi initialNotifications (từ fetch) thay đổi
        setNotifications(initialNotifications);
    }, [initialNotifications, setNotifications]);

    // Danh sách lọc chỉ bởi search term (từ danh sách đã sắp xếp)
    const filteredNotificationsBySearch = useFilteredNotifications(sortedNotifications, searchTerm);

    // useSelection sẽ hoạt động trên danh sách đã lọc bởi search term.
    // `checkedIndices` và `setCheckedIndices` sẽ được NotificationsTab sử dụng và quản lý.
    const {
        checkedIndices,
        setCheckedIndices,
        selectAllChecked: selectAllForFilteredLogic,
        handleCheckboxChange: handleCheckboxChangeSelection,
        handleSelectAllChange: handleSelectAllForFilteredLogicChange
    } = useSelection(
        useMemo(() => filteredNotificationsBySearch.map(n => n.id), [filteredNotificationsBySearch])
    );

    // Các hành động hàng loạt sẽ hoạt động trên `checkedIndices` và `sortedNotifications` (toàn bộ danh sách đã sắp xếp)
    // vì `updateUserNotifications` thường cần cập nhật state tổng.
    const {
        handleMarkSelectedAsRead,
        handleMarkSelectedAsUnread,
        // allSelectedAreRead không dùng từ đây, component tự tính
    } = useBulkReadActions(checkedIndices, sortedNotifications, updateUserNotifications);

    const {
        handleMarkSelectedAsImportant,
        handleMarkSelectedAsUnimportant,
        // allSelectedAreImportant không dùng từ đây, component tự tính
    } = useBulkImportantActions(checkedIndices, sortedNotifications, updateUserNotifications);

    const handleCheckboxChangeTab = useCallback(
        (id: string, checked: boolean) => {
            handleCheckboxChangeSelection(id, checked);
        },
        [handleCheckboxChangeSelection]
    );

    const handleDeleteSelected = useCallback(async () => {
        const idsToDelete = new Set(checkedIndices);
        if (idsToDelete.size === 0) return;

        // Giả sử updateUserNotifications có thể xử lý việc xóa hoặc đánh dấu đã xóa
        // Hoặc bạn có thể gọi API xóa cho từng ID ở đây
        // Ví dụ: client-side update trước
        const updatedNotifications = rawNotifications.filter(n => !idsToDelete.has(n.id));
        setNotifications(updatedNotifications); // Cập nhật state local

        // Gọi API để xóa trên server (ví dụ)
        // await Promise.all(Array.from(idsToDelete).map(id => someDeleteApiService(id)));
        // Hoặc một hàm như:
        // await updateUserNotifications({ deletedIds: Array.from(idsToDelete) });

        setCheckedIndices([]); // Quan trọng: Reset lại danh sách chọn sau khi xóa
    }, [checkedIndices, rawNotifications, setNotifications, setCheckedIndices, /* updateUserNotifications */]);

    useEffect(() => {
        if (userId) {
            fetchData();
        }
    }, [userId, fetchData]);

    return {
        notifications: sortedNotifications,
        checkedIndices,
        setCheckedIndices, // Export để component quản lý
        loading,
        loggedIn,
        searchTerm,
        setSearchTerm,
        fetchData,
        handleUpdateSeenAt,
        handleToggleImportant,
        handleDeleteNotification,
        handleMarkUnseen,
        handleCheckboxChangeTab, // Export để component sử dụng
        handleDeleteSelected,
        handleMarkSelectedAsRead,
        handleMarkSelectedAsUnread,
        handleMarkSelectedAsImportant,
        handleMarkSelectedAsUnimportant,
        _internalSelectAllFilteredChecked: selectAllForFilteredLogic,
        _internalHandleSelectAllFilteredChange: handleSelectAllForFilteredLogicChange,
    };
};

export default useNotifications;