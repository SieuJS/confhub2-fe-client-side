// NotificationsTab.tsx (Corrected)
import React from 'react'
import NotificationItem from './NotificationItem'
import useNotifications from '../../../../hooks/dashboard/notification/useNotifications' // Import the hook

const NotificationTab: React.FC = () => {
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
    setSearchTerm
  } = useNotifications() // Use the hook

  if (!loggedIn) {
    return (
      <div className='container mx-auto p-4'>
        Please log in to view notifications.
      </div>
    )
  }

  if (loading) {
    return <div className='container mx-auto p-4'>Loading...</div>
  }

  return (
    <div className='container mx-auto p-6'>
      {/* Search Bar */}
      <div className='mb-4'>
        <input
          type='text'
          placeholder='Search notifications...'
          className='w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className='mb-4 flex items-center'>
        <input
          type='checkbox'
          id='select-all'
          className='mr-2 h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500'
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
          <button
            onClick={handleDeleteSelected}
            className='rounded bg-red-500 px-4 py-1 font-bold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400'
          >
            Delete Selected
          </button>
        )}
      </div>

      <div className='overflow-hidden  bg-white shadow'>
        {filteredNotifications.length === 0 ? (
          <p className='p-4 text-gray-600'>You have no notifications.</p>
        ) : (
          filteredNotifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onDelete={() => handleDeleteNotification(notification.id)} // Corrected onDelete
              isChecked={checkedIndices.includes(notification.id)}
              onCheckboxChange={(checked) => handleCheckboxChangeTab(notification.id, checked)} // Corrected onCheckboxChange
              onUpdateSeenAt={handleUpdateSeenAt}
              onToggleImportant={handleToggleImportant}
              onMarkUnseen={handleMarkUnseen}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default NotificationTab