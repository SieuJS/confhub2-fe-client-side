'use client'

import React, { useState, useEffect } from 'react'
import Button from '../../utils/Button'
import { useTranslations } from 'next-intl'
import { Link } from '@/src/navigation'
import { useAuth } from '@/src/contexts/AuthContext'
import { useEditProfile } from '@/src/hooks/dashboard/profile/useEditProfile'
import { useImageSelection } from '@/src/hooks/dashboard/profile/useImageSelection'
import ChangePasswordForm from './ChangePasswordForm'
import ProfileHeader from './ProfileHeader'
import ProfileDisplayInfo from './ProfileDisplayInfo'
import ProfileEditForm from './ProfileEditForm'
import ImageSelectionModal from './ImageSelectionModal'
import DeleteAccountModal from './DeleteAccountModal'
import { Loader2 } from 'lucide-react' // Import Loader2

const ProfileTab: React.FC = () => {
  const t = useTranslations('')

  const {
    user: authUser,
    isInitializing: isAuthInitializing,
    error: authError,
    isLoggedIn,
    deleteAccount
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
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(
    null
  )
  const [initialLoad, setInitialLoad] = useState(true) // State cho initialLoad

  // Set initialLoad to false once authentication initialization is complete
  useEffect(() => {
    if (!isAuthInitializing) {
      setInitialLoad(false)
    }
  }, [isAuthInitializing])

  useEffect(() => {
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

  const handleDeleteAccountClick = () => {
    setShowDeleteConfirmModal(true)
    setDeleteAccountError(null)
  }

  const handleConfirmDeleteAccount = async () => {
    setIsDeletingAccount(true)
    setDeleteAccountError(null)
    try {
      const result = await deleteAccount()
      if (!result.success) {
        setDeleteAccountError(
          result.error || t('Failed_to_delete_account_unknown_error')
        )
      }
    } catch (error) {
      // console.error('Error during account deletion:', error)
      setDeleteAccountError(t('Failed_to_delete_account_network_error'))
    } finally {
      setIsDeletingAccount(false)
      if (!deleteAccountError) {
        setShowDeleteConfirmModal(false)
      }
    }
  }

  // Hàm render loading tương tự như FollowedTab
  const renderLoading = () => (
    <div className='flex h-80 flex-col items-center justify-center '>
      <Loader2 className='h-10 w-10 animate-spin text-primary' />{' '}
      {/* Kích thước và màu */}
      <p className='mt-4 text-lg'>
        {t('MyConferences.Loading_your_profile')}
      </p>{' '}
      {/* Dòng chữ */}
    </div>
  )

  // --- Render Loading with Loader2 ---
  if (isAuthInitializing && initialLoad) {
    return (
      <div className='flex h-screen items-center justify-center'>
        {renderLoading()} {/* Gọi hàm renderLoading */}
      </div>
    )
  }

  // --- Render Error/Login Required after initial load ---
  if (authError && !isLoggedIn) {
    return (
      <div className='container mx-auto p-4 text-center'>
        {' '}
        {/* Thêm class container mx-auto p-4 text-center */}
        <div className='rounded-lg bg-background p-8 text-center shadow-lg'>
          {' '}
          {/* Giữ lại div này để có background và shadow */}
          <p className='mb-4 text-red-500'>{authError}</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className='container mx-auto p-4 text-center'>
        {' '}
        {/* <-- THAY ĐỔI Ở ĐÂY */}
        {/*
          Theo FollowedTab, không có rounded-lg bg-background p-8 text-center shadow-lg ở đây.
          Nó chỉ có h2 và p trực tiếp.
          Để đồng bộ, chúng ta bỏ div bọc và giữ nguyên h2, p, button.
        */}
        <h2 className='mb-2 text-xl font-semibold'>
          {t('MyConferences.Login_Required_Title')}
        </h2>{' '}
        {/* Sử dụng h2 và key dịch tương tự */}
        <p className='mb-4'>{t('MyConferences.Login_Required_Message')}</p>{' '}
        {/* Sử dụng key dịch tương tự */}
        <Link href='/auth/login'>
          <Button variant='primary'>{t('Sign_In')}</Button>
        </Link>
      </div>
    )
  }

  if (!authUser) {
    return (
      <div className='container mx-auto p-4 text-center'>
        {' '}
        {/* Đồng bộ với cấu trúc trên */}
        <h2 className='mb-2 text-xl font-semibold'>
          {t('User_data_not_available_title')}
        </h2>{' '}
        {/* Thêm title nếu cần */}
        <p className='mb-4'>{t('User_data_not_available')}</p>
      </div>
    )
  }

  const displayUser = isEditing ? { ...authUser, ...editedData } : authUser
  const displayAvatarUrl = displayUser.avatar || '/avatar1.jpg'
  const displayBackgroundUrl = displayUser.background || '/bg-2.jpg'

  return (
    <div className='mx-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-background shadow-xl'>
      <ProfileHeader
        user={displayUser}
        isEditing={isEditing}
        displayAvatarUrl={displayAvatarUrl}
        displayBackgroundUrl={displayBackgroundUrl}
        onEditClick={handleEditClick}
        onChangePasswordClick={() => setShowChangePasswordForm(true)}
        onDeleteAccountClick={handleDeleteAccountClick}
        onAvatarEditClick={() => setShowAvatarModal(true)}
        onBackgroundEditClick={() => setShowBackgroundModal(true)}
      />

      {/* Content Section */}
      <div className='p-4 sm:p-6 md:p-8'>
        {isEditing ? (
          <ProfileEditForm
            editedData={editedData}
            dobError={dobError}
            predefinedTopics={predefinedTopics}
            onInputChange={handleInputChange}
            onInterestedTopicsChange={handleInterestedTopicsChange}
            onSave={handleProfileSave}
            onCancel={handleCancelClick}
          />
        ) : (
          <ProfileDisplayInfo user={authUser} formattedDob={formattedDob} />
        )}
      </div>

      {/* --- Modals --- */}
      <ImageSelectionModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onSelect={handleAvatarSelect}
        title='Select_an_Avatar'
        options={avatarOptions}
        gridCols='grid-cols-3 sm:grid-cols-4'
        aspectRatio='aspect-square'
      />

      <ImageSelectionModal
        isOpen={showBackgroundModal}
        onClose={() => setShowBackgroundModal(false)}
        onSelect={handleBackgroundSelect}
        title='Select_a_Background'
        options={backgroundOptions}
        gridCols='grid-cols-2 sm:grid-cols-3'
        aspectRatio='aspect-[16/10]'
      />

      {showChangePasswordForm && authUser && (
        <ChangePasswordForm
          userId={authUser.id}
          onClose={() => setShowChangePasswordForm(false)}
        />
      )}

      <DeleteAccountModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={handleConfirmDeleteAccount}
        isDeleting={isDeletingAccount}
        error={deleteAccountError}
      />
    </div>
  )
}

export default ProfileTab
