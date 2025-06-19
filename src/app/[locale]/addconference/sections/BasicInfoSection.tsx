// src/app/[locale]/addconference/sections/BasicInfoSection.tsx
'use client'

import React from 'react'
import { ConferenceDetailsStepProps } from '../steps/ConferenceDetailsStep'
import { LinkIcon, AcademicCapIcon } from '@heroicons/react/24/outline'
import { FormSectionCard, TextInput } from '../steps/ConferenceDetailsStep'
import { Loader2, CheckCircle, XCircle } from 'lucide-react' // Import icons mới

// Interface props cần được cập nhật để nhận `existenceCheck`
interface BasicInfoSectionProps extends ConferenceDetailsStepProps {
  id: string
  existenceCheck: {
    // Thêm prop này
    status: 'idle' | 'loading' | 'success' | 'error'
    message: string | null
  }
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  id,
  formData,
  errors,
  touchedFields,
  handlers,
  existenceCheck, // Nhận state mới
  t
}) => {
  // Component nhỏ để hiển thị trạng thái kiểm tra
  const ExistenceStatusIndicator = () => {
    if (existenceCheck.status === 'loading') {
      // Không cần tooltip khi đang loading
      return <Loader2 className='h-5 w-5  animate-spin' />
    }
    if (existenceCheck.status === 'success') {
      // *** SỬA LỖI Ở ĐÂY: Bọc icon trong một thẻ span và đặt title cho thẻ span ***
      return (
        <span
          title={existenceCheck.message || t('This_combination_is_available')}
        >
          <CheckCircle className='h-5 w-5 text-green-500' />
        </span>
      )
    }
    if (existenceCheck.status === 'error') {
      // *** SỬA LỖI Ở ĐÂY: Bọc icon trong một thẻ span và đặt title cho thẻ span ***
      return (
        <span title={existenceCheck.message || t('An_error_occurred')}>
          <XCircle className='h-5 w-5 text-red-500' />
        </span>
      )
    }
    return null // Trạng thái 'idle' không hiển thị gì
  }

  return (
    <div id={id}>
      <FormSectionCard
        title={t('Basic_Information')}
        description={t('Provide_the_core_details_of_your_conference')}
      >
        {/* Bọc TextInput và Indicator trong một div để dễ dàng layout */}
        <div className='grid grid-cols-12 items-start gap-x-4 sm:col-span-6'>
          <div className='col-span-11'>
            <TextInput
              id='title'
              label='Conference_Name'
              value={formData.title}
              onChange={e =>
                handlers.handleFieldChange('title', e.target.value)
              }
              onBlur={() => handlers.handleBlur('title')}
              isTouched={touchedFields.has('title')}
              error={errors.title} // Lỗi này giờ có thể đến từ server
              placeholder='e.g., International Conference on Machine Learning'
              required
              className='sm:col-span-12' // Chiếm toàn bộ chiều rộng của container cha
              icon={<AcademicCapIcon className='h-5 w-5 ' />}
              t={t}
            />
          </div>
          <div className='col-span-1 pt-9'>
            {' '}
            {/* Căn chỉnh indicator với input */}
            <ExistenceStatusIndicator />
          </div>
        </div>

        <div className='grid grid-cols-12 items-start gap-x-4 sm:col-span-6'>
          <div className='col-span-11'>
            <TextInput
              id='acronym'
              label='Acronym'
              value={formData.acronym}
              onChange={e =>
                handlers.handleFieldChange('acronym', e.target.value)
              }
              onBlur={() => handlers.handleBlur('acronym')}
              isTouched={touchedFields.has('acronym')}
              error={errors.acronym}
              placeholder='e.g., ICML 2024'
              helperText='The_conference_title_and_acronym_pair_must_be_unique'
              required
              className='sm:col-span-12'
              t={t}
            />
          </div>
          <div className='col-span-1 pt-9'>
            {/* Indicator cũng có thể hiển thị ở đây */}
          </div>
        </div>

        {/* Link input không thay đổi */}
        <TextInput
          id='link'
          label='Official_Website'
          value={formData.link}
          onChange={e => handlers.handleFieldChange('link', e.target.value)}
          onBlur={() => handlers.handleBlur('link')}
          isTouched={touchedFields.has('link')}
          error={errors.link}
          placeholder='https://example.com'
          required
          type='url'
          className='sm:col-span-6' // Quay lại layout cũ
          icon={<LinkIcon className='h-5 w-5 ' />}
          t={t}
        />
      </FormSectionCard>
    </div>
  )
}

export default BasicInfoSection
