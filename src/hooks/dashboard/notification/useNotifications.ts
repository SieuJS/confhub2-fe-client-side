
// src/hooks/useNotifications.ts
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
    fetchData: () => Promise<void>; // Add fetchData
}

const useNotifications = (): UseNotificationsReturn => {
    const [searchTerm, setSearchTerm] = useState('');
    const [userId, setUserId] = useState<string>('');

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setUserId(user.id);
        }
    }, []);

    const {
        notifications: initialNotifications,
        loading,
        loggedIn,
        fetchData
    } = useNotificationData(userId);


    const {
        notifications,
        setNotifications, // We won't directly use setNotifications *after* initialization
        handleUpdateSeenAt,
        handleToggleImportant,
        handleDeleteNotification,
        handleMarkUnseen,
        updateUserNotifications
    } = useNotificationState(initialNotifications, userId);  // Initialize with initialNotifications


    const filteredNotifications = useFilteredNotifications(notifications, searchTerm);

    const {
        checkedIndices,
        setCheckedIndices,
        selectAllChecked,
        handleCheckboxChange: handleCheckboxChangeSelection,
        handleSelectAllChange
    } = useSelection(
        useMemo(() => filteredNotifications.map(n => n.id), [filteredNotifications]) // <-- Memoize tại đây
    );

    const {
        handleMarkSelectedAsRead,
        handleMarkSelectedAsUnread,
        allSelectedAreRead
    } = useBulkReadActions(checkedIndices, notifications, updateUserNotifications);

    const {
        handleMarkSelectedAsImportant,
        handleMarkSelectedAsUnimportant,
        allSelectedAreImportant
    } = useBulkImportantActions(checkedIndices, notifications, updateUserNotifications);

    const handleCheckboxChangeTab = useCallback(
        (id: string, checked: boolean) => {
            handleCheckboxChangeSelection(id, checked);
        },
        [handleCheckboxChangeSelection]
    );

    const handleDeleteSelected = useCallback(async () => {
        const updatedNotifications = notifications.map(n =>
            checkedIndices.includes(n.id) ? { ...n, deletedAt: new Date().toISOString() } : n
        );
        await updateUserNotifications(updatedNotifications);
        // setCheckedIndices([]); // REMOVE THIS LINE
    }, [checkedIndices, notifications, updateUserNotifications]); // Remove setCheckedIndices from the dependency array


    // UseEffect to initialize the state, ONLY ONCE
    useEffect(() => {
        if (initialNotifications.length > 0) {
            setNotifications(initialNotifications);
        }
    }, [initialNotifications, setNotifications]);

    // Refetch data when userId changes.
    useEffect(() => {
        if (userId) {
            fetchData();
        }
    }, [userId, fetchData]);

    return {
        notifications,
        checkedIndices,
        selectAllChecked,
        loading,
        loggedIn,
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
        fetchData,
    };
};

export default useNotifications;