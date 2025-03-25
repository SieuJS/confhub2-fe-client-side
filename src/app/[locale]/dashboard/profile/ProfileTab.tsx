// src/components/ProfileTab.tsx
import React, {useState} from 'react'
import Image from 'next/image'
import Button from '../../utils/Button'
import { useTranslations } from 'next-intl'
import { useUserData } from '../../../../hooks/dashboard/profile/useUserData'
import { useEditProfile } from '../../../../hooks/dashboard/profile/useEditProfile'
import { useImageSelection } from '../../../../hooks/dashboard/profile/useImageSelection'
import { Link } from '@/src/navigation'
import ChangePasswordForm from './ChangePasswordForm' // Import


const ProfileTab: React.FC = () => {
  const t = useTranslations('')
  const { userData, setUserData, loading, error, setError, setUser } =
    useUserData()

  const {
    isEditing,
    editedData,
    setEditedData, // Get setEditedData from the hook
    handleEditClick,
    handleSaveClick,
    handleCancelClick,
    handleInputChange,
    handleInterestedTopicsChange
  } = useEditProfile(userData, setUser, setUserData, setError)

  const {
    showModal: showAvatarModal,
    setShowModal: setShowAvatarModal,
    options: avatarOptions,
    handleImageSelect: handleAvatarSelect // This will now correctly update editedData
  } = useImageSelection('avatar', setEditedData) // Pass setEditedData

  const {
    showModal: showBackgroundModal,
    setShowModal: setShowBackgroundModal,
    options: backgroundOptions,
    handleImageSelect: handleBackgroundSelect // This will now correctly update editedData
  } = useImageSelection('background', setEditedData) // Pass setEditedData

  const predefinedTopics = [
    'Blockchain',
    'Chemical Biology',
    'AI',
    'Furniture',
    'Home Improvement'
  ]

    const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900'></div>
      </div>
    )
  }

  if (error) {
    return <div className='py-4 text-center text-red-500'>{error}</div>
  }

  if (!userData) {
    return <div className='py-4 text-center'>No user data found.</div>
  }

  const displayAvatarUrl = editedData.avatar || userData.avatar || '/s1.png'
  const displayBackgroundUrl =
    editedData.background || userData.background || '/bg-2.jpg'

    const handleChangePasswordClick = () => {
      setShowChangePasswordForm(true);
    }

  return (
    <div className='mx-auto max-w-7xl overflow-hidden rounded-lg bg-background px-12 py-8 shadow-md'>
      {/* Cover Photo */}
      <div className='relative h-80 overflow-hidden rounded-lg'>
        <Image
          src={displayBackgroundUrl}
          alt='Cover Photo'
          fill
          style={{ objectFit: 'cover' }}
          sizes='(max-width: 768px) 100vw, 100vw'
          priority
        />
        {isEditing && (
          <button
            type='button'
            onClick={() => setShowBackgroundModal(true)}
            className='absolute bottom-2 right-2 rounded bg-background  px-4 py-2 text-sm font-medium opacity-80 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2'
          >
            {t('Change_Background')}
          </button>
        )}
      </div>

      {/* Profile Info Section */}
      <div className='relative flex flex-col items-start gap-5 px-6 py-5 md:flex-row md:items-center'>
        {/* Avatar */}
        <div className='relative -mt-40 h-40 w-40 overflow-hidden rounded-full border-4 border-button-text bg-background'>
          <img
            src={displayAvatarUrl}
            alt={`Avatar of ${userData.firstName} ${userData.lastName}`}
            style={{ width: '100vw', height: '', objectFit: 'cover' }} // Quan trọng: Đặt kích thước và objectFit
          />
          {isEditing && (
            <button
              type='button'
              onClick={() => setShowAvatarModal(true)}
              className='absolute bottom-2 left-2 rounded bg-background bg-opacity-70 px-4 py-2 text-sm font-medium  hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2'
            >
              {t('Change_Avatar')}
            </button>
          )}
        </div>

        {/* Name and Title */}
        <div className='flex-grow'>
          <h1 className='text-3xl font-bold '>
            {userData.firstName} {userData.lastName}
          </h1>
          {userData.aboutme && (
            <p className='text-sm'>
              <span className='text-base font-semibold'>{t('About_me')}:</span>{' '}
              {userData.aboutme.split(' ').map((word, index) => (
                <React.Fragment key={index}>
                  {word} {index % 10 === 5 && <br />}{' '}
                  {/* Add a line break every 10 words */}
                </React.Fragment>
              ))}
            </p>
          )}
          {userData.address && (
            <p className='text-sm'>
              <span className='text-base font-semibold'>{t('Address')}:</span>{' '}
              {userData.address}
            </p>
          )}

          <div className='mt-3 space-x-3'>
            <button className='rounded-full bg-button px-5 py-2 font-semibold text-white transition duration-300 ease-in-out hover:bg-button'>
              {t('Following')}
            </button>
            <button className='rounded-full bg-background px-5 py-2 font-semibold  transition duration-300 ease-in-out hover:bg-background'>
              Message
            </button>
          </div>
        </div>

        {/* Followers and Company Logos */}
        <div className='flex items-center gap-4 md:ml-auto'>
          <div className='text-sm '>See followers (330)</div>
          <div className='flex gap-2'>{/* Company Logos */}</div>
        </div>
      </div>

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='w-full max-w-md rounded-lg bg-background p-6 shadow-lg'>
            <h2 className='mb-4 text-lg font-semibold'>
              {t('Select_an_Avatar')}
            </h2>
            <div className='grid grid-cols-4 gap-4'>
              {avatarOptions.map((avatarUrl: string) => (
                <button
                  key={avatarUrl}
                  onClick={() => handleAvatarSelect(avatarUrl)} // Call handleAvatarSelect
                  className='aspect-square overflow-hidden rounded-full hover:ring-2 hover:ring-button hover:ring-offset-2'
                >
                  <Image
                    src={avatarUrl}
                    alt='Avatar Option'
                    width={100}
                    height={100}
                    className='h-full w-full object-cover'
                    priority
                  />
                </button>
              ))}
            </div>
            <button
              type='button'
              onClick={() => setShowAvatarModal(false)}
              className='mt-4 w-full rounded-md bg-background-secondary px-4  py-2 text-sm font-medium opacity-80  hover:bg-background-secondary hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2'
            >
              {t('Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Background Modal */}
      {showBackgroundModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='w-full max-w-lg rounded-lg bg-background p-6 shadow-lg'>
            <h2 className='mb-4 text-lg font-semibold'>
              {t('Select_a_Background')}
            </h2>
            <div className='grid grid-cols-2 gap-4'>
              {backgroundOptions.map((backgroundUrl: string) => (
                <button
                  key={backgroundUrl}
                  onClick={() => handleBackgroundSelect(backgroundUrl)} // Call handleBackgroundSelect
                  className='aspect-video overflow-hidden rounded hover:ring-2 hover:ring-button hover:ring-offset-2'
                >
                  <Image
                    src={backgroundUrl}
                    alt='Background Option'
                    width={300}
                    height={200}
                    className='h-full w-full object-cover'
                    priority
                  />
                </button>
              ))}
            </div>
            <button
              type='button'
              onClick={() => setShowBackgroundModal(false)}
              className='mt-4 w-full rounded-md bg-background-secondary px-4  py-2 text-sm font-medium opacity-80  hover:bg-background-secondary hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2'
            >
              {t('Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Edit/Display Section */}
      <div className='border-t border-background p-6'>
        {isEditing ? (
          // Edit Form
          <div className='space-y-6 py-2'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div>
                <label
                  htmlFor='firstName'
                  className='block text-sm font-medium'
                >
                  {t('First_Name')}
                </label>
                <input
                  type='text'
                  id='firstName'
                  name='firstName'
                  value={editedData.firstName || ''}
                  onChange={handleInputChange}
                  className='focus:ring-none mt-1 block w-full rounded-md border-button bg-opacity-70 p-2 shadow-md focus:border-2 focus:outline-none focus:ring-button'
                />
              </div>
              <div>
                <label htmlFor='lastName' className='block text-sm font-medium'>
                  {t('Last_Name')}
                </label>
                <input
                  type='text'
                  id='lastName'
                  name='lastName'
                  value={editedData.lastName || ''}
                  onChange={handleInputChange}
                  className='focus:ring-none mt-1 block w-full rounded-md border-button bg-opacity-70 p-2 shadow-md focus:border-2 focus:outline-none focus:ring-button'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div>
                <label htmlFor='dob' className='block text-sm font-medium'>
                  {t('Date_of_Birth')}
                </label>
                <input
                  type='date'
                  id='dob'
                  name='dob'
                  value={editedData.dob || ''}
                  onChange={handleInputChange}
                  className='focus:ring-none mt-1 block w-full rounded-md border-button bg-opacity-70 p-2 shadow-md focus:border-2 focus:outline-none focus:ring-button'
                />
              </div>
              <div>
                <label htmlFor='phone' className='block text-sm font-medium'>
                  {t('Phone')}
                </label>
                <input
                  type='text'
                  id='phone'
                  name='phone'
                  value={editedData.phone || ''}
                  onChange={handleInputChange}
                  className='focus:ring-none mt-1 block w-full rounded-md border-button bg-opacity-70 p-2 shadow-md focus:border-2 focus:outline-none focus:ring-button'
                />
              </div>
            </div>

            <div>
              <label htmlFor='address' className='block text-sm font-medium'>
                {t('Address')}
              </label>
              <input
                type='text'
                id='address'
                name='address'
                value={editedData.address || ''}
                onChange={handleInputChange}
                className='focus:ring-none mt-1 block w-full rounded-md border-button bg-opacity-70 p-2 shadow-md focus:border-2 focus:outline-none focus:ring-button'
              />
            </div>

            <div>
              <label htmlFor='about' className='block text-sm font-medium'>
                {t('About_me')}
              </label>
              <textarea
                id='about'
                name='aboutme'
                value={editedData.aboutme || ''}
                onChange={handleInputChange}
                maxLength={100}
                className='focus:ring-none mt-1 block h-32 w-full rounded-md border-button bg-opacity-70 p-2 shadow-md focus:border-2 focus:outline-none focus:ring-button'
              />
              <p className='text-sm '>
                {editedData.aboutme ? editedData.aboutme.length : 0}/100
                {t(' characters')}
              </p>
            </div>

            <div className='mt-4'>
              <label className='block text-sm font-medium '>
                {t('I_am_also_interested_in_these_topics')}
              </label>
              <div className='mt-2 flex flex-wrap gap-2'>
                {predefinedTopics.map(topic => {
                  const isSelected = (
                    editedData.interestedTopics || []
                  ).includes(topic)
                  return (
                    <span
                      key={topic}
                      onClick={() => handleInterestedTopicsChange(topic)}
                      className={`cursor-pointer rounded-full px-4 py-2 text-sm transition duration-200  ${
                        isSelected
                          ? 'bg-button text-button-text'
                          : 'bg-background  hover:bg-background-secondary'
                      }`}
                    >
                      {topic}
                    </span>
                  )
                })}
              </div>
            </div>

            <div className='mt-8 flex justify-end space-x-4'>
              <button
                type='button'
                onClick={handleCancelClick}
                className='rounded-md bg-background px-6 py-2  hover:bg-background-secondary focus:outline-none focus:ring-2 focus:ring-gray-400'
              >
                {t('Cancel')}
              </button>
              <button
                type='button'
                onClick={handleSaveClick}
                className='rounded-md bg-button px-6 py-2 text-button-text hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-button'
              >
                {t('Save')}
              </button>
            </div>
          </div>
        ) : (
          // Display Information
          <>
            <div className='flex justify-end space-x-4'>
              <Button
                variant='primary'
                onClick={handleEditClick}
                className='rounded-md px-6 py-2 focus:outline-none focus:ring-2'
              >
                {t('Edit_Profile')}
              </Button>
              <Button
                variant='primary'
                onClick={handleChangePasswordClick} // Gọi hàm mở form đổi mật khẩu
                className='rounded-md px-6 py-2 focus:outline-none focus:ring-2'
              >
                {t('Change_Password')}
              </Button>
            </div>

            <div className='mt-4 space-y-2'>
              <p>
                <span className='font-semibold'>Email:</span>{' '}
                <a className='text-button hover:underline'>{userData.email}</a>
              </p>
              {/* Display dob if it exists */}
              {userData.dob && (
                <p>
                  <span className='font-semibold'>{t('Date_of_Birth')}:</span>{' '}
                  {new Date(userData.dob).toLocaleDateString()}
                </p>
              )}
              {/* Display other fields here */}
              {userData.phone && (
                <p>
                  <span className='font-semibold'>{t('Phone')}:</span>{' '}
                  {userData.phone}
                </p>
              )}

              {userData.interestedTopics && (
                <div>
                  <span className='mb-4 font-semibold'>
                    {t('Interested_Topics')}:
                  </span>
                  <div className='flex flex-wrap gap-2'>
                    {userData.interestedTopics.map(topic => (
                      <Link
                        key={topic}
                        href={{
                          pathname: `/conferences`,
                          query: { topics: topic }
                        }}
                        className='hover:text-text-secondary'
                      >
                        <span className='rounded-full bg-button px-4 py-2 text-sm text-button-text'>
                          {topic}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {showChangePasswordForm && (
        <ChangePasswordForm userId={userData.id} onClose={() => setShowChangePasswordForm(false)} />
      )}
    </div>
  )
}

export default ProfileTab