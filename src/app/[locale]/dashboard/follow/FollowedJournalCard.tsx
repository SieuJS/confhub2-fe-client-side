// src/components/MyConferences/FollowedJournalCard.tsx
import React from 'react'
import { BookOpen, Building, Globe } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/src/navigation'
import Button from '../../utils/Button'
import { timeAgo } from '../timeFormat' // Tái sử dụng hàm timeAgo

// Định nghĩa kiểu dữ liệu cho journal được follow, chỉ chứa các trường cần thiết
interface FollowedJournalForCard {
  id: string
  Title: string
  Publisher: string | null
  Country: string | null
  ISSN: string | null
  followedAt: string
}

interface FollowedJournalCardProps {
  journal: FollowedJournalForCard
}

const FollowedJournalCard: React.FC<FollowedJournalCardProps> = ({
  journal
}) => {
  const t = useTranslations('')
  const language = t('language')

  return (
    <div className='flex flex-col overflow-hidden rounded-xl bg-white-pure shadow-md transition-shadow duration-300 hover:shadow-xl'>
      <div className='flex-grow p-5'>
        {/* Header: Thời gian follow */}
        <div className='mb-3 flex items-start justify-between'>
          <p className='text-left text-sm '>
            {t('Followed_Time')}: {timeAgo(journal.followedAt, language)}
          </p>
        </div>

        {/* Body: Thông tin chính */}
        <h3 className='text-lg font-bold leading-tight text-indigo-700 transition-colors hover:text-indigo-900'>
          {journal.Title}
        </h3>
        <div className='mt-2 space-y-2 text-sm '>
          {journal.ISSN && (
            <div className='flex items-center gap-2'>
              <BookOpen className='h-4 w-4 flex-shrink-0 ' />
              <span>{journal.ISSN}</span>
            </div>
          )}
          {journal.Publisher && (
            <div className='flex items-center gap-2'>
              <Building className='h-4 w-4 flex-shrink-0 ' />
              <span className='line-clamp-1'>{journal.Publisher}</span>
            </div>
          )}
          {journal.Country && (
            <div className='flex items-center gap-2'>
              <Globe className='h-4 w-4 flex-shrink-0 ' />
              <span>{journal.Country}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Các nút hành động */}
      <div className='flex justify-end border-t border-gray-200 bg-gray-10 px-5 py-3'>
        <Link
          href={{
            pathname: '/journals/detail', // Đổi pathname sang trang chi tiết journal
            query: { id: journal.id }
          }}
        >
          <Button
            variant='primary'
            size='small'
            rounded
            className='inline-flex items-center gap-2'
          >
            {t('View_Details')}
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default FollowedJournalCard
