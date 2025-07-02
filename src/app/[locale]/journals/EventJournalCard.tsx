// src/components/EventJournalCard.tsx
'use client'

import React, { useState, useEffect, useMemo, memo, useCallback } from 'react' // Thêm memo và useCallback
import Image from 'next/image'
import { JournalData } from '../../../models/response/journal.response'
import Button from '../utils/Button'
import { Link, usePathname } from '@/src/navigation' // <-- Thêm useRouter, usePathname
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { journalFollowService } from '@/src/services/journal-follow.service'
import { toast } from 'react-toastify'
import { useAuth } from '@/src/contexts/AuthContext' // <-- Thêm useAuth

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

const EventJournalCardComponent: React.FC<EventJournalCardProps> = ({
  journal,
  isInitiallyFollowing,
  onFollowStatusChange
}) => {
  const t = useTranslations('JournalCard')
  const t_common = useTranslations('') // Để lấy locale
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing)
  const [isLoading, setIsLoading] = useState(false)

  // --- BƯỚC 1: LẤY TRẠNG THÁI AUTH VÀ ROUTER ---
  const { isLoggedIn, isInitializing: isAuthInitializing } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const locale = t_common('language')

  useEffect(() => {
    setIsFollowing(isInitiallyFollowing);
  }, [isInitiallyFollowing]);

  // --- BƯỚC 2: TẠO HÀM KIỂM TRA ĐĂNG NHẬP ---
  const checkLoginAndRedirect = useCallback(
    (callback: () => void) => {
      if (isAuthInitializing) {
        // Nếu đang khởi tạo auth, không làm gì cả để tránh chuyển hướng sai
        return;
      }
      if (!isLoggedIn) {
        // Nếu chưa đăng nhập, lưu URL hiện tại và chuyển hướng đến trang đăng nhập
        // toast.info(t('loginToFollow')); // Thông báo cho người dùng
        localStorage.setItem('returnUrl', pathname);
        router.push(`/${locale}/auth/login`);
      } else {
        // Nếu đã đăng nhập, thực hiện hành động (callback)
        callback();
      }
    },
    [isLoggedIn, isAuthInitializing, pathname, router, locale, t]
  );

  // --- BƯỚC 3: TÁCH LOGIC FOLLOW RA HÀM RIÊNG ---
  // Hàm này chứa logic gọi API, sẽ được gọi sau khi đã kiểm tra đăng nhập
  const performFollowToggle = async () => {
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
      toast.error(t('followError'))
    } finally {
      setIsLoading(false)
    }
  }

  // --- BƯỚC 4: TẠO HÀM HANDLER MỚI CHO NÚT BẤM ---
  // Hàm này sẽ được gắn vào sự kiện onClick của nút
  const handleFollowClick = () => {
    checkLoginAndRedirect(performFollowToggle);
  };

  const countryIso2 = useMemo(() => {
    if (!journal.Country) return null
    const countryData = countries.find(
      c => c.name.toLowerCase() === journal.Country.toLowerCase()
    )
    return countryData ? countryData.iso2.toLowerCase() : null
  }, [journal.Country])

  const getQuartileColor = (quartile: string | undefined): string => {
    switch (quartile) {
      case 'Q1': return 'text-green-500 dark:text-green-400 font-bold'
      case 'Q2': return 'text-lime-500 dark:text-lime-400 font-bold'
      case 'Q3': return 'text-yellow-500 dark:text-yellow-400 font-bold'
      case 'Q4': return 'text-red-500 dark:text-red-400 font-bold'
      default: return 'text-gray-500 dark:text-gray-400'
    }
  }

  const latestQuartile = journal.SupplementaryTable?.[journal.SupplementaryTable.length - 1]?.Quartile

  return (
    <div
      className='flex h-full overflow-hidden rounded-xl border border-gray-200
                 bg-white-pure shadow-md transition-all duration-300 ease-in-out hover:shadow-lg dark:border-gray-700'
    >
      <div className='flex flex-grow flex-col justify-between p-4'>
        <div>
          <Link
            href={{ pathname: '/journals/detail', query: { id: journal.id } }}
            className='mb-3 block cursor-pointer text-lg font-bold text-gray-800 hover:text-blue-600 hover:underline dark:text-gray-200 dark:hover:text-blue-400'
          >
            <h3 className='line-clamp-2'>{journal.Title}</h3>
          </Link>

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

        <div className='mt-4 flex items-center justify-end'>
          <Button
            variant={isFollowing ? 'secondary' : 'primary'}
            size='small'
            rounded
            className='h-8 w-full'
            onClick={handleFollowClick} // <-- BƯỚC 5: SỬ DỤNG HANDLER MỚI
            disabled={isLoading || isAuthInitializing} // Vô hiệu hóa nút khi đang loading hoặc đang xác thực
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

export const EventJournalCard = memo(EventJournalCardComponent);
export default EventJournalCard;