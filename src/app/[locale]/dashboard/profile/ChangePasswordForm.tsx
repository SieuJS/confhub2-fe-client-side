'use client'
import React, { useState } from 'react'
import Button from '../../utils/Button'
import { useChangePassword } from '../../../../hooks/dashboard/profile/useChangePassword'
import { useTranslations } from 'next-intl'
// Import icons from lucide-react
import { Eye, EyeOff, X } from 'lucide-react' // X for close button

interface ChangePasswordFormProps {
  userId: string
  onClose: () => void
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
  } = useChangePassword(userId, onClose)

  const renderPasswordInput = (
    id: string,
    label: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    show: boolean,
    setShow: (show: boolean) => void
  ) => (
    <div>
      <label htmlFor={id} className='block text-sm font-medium '>
        {label}
      </label>
      <div className='relative mt-1'>
        <input
          type={show ? 'text' : 'password'}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          className='block w-full rounded-md border-gray-30 p-2.5 pr-10 shadow-sm focus:border-button focus:ring-button  sm:text-sm'
          aria-label={label}
        />
        {/* Nút này luôn hiển thị, icon bên trong sẽ thay đổi dựa vào 'show'
        <button
          type='button'
          onClick={() => setShow(!show)}
          className='absolute inset-y-0 right-0 flex items-center pr-3 '
          // Thêm aria-label để cải thiện khả năng tiếp cận
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? (
            <EyeOff className='h-5 w-5' />
          ) : (
            <Eye className='h-5 w-5' />
          )}
        </button> */}
      </div>
    </div>
  )

  return (
    <div className='animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm'>
      <div className='w-full max-w-md rounded-xl bg-background p-6 shadow-2xl dark:bg-gray-800'>
        <div className='flex items-center justify-between border-b border-gray-20 pb-4 '>
          <h2 className='text-xl font-semibold '>{t('Change_Password')}</h2>
          <button
            onClick={onClose}
            className=' transition-colors hover:text-gray-60 '
          >
            <X className='h-6 w-6' /> {/* Using Lucide X icon */}
          </button>
        </div>

        <div className='mt-6 space-y-4'>
          {renderPasswordInput(
            'oldPassword',
            t('Current_Password'),
            oldPassword,
            handleOldPasswordChange,
            showOldPassword,
            setShowOldPassword
          )}
          {renderPasswordInput(
            'newPassword',
            t('New_Password'),
            newPassword,
            handleNewPasswordChange,
            showNewPassword,
            setShowNewPassword
          )}
          {renderPasswordInput(
            'confirmNewPassword',
            t('Confirm_New_Password'),
            confirmNewPassword,
            handleConfirmNewPasswordChange,
            showConfirmPassword,
            setShowConfirmPassword
          )}
        </div>

        {error && <p className='mt-4 text-sm text-red-500'>{error}</p>}
        {message && <p className='mt-4 text-sm text-green-600'>{message}</p>}

        <div className='mt-6 flex justify-end space-x-4 border-t border-gray-20 pt-5 '>
          <Button variant='secondary' onClick={onClose} disabled={isLoading}>
            {t('Cancel')}
          </Button>
          <Button
            variant='primary'
            onClick={handleChangePassword}
            disabled={isLoading}
          >
            {isLoading ? t('Changing...') : t('Change_Password')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChangePasswordForm
