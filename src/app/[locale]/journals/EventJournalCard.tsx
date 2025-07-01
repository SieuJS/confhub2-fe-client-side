// src/components/EventJournalCard.tsx
'use client'

import React, { useState, useEffect, useMemo, memo } from 'react' // Thêm memo

import Image from 'next/image'
import { JournalData } from '../../../models/response/journal.response'
import Button from '../utils/Button'
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl'
import { journalFollowService } from '@/src/services/journal-follow.service'
import { toast } from 'react-toastify'

import countries from '@/src/app/[locale]/addconference/countries.json'

import {
  BookOpen,
  Building,
  Globe,
  BarChart2,
  Hash,
  Award,
  Heart,
  Loader2
} from 'lucide-react'

interface EventJournalCardProps {
  journal: JournalData;
  isInitiallyFollowing: boolean;
  onFollowStatusChange: (journalId: string, isFollowing: boolean) => void;
}

// Đổi tên component gốc
const EventJournalCardComponent: React.FC<EventJournalCardProps> = ({
  journal,
  isInitiallyFollowing,
  onFollowStatusChange
}) => {
  const t = useTranslations('JournalCard')
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsFollowing(isInitiallyFollowing);
  }, [isInitiallyFollowing]);

  const handleFollowToggle = async () => {
    if (isLoading) return
    setIsLoading(true)
    try {
      if (isFollowing) {
        await journalFollowService.unfollowJournal(journal.id)
      } else {
        await journalFollowService.followJournal(journal.id)
      }
      const newFollowStatus = !isFollowing;
      setIsFollowing(newFollowStatus);
      onFollowStatusChange(journal.id, newFollowStatus);
    } catch (error) {
      // console.error('Error toggling follow status:', error)
      toast.error(t('followError'))
    } finally {
      setIsLoading(false)
    }
  }

  const countryIso2 = useMemo(() => {
    if (!journal.Country) return null

    const countryData = countries.find(
      c => c.name.toLowerCase() === journal.Country.toLowerCase()
    )

    return countryData ? countryData.iso2.toLowerCase() : null
  }, [journal.Country])

  const getQuartileColor = (quartile: string | undefined): string => {
    switch (quartile) {
      case 'Q1':
        return 'text-green-500 dark:text-green-400 font-bold'
      case 'Q2':
        return 'text-lime-500 dark:text-lime-400 font-bold'
      case 'Q3':
        return 'text-yellow-500 dark:text-yellow-400 font-bold'
      case 'Q4':
        return 'text-red-500 dark:text-red-400 font-bold'
      default:
        return 'text-gray-500 dark:text-gray-400'
    }
  }

  const latestQuartile =
    journal.SupplementaryTable?.[journal.SupplementaryTable.length - 1]
      ?.Quartile

  return (
    // THAY ĐỔI TẠI ĐÂY: Thêm h-full
    <div
      className='flex h-full overflow-hidden rounded-xl border border-gray-200
                 bg-white-pure shadow-md transition-all duration-300 ease-in-out hover:shadow-lg dark:border-gray-700'
    >
      <div className='flex flex-grow flex-col justify-between p-4'>
        {/* Top section for information */}
        <div>
          {/* TIÊU ĐỀ LÀM THÀNH LINK */}
          <Link
            href={{ pathname: '/journals/detail', query: { id: journal.id } }}
            className='mb-3 block cursor-pointer text-lg font-bold text-gray-800 hover:text-blue-600 hover:underline dark:text-gray-200 dark:hover:text-blue-400'
          >
            <h3 className='line-clamp-2'>{journal.Title}</h3>
          </Link>

          {/* Grid for details. The `1fr` column ensures text starts from the left edge of its column. */}
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm text-gray-600 dark:text-gray-300">
            {journal.Issn && (
              <>
                <BookOpen size={16} className='mt-0.5' />
                <p className='line-clamp-1 text-left'>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">{t('issnLabel')}:</span> {journal.Issn}
                </p>
              </>
            )}
            {journal.Areas && (
              <>
                <Building size={16} className='mt-0.5' />
                <p className='line-clamp-2 text-left'>
                  <span className='font-semibold '>{t('areasLabel')}:</span>{' '}
                  {journal.Areas}
                </p>
              </>
            )}
            {journal.Country && (
              <>
                <Globe size={16} className='mt-0.5' />
                <div className='flex items-center gap-2'>
                  {countryIso2 && (
                    <Image
                      src={`/country_flags/${countryIso2}.svg`}
                      alt={journal.Country}
                      width={20}
                      height={15}
                      className='flex-shrink-0 rounded-sm'
                    />
                  )}
                  <span className='line-clamp-1 text-left'>
                    {journal.Country}
                  </span>
                </div>
              </>
            )}
            {journal.SJR !== undefined && journal.SJR !== null && (
              <>
                <BarChart2 size={16} className='mt-0.5' />
                <p className='text-left'>
                  <span className='font-semibold '>{t('sjrLabel')}:</span>{' '}
                  {journal.SJR}
                </p>
              </>
            )}
            {journal.hIndex !== undefined && journal.hIndex !== null && (
              <>
                <Hash size={16} className="text-gray-500 dark:text-gray-400 mt-0.5" />
                <p className='text-left'>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">{t('hIndexLabel')}:</span> {journal.hIndex}
                </p>
              </>
            )}
            {latestQuartile && (
              <>
                <Award
                  size={16}
                  className={`mt-0.5 ${getQuartileColor(latestQuartile)}`}
                />
                <p className={`${getQuartileColor(latestQuartile)} text-left`}>
                  <span className='font-bold'>{t('latestQuartileLabel')}:</span>{' '}
                  {latestQuartile}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Action buttons. Chỉ còn nút Follow/Unfollow */}
        <div className='mt-4 flex items-center justify-end'>
          <Button
            variant={isFollowing ? 'secondary' : 'primary'}
            size='small'
            rounded
            className='h-8 w-full'
            onClick={handleFollowToggle}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className='flex w-full items-center justify-center gap-1'>
                <Loader2 size={16} className='animate-spin' />
                {t('loadingButton')}
              </span>
            ) : (
              <span className='flex w-full items-center justify-center gap-1'>
                <Heart
                  size={16}
                  className={`${isFollowing ? 'fill-current text-red-500' : ''}`}
                />
                {isFollowing ? t('unfollowButton') : t('followButton')}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Image container */}
      <div className='relative w-1/2 flex-shrink-0 rounded-xl overflow-hidden'>
        <Image
          src={journal.Image || '/bg-2.jpg'}
          alt={journal.Title || t('defaultJournalAltText')}
          fill
          style={{ objectFit: 'cover' }}
          sizes='(max-width: 768px) 33vw, 25vw'
          unoptimized={true}
        />
      </div>
    </div>
  )
}

// Export component đã được memo-hóa
export const EventJournalCard = memo(EventJournalCardComponent);
export default EventJournalCard;