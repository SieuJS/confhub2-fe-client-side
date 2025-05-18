// src/components/ProfileTab.tsx
'use client' // Đảm bảo là client component

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Button from '../../utils/Button' // Kiểm tra lại đường dẫn
import { useTranslations } from 'next-intl'
// import { useUserData } from '@/src/hooks/dashboard/profile/useUserData'; // Không cần hook này nữa nếu user lấy từ Context
import { useEditProfile } from '@/src/hooks/dashboard/profile/useEditProfile'
import { useImageSelection } from '@/src/hooks/dashboard/profile/useImageSelection'
import { Link } from '@/src/navigation'
import ChangePasswordForm from './ChangePasswordForm'
import { useAuth } from '@/src/contexts/AuthContext' // <<<< THAY ĐỔI QUAN TRỌNG

const ProfileTab: React.FC = () => {
  const t = useTranslations('')

  // <<<< THAY ĐỔI QUAN TRỌNG: Lấy user, isInitializing, error từ AuthContext
  const {
    user: authUser,
    isInitializing: isAuthInitializing,
    error: authError,
    isLoggedIn
  } = useAuth()

  // userData cho useEditProfile sẽ là authUser từ context
  // initialUserData được truyền vào useEditProfile sẽ là authUser
  // Điều này đảm bảo useEditProfile luôn làm việc với dữ liệu user mới nhất từ context.
  const {
    isEditing,
    editedData, // editedData này sẽ được khởi tạo từ authUser trong useEditProfile
    setEditedData,
    handleEditClick,
    handleSaveClick,
    handleCancelClick,
    handleInputChange,
    handleInterestedTopicsChange
  } = useEditProfile(authUser) // Truyền authUser làm initialUserData

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
    // Thêm các topic khác nếu cần
  ]

  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false)
  const [formattedDob, setFormattedDob] = useState<string | null>(null)

  useEffect(() => {
    console.log(authUser?.dob)
    // userData ở đây nên là authUser từ context
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

  // Xử lý trạng thái tải từ AuthProvider
  if (isAuthInitializing) {
    return (
      <div className='flex h-screen items-center justify-center'>
        {/* Spinner hoặc skeleton UI */}
        <div className='h-20 w-20 animate-spin rounded-full border-b-2 border-t-2 border-gray-900'></div>
      </div>
    )
  }

  // Xử lý lỗi từ AuthProvider (ví dụ: không thể fetch user ban đầu)
  if (authError && !isLoggedIn) {
    // Chỉ hiển thị lỗi này nếu user thực sự chưa login
    return <div className='py-6 text-center text-red-500'>{authError}</div>
  }

  // Xử lý trường hợp chưa đăng nhập (sau khi AuthProvider đã khởi tạo)
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

  // Nếu đã đăng nhập nhưng không có thông tin user (ít khi xảy ra nếu logic AuthProvider đúng)
  if (!authUser) {
    return (
      <div className='py-6 text-center'>{t('User_data_not_available')}</div>
    )
  }

  // Nếu đến đây, isAuthInitializing là false, isLoggedIn là true, và authUser tồn tại.
  // Dữ liệu để hiển thị (và chỉnh sửa) nên dựa trên authUser và editedData.
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
      {' '}
      {/* Tăng shadow và padding */}
      {/* Cover Photo */}
      <div className='relative h-52 overflow-hidden rounded-t-lg md:h-72'>
        {' '}
        {/* Giảm chiều cao một chút */}
        <Image
          src={displayBackgroundUrl}
          alt='Cover Photo'
          fill
          style={{ objectFit: 'cover' }}
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' // Tối ưu sizes
          priority={!isEditing} // Priority nếu đang ở display mode
        />
        {/* {isEditing && (
          <button
            type='button'
            onClick={() => setShowBackgroundModal(true)}
            className='absolute right-3 top-3 rounded-md bg-black bg-opacity-50 px-3 py-1.5 text-xs font-medium text-white hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800'
          >
            {t('Change_Background')}
          </button>
        )} */}
      </div>
      {/* Profile Info Section */}
      <div className='relative -mt-16 flex flex-col items-center px-4 pb-6 md:-mt-20 md:flex-row md:items-end md:space-x-5'>
        <div className='relative h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-lg dark:border-gray-800 md:h-40 md:w-40'>
          {/* Sử dụng Image component cho avatar nếu có thể, hoặc img nếu URL là external hoàn toàn */}
          <Image
            src={displayAvatarUrl}
            alt={`Avatar of ${authUser.firstName} ${authUser.lastName}`}
            fill
            style={{ objectFit: 'cover' }}
            sizes='160px' // Kích thước của avatar
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

        <div className='mt-3 flex-grow text-center md:mt-0 md:text-left'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white md:text-3xl'>
            {authUser.firstName} {authUser.lastName}
          </h1>
          {authUser.aboutMe && (
            <p className='mt-1 text-sm text-gray-600 dark:text-gray-300'>
              {authUser.aboutMe}
            </p>
          )}
        </div>
        {!isEditing && (
          <div className='mt-4 flex flex-col space-y-2 md:mt-0 md:flex-row md:space-x-3 md:space-y-0'>
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
                    width={100} // Giữ nguyên kích thước để đảm bảo chất lượng ảnh preview
                    height={100}
                    className='h-full w-full object-cover'
                  />
                </button>
              ))}
            </div>
            {/* Nút Cancel không cần thiết nếu click vào ảnh là chọn và đóng modal */}
            {/* <button type='button' onClick={() => setShowAvatarModal(false)} className='mt-6 w-full rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'> {t('Cancel')} </button> */}
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
                  className='aspect-[16/10] overflow-hidden rounded-md shadow-sm transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2' // Sửa aspect ratio
                >
                  <Image
                    src={backgroundUrl}
                    alt='Background Option'
                    fill // Dùng fill và aspect ratio cho button cha
                    style={{ objectFit: 'cover' }}
                    sizes='(max-width: 640px) 50vw, 33vw' // Tối ưu sizes
                  />
                </button>
              ))}
            </div>
            {/* <button type='button' onClick={() => setShowBackgroundModal(false)} className='mt-6 w-full rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'> {t('Cancel')} </button> */}
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
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300'
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
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300'
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
                {/* Date of Birth chiếm full width trên mobile, 1/2 trên desktop */}
                <label
                  htmlFor='dob'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300'
                >
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
              </div>
            </div>

            <div className='col-span-full'>
              {' '}
              {/* About me chiếm full width */}
              <label
                htmlFor='about'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300'
              >
                {' '}
                {t('About_me')}{' '}
              </label>
              <textarea
                id='about'
                name='aboutMe'
                value={editedData.aboutMe || ''}
                onChange={handleInputChange}
                maxLength={250}
                rows={4}
                className='mt-1 block w-full rounded-md border-gray-300 p-2.5 shadow-sm focus:border-button focus:ring-button dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-button dark:focus:ring-button sm:text-sm'
              />
              <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                {editedData.aboutMe ? editedData.aboutMe.length : 0}/250{' '}
                {t('characters')}
              </p>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                {' '}
                {t('I_am_also_interested_in_these_topics')}{' '}
              </label>
              <div className='mt-2 flex flex-wrap gap-2'>
                {predefinedTopics.map(topic => {
                  const isSelected = (
                    editedData.interestedTopics || []
                  ).includes(topic)
                  return (
                    <button // Dùng button để dễ dàng xử lý click
                      type='button'
                      key={topic}
                      onClick={() => handleInterestedTopicsChange(topic)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                        isSelected
                          ? 'bg-button text-button-text focus:ring-button'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
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
                onClick={handleSaveClick}
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
            {/* Nút Edit Profile và Change Password đã được chuyển lên trên */}
            <div className='grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2'>
              <div>
                <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  {t('Email')}
                </dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-white'>
                  {authUser.email}
                </dd>
              </div>
              {formattedDob && (
                <div>
                  <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
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
                  <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
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
                        <span className='cursor-pointer rounded-full bg-button bg-opacity-10 px-3 py-1.5 text-xs font-medium text-button transition-colors hover:bg-opacity-20 dark:bg-opacity-20 dark:hover:bg-opacity-30'>
                          {topic}
                        </span>
                      </Link>
                    ))}
                  </dd>
                </div>
              )}
            {/* About me đã hiển thị ở phần header của profile */}
          </div>
        )}
      </div>
      {showChangePasswordForm &&
        authUser && ( // Đảm bảo authUser tồn tại
          <ChangePasswordForm
            userId={authUser.id}
            onClose={() => setShowChangePasswordForm(false)}
          />
        )}
    </div>
  )
}

export default ProfileTab
