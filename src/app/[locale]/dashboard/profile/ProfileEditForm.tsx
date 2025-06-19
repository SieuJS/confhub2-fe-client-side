import React from 'react'
import Button from '../../utils/Button'
import { useTranslations } from 'next-intl'
import { UserResponse } from '@/src/models/response/user.response'
import { User, CalendarDays } from 'lucide-react' // Import Lucide icons

interface ProfileEditFormProps {
  editedData: Partial<UserResponse>
  dobError: string | null
  predefinedTopics: string[]
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
  onInterestedTopicsChange: (topic: string) => void
  onSave: () => void
  onCancel: () => void
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  editedData,
  dobError,
  predefinedTopics,
  onInputChange,
  onInterestedTopicsChange,
  onSave,
  onCancel
}) => {
  const t = useTranslations('')

  return (
    <div className='space-y-8'>
      <fieldset className='rounded-lg border border-gray-20 p-6'>
        <legend className='px-2 text-lg font-semibold '>
          {t('Basic_Information')}
        </legend>
        <div className='mt-4 grid grid-cols-1 gap-6 md:grid-cols-2'>
          {/* First Name */}
          <div>
            <label htmlFor='firstName' className='block text-sm font-medium '>
              {t('First_Name')}
            </label>
            <div className='relative mt-1'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                <User className='h-5 w-5 ' />
              </div>{' '}
              {/* Using Lucide User icon */}
              <input
                type='text'
                id='firstName'
                name='firstName'
                value={editedData.firstName || ''}
                onChange={onInputChange}
                className='block w-full rounded-md border-gray-300 p-2.5 pl-10 shadow-sm focus:border-button focus:ring-button dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm'
              />
            </div>
          </div>
          {/* Last Name */}
          <div>
            <label htmlFor='lastName' className='block text-sm font-medium '>
              {t('Last_Name')}
            </label>
            <div className='relative mt-1'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                <User className='h-5 w-5 ' />
              </div>{' '}
              {/* Using Lucide User icon */}
              <input
                type='text'
                id='lastName'
                name='lastName'
                value={editedData.lastName || ''}
                onChange={onInputChange}
                className='block w-full rounded-md border-gray-300 p-2.5 pl-10 shadow-sm focus:border-button focus:ring-button dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm'
              />
            </div>
          </div>
          {/* Date of Birth */}
          <div className='md:col-span-2'>
            <label htmlFor='dob' className='block text-sm font-medium '>
              {t('Date_of_Birth')}
            </label>
            <div className='relative mt-1'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                <CalendarDays className='h-5 w-5 ' />
              </div>{' '}
              {/* Using Lucide CalendarDays icon */}
              <input
                type='date'
                id='dob'
                name='dob'
                value={editedData.dob?.split('T')[0] || ''}
                onChange={onInputChange}
                className='block w-full rounded-md border-gray-300 p-2.5 pl-10 shadow-sm focus:border-button focus:ring-button dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm'
              />
            </div>
            {dobError && (
              <p className='mt-1 text-sm text-red-500'>{t(dobError)}</p>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className='rounded-lg border border-gray-20 p-6'>
        <legend className='px-2 text-lg font-semibold '>{t('About_me')}</legend>
        <div className='mt-4'>
          <textarea
            id='about'
            name='aboutMe'
            value={editedData.aboutMe || ''}
            onChange={onInputChange}
            maxLength={150}
            rows={4}
            className='mt-1 block w-full rounded-md border-gray-300 p-2.5 shadow-sm focus:border-button focus:ring-button dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm'
          />
          <p className='mt-1 text-right text-xs '>
            {editedData.aboutMe ? editedData.aboutMe.length : 0} / 100{' '}
            {t('characters')}
          </p>
        </div>
      </fieldset>

      <fieldset className='rounded-lg border border-gray-20 p-6'>
        <legend className='px-2 text-lg font-semibold '>
          {t('I_am_also_interested_in_these_topics')}
        </legend>
        <div className='mt-4 flex flex-wrap gap-3'>
          {predefinedTopics.map(topic => {
            const isSelected = (editedData.interestedTopics || []).includes(
              topic
            )
            return (
              <button
                type='button'
                key={topic}
                onClick={() => onInterestedTopicsChange(topic)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none ${
                  isSelected
                    ? 'bg-button text-button-text ring-2 ring-button ring-offset-2 ring-offset-background'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {topic}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className='mt-8 flex justify-end space-x-4 border-t border-gray-200 pt-6 dark:border-gray-700'>
        <Button variant='secondary' onClick={onCancel} className='px-6 py-2.5'>
          {t('Cancel')}
        </Button>
        <Button variant='primary' onClick={onSave} className='px-6 py-2.5'>
          {t('Save_Changes')}
        </Button>
      </div>
    </div>
  )
}

export default ProfileEditForm
