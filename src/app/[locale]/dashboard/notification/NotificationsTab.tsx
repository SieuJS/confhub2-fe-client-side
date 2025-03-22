// NotificationsTab.tsx
import React, { useEffect, useCallback, useState } from 'react';
import NotificationItem from './NotificationItem';
import NotificationDetails from './NotificationDetails';
import useNotifications from '../../../../hooks/dashboard/notification/useNotifications';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const NotificationsTab: React.FC = () => {
    const {
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
    } = useNotifications();

    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedNotificationId = searchParams.get('id');
    const tab = searchParams.get('tab');

    // Add filter state
    const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'important'>('all');


    useEffect(() => {
        if (selectedNotificationId) {
            const notification = notifications.find(n => n.id === selectedNotificationId);
            if (notification && !notification.seenAt) {
                handleUpdateSeenAt(selectedNotificationId);
            }
        }
    }, [selectedNotificationId, handleUpdateSeenAt, notifications]);

    const handleBackToNotifications = () => {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete('id');
        router.push(`${pathname}?${newSearchParams.toString()}`);
    };

    const handleCheckboxChange = useCallback(
        (notificationId: string, checked: boolean) => {
            handleCheckboxChangeTab(notificationId, checked);
        },
        [handleCheckboxChangeTab]
    );

    // Filter notifications based on the selected filter
    const displayedNotifications = React.useMemo(() => {
        let result = filteredNotifications;

        if (filter === 'unread') {
            result = result.filter(n => !n.seenAt);
        } else if (filter === 'read') {
            result = result.filter(n => n.seenAt);
        } else if (filter === 'important') {
            result = result.filter(n => n.isImportant);
        }
        return result;
    }, [filteredNotifications, filter]);



    if (!loggedIn) {
        return (<div className='container mx-auto p-4'>Please log in to view notifications.</div>);
    }

    if (tab !== 'notifications') {
        return null;
    }

    if (loading) {
        return <div className='container mx-auto p-4'>Loading...</div>;
    }

    if (selectedNotificationId) {
        const notification = notifications.find(n => n.id === selectedNotificationId);
        if (notification) {
            return (
                <NotificationDetails
                    notification={notification}
                    onBack={handleBackToNotifications}
                    onDelete={handleDeleteNotification}
                    onToggleImportant={handleToggleImportant}
                />
            );
        } else {
            return <div>Notification not found.  <button onClick={handleBackToNotifications}>Back</button></div>;
        }
    }

    return (
        <div className='container mx-auto p-6'>
            {/* Search Bar */}
            <div className='mb-4'>
                <input
                    type='text'
                    placeholder='Search notifications...'
                    className='w-1/2 rounded-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Filter Buttons */}
            <div className="mb-4 flex space-x-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-2 rounded ${filter === 'unread' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Unread
                </button>
                <button
                    onClick={() => setFilter('read')}
                    className={`px-4 py-2 rounded ${filter === 'read' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Read
                </button>
                <button
                    onClick={() => setFilter('important')}
                    className={`px-4 py-2 rounded ${filter === 'important' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Important
                </button>
            </div>

            <div className='mb-4 flex items-center'>
                <input
                    type='checkbox'
                    id='select-all'
                    className='ml-4 mr-2 h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    checked={selectAllChecked}
                    onChange={handleSelectAllChange}
                    aria-label='Select all notifications'
                />
                <label
                    htmlFor='select-all'
                    className='mr-4 cursor-pointer text-sm text-gray-700'
                >
                    Select All
                </label>
                {checkedIndices.length > 0 && (
                    <>
                        <button
                            onClick={allSelectedAreRead ? handleMarkSelectedAsUnread : handleMarkSelectedAsRead}
                            className='mr-2 flex items-center rounded bg-blue-500 px-4 py-1 font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400'
                            aria-label={allSelectedAreRead ? 'Mark Selected as Unread' : 'Mark Selected as Read'}
                        >
                            {allSelectedAreRead ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail mr-2">
                                        <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                    Mark As Unread
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail-open mr-2">
                                        <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" /><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
                                    </svg>
                                    Mark As Read
                                </>
                            )}
                        </button>
                        <button
                            onClick={allSelectedAreImportant ? handleMarkSelectedAsUnimportant : handleMarkSelectedAsImportant}
                            className='mr-2 flex items-center rounded bg-yellow-500 px-4 py-1 font-bold text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400'
                            aria-label={allSelectedAreImportant ? 'Mark Selected as Unimportant' : 'Mark Selected as Important'}
                        >
                            {allSelectedAreImportant ? (
                                <>
                                    {/*  Unimportant Icon (Outline Star) */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star mr-2">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>

                                    Mark As Unimportant
                                </>
                            ) : (
                                <>
                                    {/* Important Icon (Filled Star) */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star mr-2">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                    Mark As Important
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleDeleteSelected}
                            className='flex items-center rounded bg-red-500 px-4 py-1 font-bold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400'
                            aria-label='Delete Selected'
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2 mr-2">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                <line x1="10" x2="10" y1="11" y2="17" />
                                <line x1="14" x2="14" y1="11" y2="17" />
                            </svg>
                            Delete Selected
                        </button>
                    </>
                )}
            </div>

            <div className='overflow-hidden bg-white shadow'>
                {displayedNotifications.length === 0 ? (
                    <p className='p-4 text-gray-600'>You have no notifications.</p>
                ) : (
                    displayedNotifications.map(notification => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onDelete={() => handleDeleteNotification(notification.id)}
                            isChecked={checkedIndices.includes(notification.id)}
                            onCheckboxChange={(checked) => handleCheckboxChange(notification.id, checked)}
                            onToggleImportant={handleToggleImportant}
                            onMarkUnseen={handleMarkUnseen}
                            notificationId={notification.id}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsTab;