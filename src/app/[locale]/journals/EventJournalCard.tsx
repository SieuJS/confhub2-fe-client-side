'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { JournalData } from '../../../models/response/journal.response'
import Button from '../utils/Button'
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl'
import { journalFollowService } from '@/src/services/journal-follow.service'
import { toast } from 'react-toastify'

// === BƯỚC 1: IMPORT DỮ LIỆU COUNTRIES ===
import countries from '@/src/app/[locale]/addconference/countries.json' // Điều chỉnh đường dẫn nếu cần

// Import Lucide Icons
import {
  BookOpen,
  Building,
  Globe,
  BarChart2,
  Hash,
  Award,
  Info,
  Heart,
  Loader2
} from 'lucide-react'

interface EventJournalCardProps {
  journal: JournalData
}

const EventJournalCard: React.FC<EventJournalCardProps> = ({ journal }) => {
  const t = useTranslations('JournalCard')
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const followedJournals = await journalFollowService.getFollowedJournals()
        setIsFollowing(followedJournals.some(fj => fj.journalId === journal.id))
      } catch (error) {
        console.error('Error checking follow status:', error)
      }
    }
    checkFollowStatus()
  }, [journal.id])

  const handleFollowToggle = async () => {
    if (isLoading) return
    setIsLoading(true)
    try {
      if (isFollowing) {
        await journalFollowService.unfollowJournal(journal.id)
        toast.success(t('unfollowSuccess'))
      } else {
        await journalFollowService.followJournal(journal.id)
        toast.success(t('followSuccess'))
      }
      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error('Error toggling follow status:', error)
      toast.error(t('followError'))
    } finally {
      setIsLoading(false)
    }
  }


  // === BƯỚC 2: TÌM ISO2 CODE CỦA QUỐC GIA BẰNG useMemo ===
  const countryIso2 = useMemo(() => {
    if (!journal.Country) return null

    // Tìm kiếm không phân biệt chữ hoa/thường để tăng tính ổn định
    const countryData = countries.find(
      (c) => c.name.toLowerCase() === journal.Country.toLowerCase()
    )

    // Trả về mã iso2 dưới dạng chữ thường để khớp với tên file ảnh
    return countryData ? countryData.iso2.toLowerCase() : null
  }, [journal.Country]) // Chỉ tính toán lại khi tên quốc gia thay đổi

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

  const latestQuartile = journal.SupplementaryTable?.[journal.SupplementaryTable.length - 1]?.Quartile

  return (
    <div
      className='flex overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md
                 hover:shadow-lg transition-all duration-300 ease-in-out border border-gray-200 dark:border-gray-700'
    >
      <div className='flex flex-col flex-grow p-4 justify-between'>
        {/* Top section for information */}
        <div>
          {/* Title is already left-aligned by default (block element) */}
          <h3 className='mb-3 text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2'>
            {journal.Title}
          </h3>

          {/* Grid for details. The `1fr` column ensures text starts from the left edge of its column. */}
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm text-gray-600 dark:text-gray-300">
            {journal.ISSN && (
              <>
                <BookOpen size={16} className="text-gray-500 dark:text-gray-400 mt-0.5" />
                {/* Ensure text within the paragraph is left-aligned */}
                <p className='line-clamp-1 text-left'>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">{t('issnLabel')}:</span> {journal.ISSN}
                </p>
              </>
            )}
            {journal.Publisher && (
              <>
                <Building size={16} className="text-gray-500 dark:text-gray-400 mt-0.5" />
                <p className='line-clamp-2 text-left'>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">{t('publisherLabel')}:</span> {journal.Publisher}
                </p>
              </>
            )}
            {/* === BƯỚC 3: CẬP NHẬT PHẦN HIỂN THỊ COUNTRY === */}
            {journal.Country && (
              <>
                <Globe size={16} className="text-gray-500 dark:text-gray-400 mt-0.5" />
                <div className="flex items-center gap-2"> {/* Container cho cờ và tên */}
                  {countryIso2 && (
                    <Image
                      src={`/country_flags/${countryIso2}.svg`}
                      alt={journal.Country}
                      width={20}
                      height={15}
                      className="flex-shrink-0 rounded-sm" // Thêm bo góc nhẹ
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
                <BarChart2 size={16} className="text-gray-500 dark:text-gray-400 mt-0.5" />
                <p className='text-left'>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">{t('sjrLabel')}:</span> {journal.SJR}
                </p>
              </>
            )}
            {journal["H index"] !== undefined && journal["H index"] !== null && (
              <>
                <Hash size={16} className="text-gray-500 dark:text-gray-400 mt-0.5" />
                <p className='text-left'>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">{t('hIndexLabel')}:</span> {journal["H index"]}
                </p>
              </>
            )}
            {latestQuartile && (
              <>
                <Award size={16} className={`mt-0.5 ${getQuartileColor(latestQuartile)}`} />
                <p className={`${getQuartileColor(latestQuartile)} text-left`}>
                  <span className="font-bold">{t('latestQuartileLabel')}:</span> {latestQuartile}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Action buttons are aligned within their flex container.
            The text within the buttons is centered by `justify-center` on the `span` element.
            This is appropriate for buttons. */}
        <div className='flex items-center gap-2 mt-4'>
          <Button variant='primary' size='small' rounded className='flex-1'>
            {/* The Link content itself is a flex container for text and icon */}
            <Link href={{ pathname: '/journals/detail', query: { id: journal.id } }} className="flex items-center justify-center w-full gap-1.5">
              <Info size={16} />
              {t('detailsButton')}
            </Link>
          </Button>
          <Button
            variant={isFollowing ? 'secondary' : 'primary'}
            size='small'
            rounded
            className='flex-1'
            onClick={handleFollowToggle}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center w-full gap-1.5">
                <Loader2 size={16} className="animate-spin" />
                {t('loadingButton')}
              </span>
            ) : (
              <span className="flex items-center justify-center w-full gap-1.5">
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

      {/* Image container remains unchanged as it only contains an image */}
      <div className='relative w-1/2 flex-shrink-0'>
        <Image
          src={journal.Image || '/bg-2.jpg'}
          alt={journal.Title || t('defaultJournalAltText')}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 33vw, 25vw"
          unoptimized={true} // Thêm prop này
        />
      </div>
    </div>
  )
}

export default EventJournalCard