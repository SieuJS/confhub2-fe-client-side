// src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react'
import {
  Notification,
  UserResponse
} from '@/src/models/response/user.response'
import { updateUser } from '@/src/api/user/updateUser'

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
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [checkedIndices, setCheckedIndices] = useState<string[]>([])
  const [selectAllChecked, setSelectAllChecked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  const updateNotifications = useCallback(
    async (updatedNotifications: Notification[], userId: string) => {
        const updatedData: Partial<UserResponse> = {
            notifications: updatedNotifications,
        };
        await updateUser(userId, updatedData);
        setNotifications(updatedNotifications);
    },
      [],
  )

  const handleUpdateSeenAt = useCallback(
    async (id: string) => {
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
        await updateNotifications(updatedNotifications, userId)
      } catch (error) {
        console.error('Failed to update seenAt:', error)
      }
    },
    [notifications, userId, updateNotifications]
  )

  const handleToggleImportant = useCallback(
    async (id: string) => {
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
        );

        await updateNotifications(updatedNotifications, userId);

      } catch (error) {
        console.error('Failed to toggle isImportant:', error)
      }
    },
    [notifications, userId, updateNotifications]
  )

  const handleDeleteNotification = useCallback(
    async (id: string) => {
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

        await updateNotifications(updatedNotifications, userId);

      } catch (error) {
        console.error('Failed to delete notification:', error)
      }
    },
    [notifications, userId, updateNotifications]
  )

  const handleMarkUnseen = useCallback(
    async (id: string) => {
      try {
        const notificationToUpdate = notifications.find(n => n.id === id)
        if (!notificationToUpdate) {
          console.error('Notification not found:', id)
          return
        }

        const updatedNotification: Notification = {
          ...notificationToUpdate,
          seenAt: '' //or null, depends on the backend
        }

        const updatedNotifications = notifications.map(n =>
          n.id === id ? updatedNotification : n
        )
        await updateNotifications(updatedNotifications, userId);

      } catch (error) {
        console.error('Failed to mark notification as unseen:', error)
      }
    },
    [notifications, userId, updateNotifications]
  )

    const handleCheckboxChangeTab = useCallback((id: string, checked: boolean) => {
        if (checked) {
            setCheckedIndices((prevIndices) => [...prevIndices, id]);
        } else {
            setCheckedIndices((prevIndices) => prevIndices.filter((i) => i !== id));
        }
    }, []);

  const handleDeleteSelected = useCallback(async () => {
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

      await updateNotifications(updatedNotifications, userId)
      setCheckedIndices([])
      setSelectAllChecked(false)
    } catch (error) {
      console.error('Failed to delete selected notifications:', error)
    }
  }, [checkedIndices, notifications, userId, updateNotifications])

  const handleSelectAllChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked
      setSelectAllChecked(checked)
      if (checked) {
        const allIds = notifications.map(n => n.id)
        setCheckedIndices(allIds)
      } else {
        setCheckedIndices([])
      }
    },
    [notifications]
  )

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
        ) //  replace with a constant.
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


    const filteredNotifications = notifications
        .filter(
            (notification) =>
                notification.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                notification.message.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter((n) => !n.deletedAt);

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
    setSearchTerm
  }
}

export default useNotifications