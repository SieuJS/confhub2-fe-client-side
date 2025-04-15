// FollowedTab.tsx
import React, { useState, useEffect, useCallback } from 'react'
import ConferenceItem from '../../conferences/ConferenceItem'
import { getListConferenceFromDB, getListConferenceFromJSON } from '../../../../app/api/conference/getListConferences'
import { ConferenceInfo } from '../../../../models/response/conference.list.response'
import { UserResponse, Follow } from '../../../../models/response/user.response'
import { timeAgo, formatDateFull } from '../timeFormat'
import Tooltip from '../../utils/Tooltip'
import { useTranslations } from 'next-intl'

interface FollowedTabProps { }

const API_GET_USER_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1`

const FollowedTab: React.FC<FollowedTabProps> = () => {
  const t = useTranslations('')
  const language = t('language')

  const [followedConferences, setFollowedConferences] = useState<
    (ConferenceInfo & { followedAt?: string })[]
  >([])
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true) // Add initial load state

  const fetchData = useCallback(async () => {
    try {


      const featchFollow = await fetch(`${API_GET_USER_ENDPOINT}/follow-conference/followed`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` // Add userId to the headers
        }
      })
      if (!featchFollow.ok) {
        throw new Error(`HTTP error! status: ${featchFollow.status}`)
      }
      const followed: any[] = await featchFollow.json()
      setFollowedConferences(followed)

    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      if (initialLoad) {
        setLoading(false) //set loading to false only one time
        setInitialLoad(false)
      }
    }
  }, [initialLoad]) // Include initialLoad in dependency array

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!initialLoad) {
      setLoading(false)
    }
  }, [followedConferences, initialLoad])

  if (!localStorage.getItem('token')) {
    if (loading) {
      return <div className='container mx-auto p-4'>{t('Loading')}</div> // Show loading initially
    }
    return (
      <div className='container mx-auto p-4'>
        {t('Please_log_in_to_view_followed_conferences')}
      </div>
    )
  }

  if (loading) {
    return <div className='container mx-auto p-4'>{t('Loading')}</div>
  }

  // Trong FollowedTab.tsx, trong transformedConferences
  const transformedConferences = followedConferences.map(conf => {
    // Truy cập trực tiếp phần tử đầu tiên của mảng dates
    const conferenceDates = conf.dates

    return {
      id: conf.id!,
      title: conf.title,
      acronym: conf.acronym,
      location: conf.location
        ? `${conf.location.cityStateProvince || ''}, ${conf.location.country || ''}`
        : '',
      fromDate: conferenceDates?.fromDate || undefined,
      toDate: conferenceDates?.toDate || undefined,
      followedAt: conf.followedAt,
      status: conf.status
    }
  })
  console.log('transformedConferences:', transformedConferences)

  return (
    <div className='container mx-auto p-2 md:p-4'>
      <div className='mb-2 flex items-center justify-between'>
        <h1 className='text-xl font-semibold md:text-2xl'>
          {t('Followed_Conferences')}
        </h1>
        <button
          onClick={() => {
            console.log('Refresh button clicked')
            fetchData()
          }}
          className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400'
          aria-label='Refresh'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='lucide lucide-refresh-cw'
          >
            <path d='M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.67 2.62' />
            <path d='M22 4v4h-4' />
          </svg>
        </button>
      </div>

      {followedConferences.length === 0 ? (
        <p>{t('You_are_not_following_any_conferences_yet')}</p>
      ) : (
        transformedConferences.map(conference => {
          console.log('Rendering ConferenceItem with conference:', conference)
          return (
            <div
              className='mb-4 rounded-xl md:border-2 md:px-4 md:py-2 md:shadow-xl'
              key={conference.id}
            >
              <div className='flex text-xs md:text-base'>
                <span className='mr-1 '>{t('Followed_Time')}: </span>
                <Tooltip text={formatDateFull(conference.followedAt, language)}>
                  <span>{timeAgo(conference.followedAt, language)}</span>
                </Tooltip>
              </div>
              <ConferenceItem
                key={conference.id}
                conference={{
                  id: conference.id,
                  title: conference.title,
                  acronym: conference.acronym,
                  location: conference.location,
                  fromDate: conference.fromDate,
                  toDate: conference.toDate
                }}
              />
            </div>
          )
        })
      )}
    </div>
  )
}

export default FollowedTab
