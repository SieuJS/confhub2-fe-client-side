// NotificationsTab.tsx
import React, { useState, useEffect } from 'react'
import {
  Notification,
  UserResponse
} from '../../../models/response/user.response'
import NotificationItem from './NotificationItem'
import { updateUser } from '../../../api/user/updateUser'

interface NotificationTabProps {
  onDeleteNotification?: (id: string) => void
}

const NotificationTab: React.FC<NotificationTabProps> = ({
  onDeleteNotification
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [checkedIndices, setCheckedIndices] = useState<string[]>([])
  const [selectAllChecked, setSelectAllChecked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('') // Add search term state

  const handleUpdateSeenAt = async (id: string) => {
    try {
      const notificationToUpdate = notifications.find(n => n.id === id)
      if (!notificationToUpdate) {
        console.error('Notification not found:', id)
        return
      }

      const updatedNotification: Notification = {
        ...notificationToUpdate,
        seenAt: new Date().toISOString()
      }

      const updatedNotifications = notifications.map(n =>
        n.id === id ? updatedNotification : n
      )

      const updatedData: Partial<UserResponse> = {
        notifications: updatedNotifications
      }

      await updateUser(userId, updatedData)
      setNotifications(updatedNotifications)
    } catch (error) {
      console.error('Failed to update seenAt:', error)
    }
  }

  const handleToggleImportant = async (id: string) => {
    try {
      const notificationToUpdate = notifications.find(n => n.id === id)
      if (!notificationToUpdate) {
        console.error('Notification not found:', id)
        return
      }

      const updatedNotification: Notification = {
        ...notificationToUpdate,
        isImportant: !notificationToUpdate.isImportant
      }

      const updatedNotifications = notifications.map(n =>
        n.id === id ? updatedNotification : n
      )

      const updatedData: Partial<UserResponse> = {
        notifications: updatedNotifications
      }

      await updateUser(userId, updatedData)
      setNotifications(updatedNotifications)
    } catch (error) {
      console.error('Failed to toggle isImportant:', error)
    }
  }

  const handleDeleteNotification = async (id: string) => {
    try {
      const notificationToDelete = notifications.find(n => n.id === id)

      if (!notificationToDelete) {
        console.error('Notification not found:', id)
        return
      }

      const updatedNotification: Notification = {
        ...notificationToDelete,
        deletedAt: new Date().toISOString()
      }

      const updatedNotifications = notifications.map(n =>
        n.id === id ? updatedNotification : n
      )

      const updatedData: Partial<UserResponse> = {
        notifications: updatedNotifications
      }

      await updateUser(userId, updatedData)
      setNotifications(updatedNotifications)
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const handleMarkUnseen = async (id: string) => {
    try {
      const notificationToUpdate = notifications.find(n => n.id === id)
      if (!notificationToUpdate) {
        console.error('Notification not found:', id)
        return
      }

      const updatedNotification: Notification = {
        ...notificationToUpdate,
        seenAt: ''
      }

      const updatedNotifications = notifications.map(n =>
        n.id === id ? updatedNotification : n
      )

      const updatedData: Partial<UserResponse> = {
        notifications: updatedNotifications
      }

      await updateUser(userId, updatedData)
      setNotifications(updatedNotifications)
    } catch (error) {
      console.error('Failed to mark notification as unseen:', error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem('user')
        if (!userData) {
          setLoggedIn(false)
          setLoading(false)
          return
        }

        const user = JSON.parse(userData)
        setLoggedIn(true)
        setUserId(user.id)
        const userResponse = await fetch(
          `http://localhost:3000/api/v1/user/${user.id}`
        )
        if (!userResponse.ok) {
          throw new Error(`HTTP error! status: ${userResponse.status}`)
        }
        const userDetails: UserResponse = await userResponse.json()
        setNotifications(userDetails.notifications || [])
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCheckboxChangeTab = (id: string, checked: boolean) => {
    if (checked) {
      setCheckedIndices([...checkedIndices, id])
    } else {
      setCheckedIndices(checkedIndices.filter(i => i !== id))
    }
  }

  const handleDeleteSelected = async () => {
    try {
      let updatedNotifications = [...notifications]

      for (const id of checkedIndices) {
        const notificationToDelete = updatedNotifications.find(n => n.id === id)

        if (!notificationToDelete) {
          console.error('Notification not found:', id)
          continue
        }
        const index = updatedNotifications.findIndex(n => n.id === id)

        updatedNotifications[index] = {
          ...notificationToDelete,
          deletedAt: new Date().toISOString()
        }
      }

      const updatedData: Partial<UserResponse> = {
        notifications: updatedNotifications
      }

      await updateUser(userId, updatedData)

      setNotifications(updatedNotifications)
      setCheckedIndices([])
      setSelectAllChecked(false)
    } catch (error) {
      console.error('Failed to delete selected notifications:', error)
    }
  }

  const handleSelectAllChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = event.target.checked
    setSelectAllChecked(checked)
    if (checked) {
      const allIds = notifications.map(n => n.id)
      setCheckedIndices(allIds)
    } else {
      setCheckedIndices([])
    }
  }

  const hasCheckedNotifications = checkedIndices.length > 0

  // Filter notifications based on search term
  const filteredNotifications = notifications
    .filter(
      notification =>
        notification.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(n => !n.deletedAt)

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
        {hasCheckedNotifications && (
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
              onDelete={() => handleDeleteNotification(notification.id)}
              isChecked={checkedIndices.includes(notification.id)}
              onCheckboxChange={checked =>
                handleCheckboxChangeTab(notification.id, checked)
              }
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
