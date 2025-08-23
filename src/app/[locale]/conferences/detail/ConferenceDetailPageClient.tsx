// src/app/[locale]/conferences/detail/ConferenceDetailPageClient.tsx

'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/src/contexts/AuthContext'
import { ConferenceResponse } from '@/src/models/response/conference.response'

// Import hooks (đã loại bỏ useSequentialConferenceData)
import useFollowConference from '@/src/hooks/conferenceDetails/useFollowConference'
import useShareConference from '@/src/hooks/conferenceDetails/useShareConference'
import useTopicsDisplay from '@/src/hooks/conferenceDetails/useTopicsDisplay'
import useFormatConferenceDates from '@/src/hooks/conferenceDetails/useFormatConferenceDates'
import useAddToCalendar from '@/src/hooks/conferenceDetails/useAddToCalendar'
import useUpdateConference from '@/src/hooks/conferenceDetails/useUpdateConference'
import useBlacklistConference from '@/src/hooks/conferenceDetails/useBlacklistConference'

// Import components
import ConferenceHeader from './ConferenceHeader'
import ConferenceTopics from './ConferenceTopics'
import ConferenceActionButtons from './ConferenceActionButtons'
import { ConferenceTabs } from './ConferenceTabs'
import ConferenceFeedback from './ConferenceFeedback'
import Loading from '../../utils/Loading'

// Import utility functions
import { transformDates, calculateOverallRating } from './utils/conferenceUtils'
import { notification } from '@/src/utils/toast/notification'

interface ConferenceDetailPageClientProps {
    locale: string;
    initialData: ConferenceResponse; // Nhận dữ liệu từ Server Component
}

export default function ConferenceDetailPageClient({ locale, initialData }: ConferenceDetailPageClientProps) {
    const t = useTranslations('ConferenceDetail')
    const router = useRouter()
    const pathname = usePathname()
    const { isLoggedIn, isInitializing: isAuthInitializing } = useAuth()

    // Dữ liệu chính đã có sẵn từ server, không cần fetch lại!
    const conferenceDataFromDB = initialData;

    // Các hook phía client vẫn hoạt động bình thường, nhận dữ liệu từ prop
    const lastOrganization = conferenceDataFromDB?.organizations?.[0]
    const firstRankData = conferenceDataFromDB?.ranks?.[0]
    const transformedDatesData = transformDates(lastOrganization?.conferenceDates)

    // Các hook này sẽ chạy ngầm sau khi trang đã hiển thị để lấy trạng thái của người dùng
    const { isFollowing, handleFollowClick, loading: followLoading, error: followError } = useFollowConference(conferenceDataFromDB)
    const { isAddToCalendar, handleAddToCalendar, loading: calendarLoading, error: calendarError } = useAddToCalendar(conferenceDataFromDB)
    const { isBlacklisted, handleBlacklistClick, loading: blacklistLoading, error: blacklistError } = useBlacklistConference(conferenceDataFromDB)

    // Các hook tiện ích khác
    const language = useTranslations('')('language')
    const { isUpdating, updateResult, updateConference } = useUpdateConference()
    const { handleShareClick } = useShareConference(conferenceDataFromDB)
    const { displayedTopics, hasMoreTopics, showAllTopics, setShowAllTopics } = useTopicsDisplay(lastOrganization?.topics || [])
    const { dateDisplay } = useFormatConferenceDates(transformedDatesData, language)

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || 'null');
        if (userData) {
            const t = fetch('/apis/logs/user-conference', {
                method: 'POST',
                body: JSON.stringify({
                    userId: userData.id,
                    trustCredit: userData.trustCredit || 0,
                    action: 'view detail',
                    conferenceId: conferenceDataFromDB.id
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('Log interaction response:', t);
        }
    }, []);

    const checkLoginAndRedirect = useCallback(
        (callback: () => void) => {
            if (isAuthInitializing) {
                return
            }
            if (!isLoggedIn) {
                const currentPath = pathname + `?id=${conferenceDataFromDB.id}`
                localStorage.setItem('returnUrl', currentPath)
                router.push(`/${locale}/auth/login`)
            } else {
                callback()
            }
        },
        [isLoggedIn, isAuthInitializing, pathname, router, locale, conferenceDataFromDB.id]
    )

    // Xử lý thông báo khi cập nhật conference
    useEffect(() => {
        if (updateResult) {
            if (updateResult.success) {
                notification.success(updateResult.message || t('updateSuccess'));
            } else {
                notification.error(updateResult.error || t('updateError'));
            }
        }
    }, [updateResult, t])

    // Gom các useEffect xử lý lỗi vào một chỗ
    useEffect(() => {
        const errorMessage = followError || calendarError || blacklistError;
        if (errorMessage) {
            if (errorMessage === 'User is banned') {
                notification.error(t('userBannedError'));
            } else {
                notification.error(errorMessage);
            }
        }
    }, [followError, calendarError, blacklistError, t]);


    // Tính toán các giá trị hiển thị
    const displayOrganization = lastOrganization ?? conferenceDataFromDB?.organizations?.[0]
    const overallRating = calculateOverallRating(conferenceDataFromDB?.feedbacks)
    const totalReviews = conferenceDataFromDB?.feedbacks?.length || 0

    return (
        <div className='flex min-h-screen flex-col'>
            <main className='container mx-auto flex-grow px-0 py-6 md:px-4'>
                {isUpdating && (
                    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
                        <Loading />
                    </div>
                )}

                <div className='rounded-lg bg-white-pure p-2 shadow-md md:p-4'>
                    <div className='flex flex-col gap-4 md:flex-row'>
                        <div className='md:w-4/5'>
                            <ConferenceHeader
                                conferenceData={conferenceDataFromDB}
                                lastOrganization={lastOrganization}
                                firstRankData={firstRankData}
                                dateDisplay={dateDisplay}
                                overallRating={overallRating}
                                totalReviews={totalReviews}
                            />
                            <ConferenceTopics
                                displayedTopics={displayedTopics}
                                hasMoreTopics={hasMoreTopics}
                                showAllTopics={showAllTopics}
                                setShowAllTopics={setShowAllTopics}
                            />
                        </div>

                        <div className='md:w-1/5'>
                            <ConferenceActionButtons
                                conferenceId={conferenceDataFromDB.id}
                                displayOrganization={displayOrganization}
                                isAddToCalendar={isAddToCalendar}
                                handleAddToCalendar={handleAddToCalendar}
                                calendarLoading={calendarLoading}
                                handleShareClick={handleShareClick}
                                isFollowing={isFollowing}
                                handleFollowClick={handleFollowClick}
                                followLoading={followLoading}
                                isUpdating={isUpdating}
                                updateConference={updateConference}
                                isBlacklisted={isBlacklisted}
                                handleBlacklistClick={handleBlacklistClick}
                                blacklistLoading={blacklistLoading}
                                checkLoginAndRedirect={checkLoginAndRedirect}
                                isAuthInitializing={isAuthInitializing} // <-- TRUYỀN PROP MỚI

                            />
                        </div>
                    </div>
                    <div className='mt-6 border-t pt-6 md:mt-4 md:pt-4'>
                        <ConferenceTabs conference={conferenceDataFromDB} />
                    </div>
                </div>

                <div className='mt-8 rounded-lg bg-white-pure p-4 shadow-md md:p-6'>
                    <ConferenceFeedback conferenceData={conferenceDataFromDB} />
                </div>
            </main>
        </div>
    )
}