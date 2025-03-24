// src/hooks/useUserData.ts
import { useState, useEffect } from 'react'
import { UserResponse } from '@/src/models/response/user.response'
import { getUserById } from '../../../app/api/user/getUserById'
import { useLocalStorage } from 'usehooks-ts'

export const useUserData = () => {
  const [userData, setUserData] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useLocalStorage<{
    firstname: string
    lastname: string
    email: string
    id: string
  } | null>('user', null)

  const [loginStatus] = useLocalStorage<string | null>(
    'loginStatus',
    null
  )

  useEffect(() => {
    const fetchUserData = async () => {
      if (loginStatus !== null && user?.id) {
        setLoading(true)
        setError(null)
        try {
          const fetchedUser = await getUserById(user.id)
          setUserData(fetchedUser)
        } catch (err: any) {
          setError(err.message || 'Error fetching user data')
          console.error(err)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
        setError('User not logged in or user ID not found')
      }
    }

    fetchUserData()
  }, [loginStatus, user, setUser])

  return { userData, setUserData, loading, error, setError, user, setUser }
}