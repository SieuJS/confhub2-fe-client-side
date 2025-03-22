// src/hooks/useNotifications.ts (The Orchestrator)
import { useState, useEffect, useCallback } from 'react';
import useNotificationData from './useNotificationData';
import useNotificationState from './useNotificationState';
import useSelection from './useSelection';
import useFilteredNotifications from './useFilteredNotifications';
import useBulkReadActions from './useBulkReadActions';
import useBulkImportantActions from './useBulkImportantActions';
import { Notification } from '@/src/models/response/user.response'; // Import Notification


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
    fetchData: () => Promise<void>; // Add fetchData to the return type
}

const useNotifications = (): UseNotificationsReturn => {
    const [searchTerm, setSearchTerm] = useState('');
    const [userId, setUserId] = useState<string>('');

    // Get userId from local storage.  This is better than storing it in the hook's state.
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
        setNotifications,
        handleUpdateSeenAt,
        handleToggleImportant,
        handleDeleteNotification,
        handleMarkUnseen,
        updateNotifications
    } = useNotificationState(initialNotifications, userId);

    const filteredNotifications = useFilteredNotifications(notifications, searchTerm);

    const {
        checkedIndices,
        setCheckedIndices,
        selectAllChecked,
        handleCheckboxChange: handleCheckboxChangeSelection,
        handleSelectAllChange
    } = useSelection(filteredNotifications.map(n => n.id));


    const {
        handleMarkSelectedAsRead,
        handleMarkSelectedAsUnread,
        allSelectedAreRead
    } = useBulkReadActions(checkedIndices, notifications, updateNotifications);

    const {
        handleMarkSelectedAsImportant,
        handleMarkSelectedAsUnimportant,
        allSelectedAreImportant
    } = useBulkImportantActions(checkedIndices, notifications, updateNotifications);



    // Adapt the checkbox change handler for the tab
    const handleCheckboxChangeTab = useCallback(
        (id: string, checked: boolean) => {
            handleCheckboxChangeSelection(id, checked); // Use the selection hook's handler
        },
        [handleCheckboxChangeSelection]
    );

    const handleDeleteSelected = useCallback(async () => {
        const updatedNotifications = notifications.map(n =>
            checkedIndices.includes(n.id) ? { ...n, deletedAt: new Date().toISOString() } : n
        );
        await updateNotifications(updatedNotifications);
        setCheckedIndices([]); // Clear after deletion
    }, [checkedIndices, notifications, updateNotifications, setCheckedIndices]);


    // Keep notifications in sync with initialNotifications.  Important for re-fetching.
    useEffect(() => {
        setNotifications(initialNotifications);
    }, [initialNotifications, setNotifications]);


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