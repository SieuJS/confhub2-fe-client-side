import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Button from '../../utils/Button'
import { useTranslations } from 'next-intl'
import { UserResponse } from '@/src/models/response/user.response'
import { Camera, MoreVertical } from 'lucide-react'; // Import Lucide icons

interface ProfileHeaderProps {
  user: Partial<UserResponse>
  isEditing: boolean
  displayAvatarUrl: string
  displayBackgroundUrl: string
  onEditClick: () => void
  onChangePasswordClick: () => void
  onDeleteAccountClick: () => void
  onAvatarEditClick: () => void
  onBackgroundEditClick: () => void
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isEditing,
  displayAvatarUrl,
  displayBackgroundUrl,
  onEditClick,
  onChangePasswordClick,
  onDeleteAccountClick,
  onAvatarEditClick,
  onBackgroundEditClick
}) => {
  const t = useTranslations('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <>
      {/* Cover Photo */}
      <div className='relative h-48 w-full sm:h-60 md:h-72'>
        <Image
          src={displayBackgroundUrl}
          alt='Cover Photo'
          fill
          style={{ objectFit: 'cover' }}
          sizes='(max-width: 768px) 100vw, 50vw'
          priority
        />
        {isEditing && (
          <button
            type='button'
            onClick={onBackgroundEditClick}
            className='absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black bg-opacity-0 text-transparent transition-all duration-300 hover:bg-opacity-50 hover:text-white'
          >
            <Camera className="h-6 w-6" /> {/* Using Lucide Camera icon */}
            <span className='text-sm font-medium'>{t('Change_Background')}</span>
          </button>
        )}
      </div>

      {/* Profile Info Section (Header) */}
      <div className='relative -mt-16 flex flex-col items-center px-4 pb-6 sm:-mt-20 md:flex-row md:items-end md:gap-6'>
        <div className='relative h-32 w-32 flex-shrink-0 rounded-full border-4 border-background shadow-lg md:h-40 md:w-40'>
          <Image
            src={displayAvatarUrl}
            alt={`Avatar of ${user.firstName} ${user.lastName}`}
            fill
            style={{ objectFit: 'cover' }}
            className='rounded-full'
            sizes='160px'
            priority
          />
          {isEditing && (
            <button
              type='button'
              onClick={onAvatarEditClick}
              className='absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-black bg-opacity-0 text-transparent transition-all duration-300 hover:bg-opacity-50 hover:text-white'
            >
              <Camera className="h-6 w-6" /> {/* Using Lucide Camera icon */}
              <span className='text-xs font-medium'>{t('Change')}</span>
            </button>
          )}
        </div>

        <div className='mt-4 min-w-0 flex-grow text-center md:mt-0 md:text-left'>
          <h1 className='truncate text-2xl font-bold text-gray-900 dark:text-white md:text-3xl' style={{textShadow: '1px 1px 3px rgba(0,0,0,0.1)'}}>
            {user.firstName} {user.lastName}
          </h1>
          <p className='truncate text-sm text-gray-500 dark:text-gray-400'>{user.email}</p>
        </div>

        {!isEditing && (
          <div className='mt-4 flex shrink-0 items-center gap-2 md:mt-0'>
            <Button variant='primary' onClick={onEditClick}>
              {t('Edit_Profile')}
            </Button>
            <div className='relative' ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className='rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700'
              >
                <MoreVertical className="h-5 w-5" /> {/* Using Lucide MoreVertical icon */}
              </button>
              {isMenuOpen && (
                <div className='absolute right-0 top-full z-10 mt-2 w-48 origin-top-right rounded-md bg-background py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
                  <button
                    onClick={() => {
                      onChangePasswordClick()
                      setIsMenuOpen(false)
                    }}
                    className='block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                  >
                    {t('Change_Password')}
                  </button>
                  <button
                    onClick={() => {
                      onDeleteAccountClick()
                      setIsMenuOpen(false)
                    }}
                    className='block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
                  >
                    {t('Delete_Account')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ProfileHeader