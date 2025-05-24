'use client'
import React, { useState } from 'react'
import Button from '../../utils/Button' // Assuming you have a Button component
import { useChangePassword } from '../../../../hooks/dashboard/profile/useChangePassword'
import { useTranslations } from 'next-intl'

interface ChangePasswordFormProps {
  userId: string
  onClose: () => void // Callback to close the form
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  userId,
  onClose
}) => {
  const t = useTranslations('')

  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    oldPassword,
    newPassword,
    confirmNewPassword,
    error,
    message,
    isLoading,
    handleOldPasswordChange,
    handleNewPasswordChange,
    handleConfirmNewPasswordChange,
    handleChangePassword
  } = useChangePassword(userId, onClose) // Pass userId and onClose

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='w-full max-w-md rounded-lg bg-white-pure p-6 shadow-lg'>
        <h2 className='mb-4 text-lg font-semibold'>{t('Change_Password')}</h2>

        {/* Old password */}
        <label htmlFor='currentPassword' className='block text-sm font-medium'>
          {t('Current_Password')}
        </label>
        <div className='relative'>
          <input
            type={showOldPassword ? 'text' : 'password'}
            id='oldPassword'
            name='oldPassword'
            value={oldPassword}
            onChange={handleOldPasswordChange}
            className='mt-1 block w-full rounded-md border p-2 focus:border-blue-500 focus:ring-blue-500'
            aria-label={t('Current_Password')} // Added aria-label for better testing if needed
          />
          {oldPassword && (
            <button
              type='button'
              onClick={() => setShowOldPassword(!showOldPassword)}
              className='absolute right-2 top-1/2 -translate-y-1/2 text-xl'
            >
              <span className='relative inline-block w-6 text-xl leading-none'>
                👁️
                {showOldPassword && (
                  <span className='absolute left-0 top-1/2 h-[2px] w-[28px] -translate-y-1/2 -rotate-45 bg-black'></span>
                )}
              </span>
            </button>
          )}
        </div>

        {/* New password */}
        <div className='mt-4'>
          <label htmlFor='newPassword' className='block text-sm font-medium'>
            {t('New_Password')}
          </label>
          <div className='relative'>
            <input
              type={showNewPassword ? 'text' : 'password'}
              id='newPassword'
              name='newPassword'
              value={newPassword}
              onChange={handleNewPasswordChange}
              className='mt-1 block w-full rounded-md border p-2 focus:border-blue-500 focus:ring-blue-500'
              aria-label={t('New_Password')} // Added aria-label for better testing if needed
            />
            {newPassword && (
              <button
                type='button'
                onClick={() => setShowNewPassword(!showNewPassword)}
                className='absolute right-2 top-1/2 -translate-y-1/2 text-xl'
              >
                <span className='relative inline-block w-6 text-xl leading-none'>
                  👁️
                  {showNewPassword && (
                    <span className='absolute left-0 top-1/2 h-[2px] w-[28px] -translate-y-1/2 -rotate-45 bg-black'></span>
                  )}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Confirm password */}
        <div className='mt-4'>
          <label
            htmlFor='confirmNewPassword'
            className='block text-sm font-medium'
          >
            {t('Confirm_New_Password')}
          </label>
          <div className='relative'>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id='confirmNewPassword'
              name='confirmNewPassword'
              value={confirmNewPassword}
              onChange={handleConfirmNewPasswordChange}
              className='mt-1 block w-full rounded-md border p-2 focus:border-blue-500 focus:ring-blue-500'
              aria-label={t('Confirm_New_Password')} // Added aria-label for better testing if needed
            />
            {confirmNewPassword && (
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-2 top-1/2 -translate-y-1/2 text-xl'
              >
                <span className='relative inline-block w-6 text-xl leading-none'>
                  👁️
                  {showConfirmPassword && (
                    <span className='absolute left-0 top-1/2 h-[2px] w-[28px] -translate-y-1/2 -rotate-45 bg-black'></span>
                  )}
                </span>
              </button>
            )}
          </div>
        </div>
        {error && <p className='mt-2 text-sm text-red-500'>{error}</p>}
        {message && <p className='mt-2 text-sm text-green-500'>{message}</p>}
        <div className='mt-4 flex justify-end space-x-4'>
          <Button
            variant='secondary'
            className='rounded-md px-6 py-2 focus:outline-none focus:ring-2'
            onClick={onClose}
            disabled={isLoading}
          >
            {t('Cancel')}
          </Button>
          <Button
            variant='primary'
            onClick={handleChangePassword}
            disabled={isLoading}
            className='rounded-md px-6 py-2 focus:outline-none focus:ring-2'
            aria-label={t('New_Password')}
          >
            {isLoading ? t('Changing') : t('Change_Password')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChangePasswordForm
