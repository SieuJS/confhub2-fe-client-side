// src/hooks/dashboard/notification/useBulkReadActions.ts
import { useCallback } from 'react';
import { Notification } from '@/src/models/response/user.response';

// === THAY ĐỔI ===
// Định nghĩa lại kiểu cho hàm cập nhật để khớp với `useNotificationState`
type PatchFunction = (patches: Array<{ id: string } & Partial<Notification>>) => void;

const useBulkReadActions = (
    selectedIds: string[],
    notifications: Notification[],
    // === THAY ĐỔI ===
    // Tên biến được cập nhật để rõ ràng hơn
    patchUserNotifications: PatchFunction
) => {
    const handleMarkSelectedAsRead = useCallback(async () => {
        // === THAY ĐỔI ===
        // Chỉ tạo các bản vá cho những thông báo thực sự cần thay đổi.
        const patches = selectedIds
            .map(id => notifications.find(n => n.id === id)) // Tìm đối tượng notification đầy đủ
            .filter(n => n && n.seenAt === null) // Lọc những cái chưa đọc
            .map(n => ({ id: n!.id, seenAt: new Date().toISOString() })); // Tạo bản vá

        if (patches.length > 0) {
            await patchUserNotifications(patches);
        }
    }, [selectedIds, notifications, patchUserNotifications]);

    const handleMarkSelectedAsUnread = useCallback(async () => {
        // === THAY ĐỔI ===
        // Tương tự, chỉ tạo bản vá cho những cái cần thay đổi.
        const patches = selectedIds
            .map(id => notifications.find(n => n.id === id))
            .filter(n => n && n.seenAt !== null) // Lọc những cái đã đọc
            .map(n => ({ id: n!.id, seenAt: null })); // Tạo bản vá

        if (patches.length > 0) {
            await patchUserNotifications(patches);
        }
    }, [selectedIds, notifications, patchUserNotifications]);

    const allSelectedAreRead = selectedIds.length > 0 && selectedIds.every(id => {
        const notification = notifications.find(n => n.id === id);
        return notification?.seenAt !== null;
    });

    return { handleMarkSelectedAsRead, handleMarkSelectedAsUnread, allSelectedAreRead };
};

export default useBulkReadActions;