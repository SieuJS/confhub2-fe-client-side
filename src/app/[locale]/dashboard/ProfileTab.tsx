import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { UserResponse } from '@/src/models/response/user.response'
import userList from '@/src/models/data/user-list.json'
import { useLocalStorage } from 'usehooks-ts'
import Button from '../utils/Button'

interface ProfileTabProps {
  // You can define props if needed
}

const ProfileTab: React.FC<ProfileTabProps> = () => {
  const [userData, setUserData] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use the user object from local storage
  const [user, setUser] = useLocalStorage<{
    firstname: string
    lastname: string
    email: string
  } | null>('user', null)

  const [loginStatus, setLoginStatus] = useLocalStorage<string | null>(
    'loginStatus',
    null
  )

  useEffect(() => {
    if (loginStatus !== null && user?.email) {
      const fetchUserData = () => {
        try {
          // Check if the email exists in userList
          const foundUser = userList.find(u => u.email === user.email)

          if (foundUser) {
            // Map the found user to UserResponse
            const mappedUser: UserResponse = {
              firstName: foundUser.firstName,
              lastName: foundUser.lastName,
              email: foundUser.email,
              id: foundUser.id,
              dob: foundUser.dob || '', // Provide a default value or map from foundUser
              role: foundUser.role || 'user', // Provide a default value or map from foundUser
              createdAt: foundUser.createdAt || new Date().toISOString(), // Default to current date
              updatedAt: foundUser.updatedAt || new Date().toISOString() // Default to current date
            }
            setUserData(mappedUser)
          } else {
            setError('User not found') // User's email not in userList
          }
        } catch (err) {
          setError('Error fetching user data')
          console.error(err)
        } finally {
          setLoading(false)
        }
      }

      fetchUserData()
    } else {
      setLoading(false)
      setError('User not logged in') // loginStatus is null or user is null
    }
  }, [loginStatus, user])

  // SVG path for email icon
  const emailIcon = (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='currentColor'
      className='size-6'
    >
      <path d='M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z' />
      <path d='M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z' />
    </svg>
  )

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!userData) {
    return <div>No user data found.</div>
  }

  return (
    <div className='mx-auto max-w-5xl overflow-hidden bg-background py-4'>
      {/* Profile Header */}
      <div className='px-6 py-4'>
        <div className='flex items-start'>
          <div className='relative h-24 w-24 overflow-hidden rounded-full border-2 border-blue-500'>
            <Image
              src={'/s1.png'}
              alt={`Avatar of ${userData.firstName} ${userData.lastName}`}
              fill
              style={{ objectFit: 'cover' }}
              sizes='(max-width: 768px) 100vw, 25vw'
            />
          </div>
          <div className='ml-4'>
            <h2 className='text-2xl font-semibold '>
              {userData.firstName} {userData.lastName}
            </h2>
            <p className='mt-2 '>This is a user profile.</p>
            {/* Contact Information */}
            <div className='mt-3 space-y-1'>
              <div className='flex items-center gap-2'>
                {emailIcon}
                <a
                  href={`mailto:${userData.email}`}
                  className='text-blue-500 hover:underline'
                >
                  {userData.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action (e.g., Edit Profile, ...) - Placeholder */}
      <div className='border-t border-gray-200 bg-background px-6 py-4 text-right'>
        <Button variant='primary'>Chỉnh sửa Profile</Button>
      </div>
    </div>
  )
}

export default ProfileTab
