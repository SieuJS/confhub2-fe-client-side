'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Button from '../../utils/Button'
import { useTranslations } from 'next-intl'
import { useEditProfile } from '@/src/hooks/dashboard/profile/useEditProfile'
import { useImageSelection } from '@/src/hooks/dashboard/profile/useImageSelection'
import { Link } from '@/src/navigation'
import ChangePasswordForm from './ChangePasswordForm'
import { useAuth } from '@/src/contexts/AuthContext'

const ProfileTab: React.FC = () => {
  const t = useTranslations('')

  const {
    user: authUser,
    isInitializing: isAuthInitializing,
    error: authError,
    isLoggedIn
  } = useAuth()

  const {
    isEditing,
    editedData,
    dobError,
    setEditedData,
    handleEditClick,
    handleCancelClick,
    handleInputChange,
    handleInterestedTopicsChange,
    handleProfileSave
  } = useEditProfile(authUser)

  const {
    showModal: showAvatarModal,
    setShowModal: setShowAvatarModal,
    options: avatarOptions,
    handleImageSelect: handleAvatarSelect
  } = useImageSelection('avatar', setEditedData)

  const {
    showModal: showBackgroundModal,
    setShowModal: setShowBackgroundModal,
    options: backgroundOptions,
    handleImageSelect: handleBackgroundSelect
  } = useImageSelection('background', setEditedData)

  const predefinedTopics = [
    'Blockchain',
    'Chemical Biology',
    'AI',
    'Furniture',
    'Home Improvement'
  ]

  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false)
  const [formattedDob, setFormattedDob] = useState<string | null>(null)
  // THÊM state mới để quản lý lỗi ngày sinh
  //const [dobError, setDobError] = useState<string | null>(null)

  useEffect(() => {
    console.log(authUser?.dob)
    if (authUser?.dob) {
      try {
        const date = new Date(authUser.dob)
        if (!isNaN(date.getTime())) {
          setFormattedDob(
            date.toLocaleDateString(t('language') || undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          )
        } else {
          setFormattedDob(t('Invalid_Date'))
        }
      } catch (e) {
        setFormattedDob(t('Invalid_Date'))
      }
    } else {
      setFormattedDob(null)
    }
  }, [authUser?.dob, t])

  // // Hàm xử lý lưu thông tin, bao gồm kiểm tra ngày sinh
  // const handleProfileSave = async () => {
  //   setDobError(null) // Xóa lỗi cũ trước khi kiểm tra lại

  //   // Kiểm tra tuổi nếu có ngày sinh được nhập
  //   if (editedData.dob) {
  //     const dobDate = new Date(editedData.dob)
  //     const eighteenYearsAgo = new Date()
  //     eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18)

  //     // Nếu ngày sinh sau ngày 18 năm trước (nghĩa là chưa đủ 18 tuổi)
  //     if (dobDate > eighteenYearsAgo) {
  //       setDobError(t('dob_must_be_18_or_older')) // Sử dụng key dịch mới
  //       return // Dừng quá trình lưu
  //     }
  //   }

  //   // Nếu không có lỗi ngày sinh, tiến hành lưu
  //   await handleSaveClick()
  // }

  if (isAuthInitializing) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='h-20 w-20 animate-spin rounded-full border-b-2 border-t-2 border-gray-900'></div>
      </div>
    )
  }

  if (authError && !isLoggedIn) {
    return <div className='py-6 text-center text-red-500'>{authError}</div>
  }

  if (!isLoggedIn) {
    return (
      <div className='py-6 text-center'>
        <p className='mb-4'>{t('Please_log_in_to_view_profile')}</p>
        <Link href='/auth/login'>
          <Button variant='primary'>{t('Sign_In')}</Button>
        </Link>
      </div>
    )
  }

  if (!authUser) {
    return (
      <div className='py-6 text-center'>{t('User_data_not_available')}</div>
    )
  }

  const displayUser = isEditing ? editedData : authUser

  const displayAvatarUrl =
    displayUser.avatar || authUser.avatar || '/avatar1.jpg'
  const displayBackgroundUrl =
    displayUser.background || authUser.background || '/bg-2.jpg'

  const handleChangePasswordClick = () => {
    setShowChangePasswordForm(true)
  }

  return (
    <div className='w-full overflow-hidden rounded-lg bg-background shadow-xl md:px-10 md:py-6'>
      {/* Cover Photo */}
      <div className='relative h-52 overflow-hidden rounded-t-lg md:h-72'>
        <Image
          src={displayBackgroundUrl}
          alt='Cover Photo'
          fill
          style={{ objectFit: 'cover' }}
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          priority={!isEditing}
        />
      </div>
      {/* Profile Info Section (Header) */}
      <div className='relative -mt-16 flex flex-col items-center px-4 pb-6 md:-mt-20 md:flex-row md:items-end md:space-x-5'>
        <div className='relative h-32 min-w-32 overflow-hidden rounded-full border-4 border-white shadow-lg dark:border-gray-800 md:h-40 md:min-w-40'>
          <Image
            src={displayAvatarUrl}
            alt={`Avatar of ${authUser.firstName} ${authUser.lastName}`}
            fill
            style={{ objectFit: 'cover' }}
            sizes='160px'
            priority={!isEditing}
          />
          {isEditing && (
            <button
              type='button'
              onClick={() => setShowAvatarModal(true)}
              className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 text-transparent transition-all duration-300 hover:bg-opacity-50 hover:text-white'
            >
              <span className='text-xs font-medium'>{t('Change')}</span>
            </button>
          )}
        </div>

        {/* KHỐI NÀY CHỈ CHỨA TÊN - ABOUT ME ĐÃ ĐƯỢC DI CHUYỂN */}
        <div className='mt-3 min-w-0 flex-grow text-center md:mt-0 md:text-left'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white md:text-3xl'>
            {authUser.firstName} {authUser.lastName}
          </h1>
          {/* About me removed from here */}
        </div>
        {!isEditing && (
          <div className='mt-4 flex shrink-0 grow-0 flex-col space-y-2 md:mt-0 md:flex-row md:space-x-3 md:space-y-0'>
            <Button
              variant='primary'
              onClick={handleEditClick}
              className='w-full md:w-auto'
            >
              {t('Edit_Profile')}
            </Button>
            <Button
              variant='danger'
              onClick={handleChangePasswordClick}
              className='w-full md:w-auto'
            >
              {t('Change_Password')}
            </Button>
          </div>
        )}
      </div>
      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className='animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4'>
          <div className='w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold text-gray-800 dark:text-white'>
                {t('Select_an_Avatar')}
              </h2>
              <button
                onClick={() => setShowAvatarModal(false)}
                className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              >
                <svg
                  className='h-6 w-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M6 18L18 6M6 6l12 12'
                  ></path>
                </svg>
              </button>
            </div>
            <div className='mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4'>
              {' '}
              {/* Tăng số cột */}
              {avatarOptions.map((avatarUrl: string) => (
                <button
                  key={avatarUrl}
                  onClick={() => {
                    handleAvatarSelect(avatarUrl)
                    setShowAvatarModal(false)
                  }}
                  className='aspect-square overflow-hidden rounded-full transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2'
                >
                  <Image
                    src={avatarUrl}
                    alt='Avatar Option'
                    width={100}
                    height={100}
                    className='h-full w-full object-cover'
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Background Modal */}
      {showBackgroundModal && (
        <div className='animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4'>
          <div className='w-full max-w-xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800'>
            {' '}
            {/* Tăng max-w */}
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold text-gray-800 dark:text-white'>
                {' '}
                {t('Select_a_Background')}{' '}
              </h2>
              <button
                onClick={() => setShowBackgroundModal(false)}
                className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              >
                <svg
                  className='h-6 w-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M6 18L18 6M6 6l12 12'
                  ></path>
                </svg>
              </button>
            </div>
            <div className='mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3'>
              {' '}
              {/* Tăng số cột */}
              {backgroundOptions.map((backgroundUrl: string) => (
                <button
                  key={backgroundUrl}
                  onClick={() => {
                    handleBackgroundSelect(backgroundUrl)
                    setShowBackgroundModal(false)
                  }}
                  className='aspect-[16/10] overflow-hidden rounded-md shadow-sm transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2'
                >
                  <Image
                    src={backgroundUrl}
                    alt='Background Option'
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes='(max-width: 640px) 50vw, 33vw'
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Edit/Display Section */}
      <div className='mt-6 border-t border-gray-200 px-2 py-6 dark:border-gray-700 md:px-0'>
        {isEditing ? (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2'>
              <div>
                <label
                  htmlFor='firstName'
                  className='block text-sm font-medium  '
                >
                  {' '}
                  {t('First_Name')}{' '}
                </label>
                <input
                  type='text'
                  id='firstName'
                  name='firstName'
                  value={editedData.firstName || ''}
                  onChange={handleInputChange}
                  className='mt-1 block w-full rounded-md border-gray-300 p-2.5 shadow-sm focus:border-button focus:ring-button dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-button dark:focus:ring-button sm:text-sm'
                />
              </div>
              <div>
                <label
                  htmlFor='lastName'
                  className='block text-sm font-medium  '
                >
                  {' '}
                  {t('Last_Name')}{' '}
                </label>
                <input
                  type='text'
                  id='lastName'
                  name='lastName'
                  value={editedData.lastName || ''}
                  onChange={handleInputChange}
                  className='mt-1 block w-full rounded-md border-gray-300 p-2.5 shadow-sm focus:border-button focus:ring-button dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-button dark:focus:ring-button sm:text-sm'
                />
              </div>
              <div>
                {' '}
                <label htmlFor='dob' className='block text-sm font-medium  '>
                  {' '}
                  {t('Date_of_Birth')}{' '}
                </label>
                <input
                  type='date'
                  id='dob'
                  name='dob'
                  value={editedData.dob?.split('T')[0] || ''}
                  onChange={handleInputChange}
                  className='mt-1 block w-full rounded-md border-gray-300 p-2.5 shadow-sm focus:border-button focus:ring-button dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-button dark:focus:ring-button sm:text-sm'
                />
                {/* HIỂN THỊ THÔNG BÁO LỖI NGÀY SINH */}
                {dobError && (
                  <p className='mt-1 text-sm text-red-500'>{t(`${dobError}`)}</p>
                )}
              </div>
            </div>

            <div className='col-span-full'>
              {' '}
              <label htmlFor='about' className='block text-sm font-medium  '>
                {' '}
                {t('About_me')}{' '}
              </label>
              <textarea
                id='about'
                name='aboutMe'
                value={editedData.aboutMe || ''}
                onChange={handleInputChange}
                maxLength={100}
                rows={4}
                className='mt-1 block w-full rounded-md border-gray-300 p-2.5 shadow-sm focus:border-button focus:ring-button dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-button dark:focus:ring-button sm:text-sm'
              />
              <p className='mt-1 text-xs  dark:text-gray-400'>
                {editedData.aboutMe ? editedData.aboutMe.length : 0}/ 100{' '}
                {t('characters')}
              </p>
            </div>

            <div>
              <label className='block text-sm font-medium  '>
                {' '}
                {t('I_am_also_interested_in_these_topics')}{' '}
              </label>
              <div className='mt-2 flex flex-wrap gap-2'>
                {predefinedTopics.map(topic => {
                  const isSelected = (
                    editedData.interestedTopics || []
                  ).includes(topic)
                  return (
                    <button
                      type='button'
                      key={topic}
                      onClick={() => handleInterestedTopicsChange(topic)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                        isSelected
                          ? 'bg-button text-button-text focus:ring-button'
                          : 'bg-gray-200  hover:bg-gray-300 focus:ring-gray-400 dark:bg-gray-700  dark:hover:bg-gray-600'
                      }`}
                    >
                      {topic}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className='mt-8 flex justify-end space-x-3'>
              <Button
                variant='danger'
                onClick={handleCancelClick}
                className='px-5 py-2'
              >
                {' '}
                {t('Cancel')}{' '}
              </Button>
              <Button
                variant='primary'
                onClick={handleProfileSave} // THAY ĐỔI TẠI ĐÂY: Gọi handleProfileSave
                className='px-5 py-2'
              >
                {' '}
                {t('Save_Changes')}{' '}
              </Button>
            </div>
          </div>
        ) : (
          // Display Information
          <div className='space-y-4'>
            {/* VỊ TRÍ MỚI CHO ABOUT ME - ĐÃ DI CHUYỂN LÊN TRÊN */}
            {authUser.aboutMe && (
              <div>
                <dt className='text-sm font-medium  dark:text-gray-400'>
                  {t('About_me')}
                </dt>
                {/* THAY ĐỔI TẠI ĐÂY: Thêm class `break-words` */}
                <dd className='mt-1 break-words text-sm text-gray-900 dark:text-white'>
                  {authUser.aboutMe}
                </dd>
              </div>
            )}

            <div className='grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2'>
              <div>
                <dt className='text-sm font-medium  dark:text-gray-400'>
                  {t('Email')}
                </dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-white'>
                  {authUser.email}
                </dd>
              </div>
              {formattedDob && (
                <div>
                  <dt className='text-sm font-medium  dark:text-gray-400'>
                    {t('Date_of_Birth')}
                  </dt>
                  <dd className='mt-1 text-sm text-gray-900 dark:text-white'>
                    {formattedDob}
                  </dd>
                </div>
              )}
            </div>

            {authUser.interestedTopics &&
              authUser.interestedTopics.length > 0 && (
                <div>
                  <dt className='text-sm font-medium  dark:text-gray-400'>
                    {t('Interested_Topics')}
                  </dt>
                  <dd className='mt-2 flex flex-wrap gap-2'>
                    {authUser.interestedTopics.map(topic => (
                      <Link
                        key={topic}
                        href={{
                          pathname: `/conferences`,
                          query: { topics: topic }
                        }}
                      >
                        <span className='cursor-pointer rounded-full bg-button bg-opacity-10 px-3 py-1.5 text-xs font-medium text-button-text transition-colors hover:bg-opacity-20 dark:bg-opacity-20 dark:hover:bg-opacity-30'>
                          {topic}
                        </span>
                      </Link>
                    ))}
                  </dd>
                </div>
              )}
          </div>
        )}
      </div>
      {showChangePasswordForm && authUser && (
        <ChangePasswordForm
          userId={authUser.id}
          onClose={() => setShowChangePasswordForm(false)}
        />
      )}
    </div>
  )
}

export default ProfileTab
