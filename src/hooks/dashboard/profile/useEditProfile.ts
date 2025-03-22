// src/hooks/useEditProfile.ts
import { useState } from 'react'
import { UserResponse } from '@/src/models/response/user.response'
import { updateUser } from '@/src/api/user/updateUser'
import { useLocalStorage } from 'usehooks-ts'

export const useEditProfile = (
  initialUserData: UserResponse | null,
  setUser: (value: any) => void,
  setUserData: (value: UserResponse | null) => void,
  setError: (value: string | null) => void
) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<Partial<UserResponse>>(
    initialUserData || {}
  )
  const [user] = useLocalStorage<{
    firstname: string
    lastname: string
    email: string
    id: string
  } | null>('user', null)

  const handleEditClick = () => {
    setIsEditing(true)
    setEditedData(initialUserData || {}) // Reset editedData
  }

  const handleSaveClick = async () => {
    if (!initialUserData) return;

    try {
      const updatePayload: Partial<UserResponse> = {};

      for (const key in editedData) {
        // Use hasOwnProperty and keyof for type safety
      if (Object.hasOwn(editedData, key)) {
        const typedKey = key as keyof UserResponse;
          if (editedData[typedKey] !== initialUserData[typedKey]) {
            updatePayload[typedKey] = editedData[typedKey] as any;
        }
      }
    }


      if (Object.keys(updatePayload).length === 0) {
        setIsEditing(false)
        return
      }

      const updatedUser = await updateUser(user!.id, updatePayload)
      setUserData(updatedUser)
      setIsEditing(false)

      if (user) {
        const updatedLocalStorageUser = { ...user }
        if (updatePayload.firstName) {
          updatedLocalStorageUser.firstname = updatePayload.firstName
        }
        if (updatePayload.lastName) {
          updatedLocalStorageUser.lastname = updatePayload.lastName
        }
        localStorage.setItem('user', JSON.stringify(updatedLocalStorageUser))
        setUser(updatedLocalStorageUser)
      }

      setError(null)
    } catch (error: any) {
      console.error('Failed to update user:', error)
      setError(error.message || 'Update user failed')
    }
  }

  const handleCancelClick = () => {
    setIsEditing(false)
    setEditedData(initialUserData || {}) // Reset to original data
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    if (name === 'aboutme' && value.length > 100) {
      return
    }

    setEditedData({
      ...editedData,
      [name]: value,
    })
  }

  const handleInterestedTopicsChange = (topic: string) => {
    setEditedData((prevData) => {
      const currentTopics = prevData.interestedTopics || []
      const updatedTopics = currentTopics.includes(topic)
        ? currentTopics.filter((t) => t !== topic)
        : [...currentTopics, topic]

      const uniqueTopics = Array.from(new Set(updatedTopics))
      return { ...prevData, interestedTopics: uniqueTopics }
    })
  }

  return {
    isEditing,
    setIsEditing,
    editedData,
    setEditedData,
    handleEditClick,
    handleSaveClick,
    handleCancelClick,
    handleInputChange,
    handleInterestedTopicsChange,
  }
}