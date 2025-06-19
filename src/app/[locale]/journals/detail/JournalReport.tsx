// src/app/[locale]/journal/JournalReport.tsx

'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react' // Thêm useMemo
import Image from 'next/image' // Thêm Image
import Button from '../../utils/Button'
import { JournalData } from '../../../../models/response/journal.response'
import { useTranslations } from 'next-intl'
import { toast } from 'react-toastify'
import { journalFollowService } from '../../../../services/journal-follow.service'
import { useAuth } from '@/src/contexts/AuthContext'
import { useRouter, usePathname } from '@/src/navigation'

// === IMPORT DỮ LIỆU COUNTRIES ===
import countries from '@/src/app/[locale]/addconference/countries.json' // Điều chỉnh đường dẫn nếu cần

// === IMPORT CÁC ICON TỪ LUCIDE (ĐÃ CẬP NHẬT) ===
import {
  Heart,
  Loader2,
  Award,
  TrendingUp,
  BookUser,
  BarChart3,
  ExternalLink,
  Building,
  Globe,
  Barcode,
  ShieldCheck,
  CalendarClock,
  Shapes,
  Info,
  Mail,
  Send,
  MapPin,
  History, // Icon cho thời gian cập nhật

} from 'lucide-react'

// === IMPORT TỪ DATE-FNS VÀ NEXT-INTL ===
import { formatDistanceToNow } from 'date-fns'
import { enUS, vi } from 'date-fns/locale' // Import các locale cần thiết
import { useLocale } from 'next-intl' // Hook để lấy locale hiện tại


interface JournalReportProps {
  journal: JournalData | undefined
}

// === COMPONENT CON: MetricCard (Không thay đổi) ===
const MetricCard = ({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ElementType
  label: string
  value: string | number | undefined
  className?: string
}) => (
  <div
    className={`flex flex-col items-center justify-center rounded-xl border bg-card p-4 text-center shadow-sm transition-all hover:shadow-md ${className}`}
  >
    <Icon className='mb-2 h-7 w-7 text-primary' />
    <span className='text-sm font-medium text-muted-foreground'>{label}</span>
    <span className='text-2xl font-bold text-card-foreground'>
      {value || 'N/A'}
    </span>
  </div>
)

// === COMPONENT CON: InfoRow (ĐÃ CẬP NHẬT Ở BƯỚC 1) ===
const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode | string | undefined
}) => (
  <div className='flex items-start justify-between border-b border-border py-3 last:border-none'>
    <div className='flex items-center gap-3'>
      <Icon className='h-5 w-5 flex-shrink-0 text-muted-foreground' />
      <span className='font-semibold text-card-foreground'>{label}</span>
    </div>
    <div className='text-right text-muted-foreground'>
      {value || 'N/A'}
    </div>
  </div>
)

