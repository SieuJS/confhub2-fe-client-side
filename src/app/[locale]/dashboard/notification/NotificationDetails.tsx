// src/app/[locale]/dashboard/notifications/NotificationDetail.tsx

import React, { useState, useEffect, useCallback } from 'react'
import { Notification } from '../../../../models/response/user.response'
import { formatDateFull } from '../timeFormat'
import { useSearchParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { useTranslations } from 'next-intl'
import { Link } from '@/src/navigation'
import Button from '../../utils/Button'
import { Trash2 } from 'lucide-react' // Import icon Trash2
import remarkBreaks from 'remark-breaks'
interface NotificationDetailProps {
  notification: Notification
  onBack: () => void
  onDelete: (id: string) => void
  onToggleImportant: (id: string) => void
}

const NotificationDetail: React.FC<NotificationDetailProps> = ({
  notification,
  onBack,
  onDelete,
  onToggleImportant
}) => {
  const t = useTranslations('')
  const language = t('language')
  const [isStarred, setIsStarred] = useState(false)
  const searchParams = useSearchParams()
  const notificationId = searchParams.get('id')
  // Keep seenAt as state, and initialize it with notification.seenAt.  No need for useState.
  const seenAt = notification.seenAt

  useEffect(() => {
    setIsStarred(notification.isImportant)
  }, [notification.isImportant]) // Simplified dependency array

  const toggleStar = useCallback(() => {
    setIsStarred(prevIsStarred => !prevIsStarred)
    onToggleImportant(notification.id)
  }, [notification.id, onToggleImportant])

  return (
    <div className='container mx-auto p-4'>
      <div className='mb-4 flex items-center'>
        <button
          onClick={onBack}
          className='mr-2 text-blue-500 hover:text-blue-700 focus:outline-none'
        >
          ← {t('Back')}
        </button>
        <button
          onClick={e => {
            toggleStar()
            e.stopPropagation()
          }}
          className='mr-3 focus:outline-none'
          aria-label='Mark as important'
        >
          <span
            className={`${isStarred || notification.isImportant
                ? 'text-yellow-500'
                : 'text-gray-400'
              } text-lg`}
          >
            ★
          </span>
        </button>
        <h2 className='text-lg font-semibold'>
          {notification.type.replace(/_/g, ' ')}
        </h2>
      </div>
      <div className='mb-4 border-b border-gray-300 pb-2 text-sm '>
        {formatDateFull(notification.createdAt, language)}
      </div>
      <div className='rounded-lg bg-white-pure p-4 shadow'>
        {/* Use ReactMarkdown to render the message */}
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw]}
        >
          {notification.message}
        </ReactMarkdown>
        <div className='text-left text-sm md:text-base'>
          <Link
            href={{
              pathname: '/conferences/detail',
              query: { id: notification.conferenceId }
            }}
          >
            <Button variant='primary' size={'small'} className='m-2'>
              {t('Details_about_conference')}
            </Button>
          </Link>
        </div>
        {/* Display seenAt.  It will now ALWAYS be the initial seenAt value. */}
        {seenAt ? (
          <p className='mt-2 text-sm '>
            {t('Seen_at')}: {formatDateFull(seenAt, language)}
          </p>
        ) : (
          <p className='mt-2 text-sm '>{t('Not_yet_seen')}</p>
        )}
      </div>
      <div className='mt-4 flex items-center space-x-2'>
        <button
          onClick={e => {
            onDelete(notification.id)
            onBack()
            e.stopPropagation()
          }}
          className=' hover:text-red-500 focus:outline-none'
          aria-label='Delete notification'
        >
          {/* Thay thế SVG bằng icon Lucide Trash2 */}
          <Trash2 size={20} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}

export default NotificationDetail