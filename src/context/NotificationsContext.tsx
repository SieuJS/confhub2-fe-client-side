'use client'

// contexts/NotificationsContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode
} from 'react'
import { Notification, UserResponse } from '../models/response/user.response' // Adjust path as needed
import { updateUser } from '../api/user/updateUser'

interface NotificationsContextProps {
  notifications: Notification[]
  loading: boolean
  fetchNotifications: () => Promise<void> // Function to fetch/refresh notifications
  markNotificationAsSeen: (notificationId: string) => Promise<void>
  markNotificationAsUnseen: (notificationId: string) => Promise<void>
  toggleNotificationImportance: (notificationId: string) => Promise<void>
}

const NotificationsContext = createContext<
  NotificationsContextProps | undefined
>(undefined)

interface NotificationsProviderProps {
  children: ReactNode
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({
  children
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setUserId(user.id)
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const userData = localStorage.getItem('user')

      if (!userData) {
        setLoading(false)
        return
      }

      const user = JSON.parse(userData)
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

  const markNotificationAsSeen = async (notificationId: string) => {
    try {
      const notificationToUpdate = notifications.find(
        n => n.id === notificationId
      )
      if (!notificationToUpdate) {
        console.error('Notification not found:', notificationId)
        return
      }

      const updatedNotification: Notification = {
        ...notificationToUpdate,
        seenAt: new Date().toISOString()
      }

      const updatedNotifications = notifications.map(n =>
        n.id === notificationId ? updatedNotification : n
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

  const markNotificationAsUnseen = async (notificationId: string) => {
    try {
      const notificationToUpdate = notifications.find(
        n => n.id === notificationId
      )
      if (!notificationToUpdate) {
        console.error('Notification not found: ', notificationId)
        return
      }

      const updatedNotification: Notification = {
        ...notificationToUpdate,
        seenAt: ''
      }

      const updatedNotifications = notifications.map(n =>
        n.id === notificationId ? updatedNotification : n
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

  const toggleNotificationImportance = async (notificationId: string) => {
    try {
      const notificationToUpdate = notifications.find(
        n => n.id === notificationId
      )
      if (!notificationToUpdate) {
        console.error('Notification not found:', notificationId)
        return
      }

      const updatedNotification: Notification = {
        ...notificationToUpdate,
        isImportant: !notificationToUpdate.isImportant
      }

      const updatedNotifications = notifications.map(n =>
        n.id === notificationId ? updatedNotification : n
      )

      const updatedData: Partial<UserResponse> = {
        notifications: updatedNotifications
      }

      await updateUser(userId, updatedData) // Update via API
      setNotifications(updatedNotifications) // Update local state
    } catch (error) {
      console.error('Failed to toggle isImportant:', error)
    }
  }

  // Fetch notifications when the provider mounts
  useEffect(() => {
    if (userId) {
      fetchNotifications()
    }
  }, [userId])

  const contextValue: NotificationsContextProps = {
    notifications: notifications.filter(n => !n.deletedAt),
    loading,
    fetchNotifications,
    markNotificationAsSeen,
    markNotificationAsUnseen,
    toggleNotificationImportance
  }

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationsProvider'
    )
  }
  return context
}
