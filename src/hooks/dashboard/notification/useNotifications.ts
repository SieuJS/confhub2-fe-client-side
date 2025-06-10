// src/hooks/dashboard/notification/useNotifications.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import useNotificationData from './useNotificationData';
import useNotificationState from './useNotificationState';
import useSelection from './useSelection';
import useFilteredNotifications from './useFilteredNotifications';
import useBulkReadActions from './useBulkReadActions';
import useBulkImportantActions from './useBulkImportantActions';
import { Notification } from '@/src/models/response/user.response';

interface UseNotificationsReturn {
  notifications: Notification[];
  checkedIndices: string[];
  selectAllChecked: boolean;
  loading: boolean;
  loggedIn: boolean;
  isBanned: boolean; // THÊM VÀO INTERFACE RETURN
  initialLoad: boolean; // THÊM VÀO INTERFACE RETURN
  searchTerm: string;
  filteredNotifications: Notification[];
  handleUpdateSeenAt: (id: string) => Promise<void>;
  handleToggleImportant: (id: string) => Promise<void>;
  handleDeleteNotification: (id: string) => Promise<void>;
  handleMarkUnseen: (id: string) => Promise<void>;
  handleCheckboxChangeTab: (id: string, checked: boolean) => void;
  handleDeleteSelected: () => Promise<void>;
  handleSelectAllChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleMarkSelectedAsRead: () => Promise<void>;
  handleMarkSelectedAsUnread: () => Promise<void>;
  allSelectedAreRead: boolean;
  handleMarkSelectedAsImportant: () => Promise<void>;
  handleMarkSelectedAsUnimportant: () => Promise<void>;
  allSelectedAreImportant: boolean;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  fetchData: () => Promise<void>;
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
          console.error('User data from localStorage is missing id:', user);
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
  }, []);

  const {
    notifications: initialNotifications,
    loading,
    loggedIn,
    isBanned, // NHẬN TỪ useNotificationData
    initialLoad, // NHẬN TỪ useNotificationData
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

      return validTimeB - validTimeA;
    });
  }, [rawNotifications]);

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications, setNotifications]);

  const filteredNotifications = useFilteredNotifications(sortedNotifications, searchTerm);

  const {
    checkedIndices,
    setCheckedIndices,
    selectAllChecked,
    handleCheckboxChange: handleCheckboxChangeSelection,
    handleSelectAllChange
  } = useSelection(
    useMemo(() => filteredNotifications.map(n => n.id), [filteredNotifications])
  );

  const {
    handleMarkSelectedAsRead,
    handleMarkSelectedAsUnread,
    allSelectedAreRead
  } = useBulkReadActions(checkedIndices, sortedNotifications, updateUserNotifications);

  const {
    handleMarkSelectedAsImportant,
    handleMarkSelectedAsUnimportant,
    allSelectedAreImportant
  } = useBulkImportantActions(checkedIndices, sortedNotifications, updateUserNotifications);

  const handleCheckboxChangeTab = useCallback(
    (id: string, checked: boolean) => {
      handleCheckboxChangeSelection(id, checked);
    },
    [handleCheckboxChangeSelection]
  );

  const handleDeleteSelected = useCallback(async () => {
    const idsToDelete = new Set(checkedIndices);
    const updatedNotifications = rawNotifications.filter(n => !idsToDelete.has(n.id));

    try {
      await updateUserNotifications(updatedNotifications); // Hàm này cần xử lý xóa trên server và cập nhật state
      setCheckedIndices([]);
    } catch (error) {
      console.error('Failed to delete selected notifications:', error);
    }
  }, [checkedIndices, rawNotifications, updateUserNotifications, setCheckedIndices]);


  // Không cần useEffect để gọi fetchData ở đây nữa vì useNotificationData đã tự gọi nó
  // khi userId thay đổi hoặc khi component mount (thông qua dependency userId)

  return {
    notifications: sortedNotifications,
    checkedIndices,
    selectAllChecked,
    loading,
    loggedIn,
    isBanned, // TRẢ VỀ isBanned
    initialLoad, // TRẢ VỀ initialLoad
    searchTerm,
    filteredNotifications,
    handleUpdateSeenAt,
    handleToggleImportant,
    handleDeleteNotification,
    handleMarkUnseen,
    handleCheckboxChangeTab,
    handleDeleteSelected,
    handleSelectAllChange,
    handleMarkSelectedAsRead,
    handleMarkSelectedAsUnread,
    allSelectedAreRead,
    handleMarkSelectedAsImportant,
    handleMarkSelectedAsUnimportant,
    allSelectedAreImportant,
    setSearchTerm,
    fetchData // Giữ fetchData nếu bạn muốn cung cấp khả năng refresh thủ công từ component
  };
};

export default useNotifications;