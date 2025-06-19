import React from 'react'
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl'
import { UserResponse } from '@/src/models/response/user.response'
import { Mail, CalendarDays } from 'lucide-react' // Import Lucide icons

const InfoItem: React.FC<{
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}> = ({ icon, label, value }) => (
  <div className='flex items-start gap-4 rounded-lg bg-gray-10 p-4 dark:bg-gray-800/50'>
    <div className='flex-shrink-0 '>{icon}</div>
    <div className='min-w-0 flex-1'>
      <dt className='truncate text-sm font-medium '>{label}</dt>
      <dd className='mt-1 text-sm '>{value}</dd>
    </div>
  </div>
)

interface ProfileDisplayInfoProps {
  user: UserResponse
  formattedDob: string | null
}

const ProfileDisplayInfo: React.FC<ProfileDisplayInfoProps> = ({
  user,
  formattedDob
}) => {
  const t = useTranslations('')

  return (
    <div className='space-y-8'>
      {user.aboutMe && (
        <div className='rounded-lg border border-gray-200 p-6 dark:border-gray-700'>
          <h3 className='text-lg font-semibold '>{t('About_me')}</h3>
          <p className='mt-2 break-words text-sm '>{user.aboutMe}</p>
        </div>
      )}

      <div className='space-y-4'>
        <h3 className='text-lg font-semibold '>{t('Basic_Information')}</h3>
        <dl className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <InfoItem
            icon={<Mail className='h-5 w-5' />}
            label={t('Email')}
            value={user.email}
          />{' '}
          {/* Using Lucide Mail icon */}
          {formattedDob && (
            <InfoItem
              icon={<CalendarDays className='h-5 w-5' />}
              label={t('Date_of_Birth')}
              value={formattedDob}
            />
          )}
        </dl>
      </div>

      {user.interestedTopics && user.interestedTopics.length > 0 && (
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold '>{t('Interested_Topics')}</h3>
          <div className='flex flex-wrap gap-2'>
            {user.interestedTopics.map(topic => (
              <Link
                key={topic}
                href={{ pathname: `/conferences`, query: { topics: topic } }}
              >
                <span className='bg-button/10 hover:bg-button/20 dark:bg-button/20 dark:hover:bg-button/30 cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold text-button transition-colors dark:text-button-text'>
                  #{topic}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileDisplayInfo
