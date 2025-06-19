import React from 'react'
import Button from '../../utils/Button'
import { useTranslations } from 'next-intl'
import { AlertCircle, X } from 'lucide-react' // Import Lucide icons

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
  error: string | null
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  error
}) => {
  const t = useTranslations('')

  if (!isOpen) return null

  return (
    <div className='animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm'>
      <div className='w-full max-w-md rounded-xl bg-background p-6 text-center shadow-2xl dark:bg-gray-800'>
        <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10'>
          <AlertCircle className='h-12 w-12 text-red-500' />{' '}
          {/* Using Lucide AlertCircle icon */}
        </div>
        <h2 className='mt-4 text-xl font-bold '>
          {t('Confirm_Account_Deletion')}
        </h2>
        <p className='mt-2 text-sm '>
          {t('Are_you_sure_you_want_to_delete_your_account')}
          <br />
          <strong className='text-red-600 dark:text-red-400'>
            {t('This_action_cannot_be_undone')}
          </strong>
          .
        </p>
        {error && (
          <p className='mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400'>
            {error}
          </p>
        )}
        <div className='mt-6 flex justify-center space-x-4'>
          <Button
            variant='secondary'
            onClick={onClose}
            disabled={isDeleting}
            className='flex-1'
          >
            {t('Cancel')}
          </Button>
          <Button
            variant='danger'
            onClick={onConfirm}
            disabled={isDeleting}
            className='flex-1'
          >
            {isDeleting ? t('Deleting...') : t('Delete_my_Account')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DeleteAccountModal
