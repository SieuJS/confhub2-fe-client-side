// src/app/[locale]/chatbot/PersonalizationConfirmationModal.tsx
import React from 'react'
import Modal from './Modal'
import { useTranslations } from 'next-intl'
import { ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react'
import { Link } from '@/src/navigation'

interface PersonalizationConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  type: 'enableBenefit' | 'missingInfo'
  missingFieldsText?: string
  size?: 'sm' | 'md' | 'lg' | '4xl'
  positioning?: 'fixed' | 'absolute' // Thêm prop để truyền xuống Modal
}

const PersonalizationConfirmationModal: React.FC<
  PersonalizationConfirmationModalProps
> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  missingFieldsText,
  size,
  positioning
}) => {
  const t = useTranslations()

  const getModalContent = () => {
    if (type === 'enableBenefit') {
      return {
        title: t('Personalization_Benefit_Privacy_Popup_Title'),
        IconComponent: UserCheck,
        iconColor: 'text-blue-600',
        iconBgColor: 'bg-blue-100',
        message: t('Personalization_Benefit_Privacy_Popup_Message'),
        confirmText: t('Enable_Feature_Button') || 'Enable Feature',
        confirmButtonClass:
          'bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-600',
        cancelText: t('Cancel_Button') || 'Cancel'
      }
    } else {
      return {
        title:
          t('Personalization_Warning_Missing_Info_Title') ||
          'Missing Profile Information',
        IconComponent: AlertTriangle,
        iconColor: 'text-yellow-600',
        iconBgColor: 'bg-yellow-100',
        message: t('Personalization_Warning_Missing_Info_Message', {
          fields:
            missingFieldsText ||
            t('Default_Missing_Fields_Placeholder') ||
            'required fields'
        }),
        additionalMessage: t(
          'Personalization_Warning_Missing_Info_Enable_Anyway'
        ),
        confirmText: t('Enable_Anyway_Button') || 'Enable Anyway',
        confirmButtonClass:
          'bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-600',
        cancelText: t('Update_Profile_Button') || 'Update Profile'
      }
    }
  }

  const content = getModalContent()
  if (!content) return null

  const { IconComponent, iconColor, iconBgColor } = content

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={content.title}
      size={size || 'lg'}
      positioning={positioning || 'fixed'} // Truyền prop positioning
      footer={
        // Các nút luôn nằm trên 1 hàng, căn giữa, khoảng cách nhỏ
        <div className='flex w-full flex-row items-center justify-center space-x-2'>
          {/* Nút "Cancel" hoặc "Update Profile" (Secondary) */}
          {type === 'missingInfo' ? (
            <Link
              href={{ pathname: '/dashboard', query: { tab: 'profile' } }}
            >
              <button
                type='button'
                onClick={onClose}
                className='rounded-md bg-white-pure px-3 py-1.5 text-xs font-medium shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-10 dark:bg-gray-700 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-600'
              >
                {content.cancelText}
              </button>
            </Link>
          ) : (
            <button
              type='button'
              onClick={onClose}
              className='rounded-md bg-white-pure px-3 py-1.5 text-xs font-medium shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-10 dark:bg-gray-700 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-600'
            >
              {content.cancelText}
            </button>
          )}

          {/* Nút "Enable Anyway" hoặc "Enable" (Primary) */}
          <button
            type='button'
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${content.confirmButtonClass}`}
          >
            {content.confirmText}
          </button>
        </div>
      }
    >
      {/* Nội dung được tối ưu hóa cho không gian nhỏ */}
      <div className='text-center'>
        {/* Icon nhỏ hơn */}
        <div
          className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full ${iconBgColor}`}
        >
          <IconComponent size={24} className={iconColor} aria-hidden='true' />
        </div>

        {/* Message với font nhỏ hơn */}
        <div className='text-sm text-gray-600 dark:text-gray-300'>
          <p className='whitespace-pre-line leading-snug'>{content.message}</p>
          {content.additionalMessage && (
            <p className='mt-2 whitespace-pre-line leading-snug'>
              {content.additionalMessage}
            </p>
          )}
        </div>

        {/* Privacy Section nhỏ gọn */}
        {type === 'enableBenefit' && (
          <div className='mt-3 rounded-md border border-slate-200 bg-gray-10 p-2 text-left text-xs dark:border-gray-700 dark:bg-gray-800'>
            <div className='flex items-start space-x-2'>
              <ShieldCheck
                className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-600'
                aria-hidden='true'
              />
              <div>
                <h4 className='mb-0.5 font-semibold text-gray-800 dark:text-gray-100'>
                  {t('Personalization_Privacy_Subheading') ||
                    'Your Privacy Matters'}
                </h4>
                <p className='leading-snug text-gray-500 dark:text-gray-400'>
                  {t('Personalization_Privacy_Detail') ||
                    'We are committed to protecting your data...'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default PersonalizationConfirmationModal