const JournalReport: React.FC<JournalReportProps> = ({ journal }) => {
  const t = useTranslations()
  const currentLocale = useLocale() // Lấy locale hiện tại (ví dụ: 'en' hoặc 'vi')

  const router = useRouter()
  const pathname = usePathname()
  const { isLoggedIn, isInitializing: isAuthInitializing } = useAuth()

  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)



  // === LOGIC ĐỊNH DẠNG NGÀY THÁNG ===
  const lastUpdatedText = useMemo(() => {
    if (!journal?.updatedAt) {
      return null
    }

    // Chọn locale tương ứng cho date-fns
    const dateLocale = currentLocale === 'vi' ? vi : enUS

    try {
      // Định dạng ngày tháng thành chuỗi tương đối (ví dụ: "about 2 hours ago")
      return formatDistanceToNow(new Date(journal.updatedAt), {
        addSuffix: true,
        locale: dateLocale,
      })
    } catch (error) {
      console.error("Invalid date format for 'updatedAt':", journal.updatedAt)
      return null // Trả về null nếu ngày không hợp lệ
    }
  }, [journal?.updatedAt, currentLocale])


  // === TÌM ISO2 CODE BẰNG useMemo ===
  const countryIso2 = useMemo(() => {
    if (!journal?.Country) return null
    const countryData = countries.find(
      (c) => c.name.toLowerCase() === journal.Country.toLowerCase()
    )
    return countryData ? countryData.iso2.toLowerCase() : null
  }, [journal?.Country])


  const checkLoginAndRedirect = useCallback(
    (callback: () => void) => {
      if (isAuthInitializing) return
      if (!isLoggedIn) {
        localStorage.setItem('returnUrl', pathname)
        router.push('/auth/login')
      } else {
        callback()
      }
    },
    [isLoggedIn, isAuthInitializing, pathname, router]
  )

  useEffect(() => {
    if (isAuthInitializing || !isLoggedIn || !journal) {
      setIsFollowing(false)
      return
    }
    const checkFollowStatus = async () => {
      try {
        const followedJournals =
          await journalFollowService.getFollowedJournals()
        setIsFollowing(followedJournals.some(fj => fj.journalId === journal.id))
      } catch (error) {
        console.error('Error checking follow status:', error)
        setIsFollowing(false)
      }
    }
    checkFollowStatus()
  }, [journal, isLoggedIn, isAuthInitializing])

  const handleFollowToggle = async () => {
    if (isLoading || !journal) return
    setIsLoading(true)
    try {
      if (isFollowing) {
        await journalFollowService.unfollowJournal(journal.id)
        // toast.success(t('JournalCard.unfollowSuccess'))
      } else {
        await journalFollowService.followJournal(journal.id)
        // toast.success(t('JournalCard.followSuccess'))
      }
      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error('Error toggling follow status:', error)
      toast.error(t('JournalCard.followError'))
    } finally {
      setIsLoading(false)
    }
  }

  if (!journal) {
    return (
      <div className='container mx-auto flex h-64 items-center justify-center rounded-lg bg-card px-4 py-2 text-card-foreground'>
        <h2 className='text-2xl font-semibold'>{t('Journal_not_found')}</h2>
      </div>
    )
  }

  // === Chuẩn bị dữ liệu để hiển thị (không thay đổi) ===
  const latestImpactFactor =
    journal.bioxbio && journal.bioxbio.length > 0
      ? journal.bioxbio[0].Impact_factor
      : 'N/A'
  const overalRanking = journal['Rank']
  const hIndex = journal['H index']
  const sjr = journal.SJR

  return (
    <div className='container mx-auto rounded-xl bg-card p-6 text-card-foreground shadow-lg md:p-8'>
      <div className='flex flex-col gap-8 md:flex-row'>
        {/* === CỘT TRÁI - THÔNG TIN TỔNG QUAN & CHỈ SỐ === */}
        <div className='flex-1 md:w-3/5'>
          {/* Header với Title và nút Follow */}
          <div className='mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
            <h1 className='text-3xl font-bold text-foreground md:text-4xl'>
              {journal.title}
            </h1>
            <Button
              variant={isFollowing ? 'secondary' : 'primary'}
              onClick={() => checkLoginAndRedirect(handleFollowToggle)}
              disabled={isLoading}
              className='flex-shrink-0'
            >
              {isLoading ? (
                <span className='flex items-center justify-center gap-1.5'>
                  <Loader2 size={16} className='animate-spin' />
                  {t('JournalCard.loadingButton')}
                </span>
              ) : (
                <span className='flex items-center justify-center gap-1.5'>
                  <Heart
                    size={16}
                    className={isFollowing ? 'fill-red-500 text-red-500' : ''}
                  />
                  {isFollowing
                    ? t('JournalCard.unfollowButton')
                    : t('JournalCard.followButton')}
                </span>
              )}
            </Button>
          </div>

          {/* === HIỂN THỊ THỜI GIAN CẬP NHẬT Ở ĐÂY === */}
          {lastUpdatedText && (
            <div className='mb-4 flex items-center gap-1.5 text-xs text-muted-foreground'>
              <History size={14} />
              <span>{t('JournalReport.lastUpdated', { time: lastUpdatedText })}</span>
            </div>
          )}


          <p className='mb-6 text-muted-foreground'>
            {t('JournalReport.description')}
          </p>

          {/* Khối thông tin chính với Ảnh bìa và các chỉ số */}
          <div className='flex flex-col gap-6 md:flex-row'>
            {/* Ảnh bìa */}
            <div className='mx-auto w-48 flex-shrink-0 md:mx-0'>
              <img
                src={journal.Image || '/bg-2.jpg'}
                alt={journal.Title}
                className='h-auto w-full rounded-lg object-cover shadow-md aspect-[3/4]'
              />
            </div>

            {/* Lưới các chỉ số và nút */}
            <div className='flex flex-1 flex-col'>
              <div className='grid grid-cols-2 gap-4'>
                <MetricCard icon={Award} label='Overall Rank' value={overalRanking} />
                <MetricCard icon={TrendingUp} label='Impact Factor' value={latestImpactFactor} />
                <MetricCard icon={BookUser} label='H-index' value={hIndex} />
                <MetricCard icon={BarChart3} label='SJR' value={sjr} />
              </div>

              {/* === BƯỚC 2: CẬP NHẬT KHỐI NÚT HÀNH ĐỘNG === */}
              <div className='mt-6 flex flex-wrap justify-center gap-3'>
                {/* Nút chính: Website */}
                <Button
                  variant='primary'
                  className='flex-grow sm:flex-grow-0'
                >
                  <a href={journal.Information?.Homepage || '#'} target='_blank' rel='noopener noreferrer' className='flex items-center justify-center'>
                    <ExternalLink className='mr-2 h-4 w-4' />
                    <span>{t('JournalReport.websiteButton')}</span>
                  </a>
                </Button>
                {/* Nút phụ: Hướng dẫn xuất bản */}
                {journal.Information?.['How to publish in this journal'] && (
                  <Button variant='secondary' className='flex-grow sm:flex-grow-0'>
                    <a href={journal.Information['How to publish in this journal']} target='_blank' rel='noopener noreferrer' className='flex items-center justify-center'>
                      <Send className='mr-2 h-4 w-4' />
                      <span>{t('JournalReport.howToPublishButton')}</span>
                    </a>
                  </Button>
                )}
                {/* Nút phụ: Liên hệ */}
                {journal.Information?.Mail && (
                  <Button variant='secondary' className='flex-grow sm:flex-grow-0'>
                    <a href={`mailto:${journal.Information.Mail}`} className='flex items-center justify-center'>
                      <Mail className='mr-2 h-4 w-4' />
                      <span>{t('JournalReport.contactButton')}</span>
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* === CỘT PHẢI - THÔNG TIN CHI TIẾT (ĐÃ CẬP NHẬT) === */}
        <div className='rounded-xl border bg-background p-6 shadow-sm md:w-2/5'>
          <h3 className='mb-4 text-xl font-bold'>
            {t('JournalReport.detailsTitle')}
          </h3>
          <div className='flex flex-col'>
            <InfoRow icon={Info} label={t('JournalReport.titleLabel')} value={journal.Title} />
            <InfoRow icon={Shapes} label={t('JournalReport.areasLabel')} value={journal.Areas} />
            <InfoRow icon={Building} label={t('JournalReport.publisherLabel')} value={journal.Publisher} />

            {/* === ĐÂY LÀ PHẦN THAY ĐỔI CHÍNH === */}
            <InfoRow
              icon={Globe}
              label={t('JournalReport.countryLabel')}
              value={
                <div className="flex items-center justify-end gap-2">
                  {/* Hiển thị cờ nếu có */}
                  {countryIso2 && (
                    <Image
                      src={`/country_flags/${countryIso2}.svg`}
                      alt={journal.Country}
                      width={20}
                      height={15}
                      className="rounded-sm"
                    />
                  )}
                  {/* Luôn hiển thị tên quốc gia */}
                  <span>{journal.Country}</span>
                </div>
              }
            />

            <InfoRow icon={MapPin} label={t('JournalReport.regionLabel')} value={journal.Region} />
            <InfoRow icon={Barcode} label={t('JournalReport.issnLabel')} value={journal.ISSN} />
            <InfoRow icon={ShieldCheck} label={t('JournalReport.quartileLabel')} value={journal['SJR Best Quartile'] || 'N/A'} />
            <InfoRow icon={CalendarClock} label={t('JournalReport.coverageLabel')} value={journal.Coverage || 'N/A'} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default JournalReport