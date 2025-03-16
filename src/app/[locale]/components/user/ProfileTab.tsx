import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { UserResponse } from '@/src/models/response/user.response' // Corrected import path
import userList from '@/src/models/data/user-list.json' // Corrected import path
import { useLocalStorage } from 'usehooks-ts'

interface ProfileTabProps {
  // You can define props if needed
}

const ProfileTab: React.FC<ProfileTabProps> = () => {
  const [userData, setUserData] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useLocalStorage<string>('userEmail', '')
  const [loginStatus, setLoginStatus] = useLocalStorage<string | null>(
    'loginStatus',
    null
  )
  useEffect(() => {
    // const loginStatus = localStorage.getItem('loginStatus')
    // const userEmail = localStorage.getItem('userEmail')

    if (loginStatus !== null && userEmail) {
      // No need for async/await here, since we are using the imported JSON directly
      const fetchUserData = () => {
        try {
          // Directly use the imported userList
          const foundUser = userList.find(user => user.email === userEmail)

          if (foundUser) {
            setUserData(foundUser)
          } else {
            setError('User not found')
          }
        } catch (err) {
          // This error handling is less likely to be triggered now,
          // but it's still good practice to keep it.
          setError('Error fetching user data')
          console.error(err)
        } finally {
          setLoading(false)
        }
      }

      fetchUserData()
    } else {
      setLoading(false)
      setError('User not logged in')
    }
  }, [])

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
    return <div>No user data found.</div> // Should not happen, but good for safety
  }

  return (
    <div className='mx-auto max-w-5xl overflow-hidden bg-background py-4'>
      {/* Profile Header */}
      <div className='px-6 py-4'>
        <div className='flex items-start'>
          <div className='relative h-24 w-24 overflow-hidden rounded-full border-2 border-blue-500'>
            <Image
              src={'/s1.png'} // You might want to store user avatar URLs in your user data
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
            <p className='mt-2 '>This is a user profile.</p>{' '}
            {/* Replace with actual bio if you have it */}
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
        <button className='focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none'>
          Chỉnh sửa Profile
        </button>
      </div>
    </div>
  )
}

export default ProfileTab
