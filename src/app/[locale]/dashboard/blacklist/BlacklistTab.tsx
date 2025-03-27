// BlacklistTab.tsx
import React, { useState, useEffect, useCallback } from 'react'
import ConferenceItem from '../../conferences/ConferenceItem'
import { getListConferenceFromJSON } from '../../../../app/api/conference/getListConferences'
import { ConferenceInfo } from '../../../../models/response/conference.list.response'
import {
  UserResponse,
  Blacklist
} from '../../../../models/response/user.response'
import { timeAgo, formatDateFull } from '../timeFormat'
import Tooltip from '../../utils/Tooltip'
import { useTranslations } from 'next-intl'

interface BlacklistTabProps {}

const API_GET_USER_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user`

const BlacklistTab: React.FC<BlacklistTabProps> = () => {
  const t = useTranslations('')
  const language = t('language')

  // State for blacklisted conferences
  const [blacklistedConferences, setBlacklistedConferences] = useState<
    (ConferenceInfo & { blacklistedAt?: string })[] // Added blacklistedAt property
  >([])
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const userData = localStorage.getItem('user')

      if (!userData) {
        setLoggedIn(false)
        if (initialLoad) {
          setLoading(false)
          setInitialLoad(false)
        }
        return
      }

      const user = JSON.parse(userData)
      setLoggedIn(true)

      const userResponse = await fetch(`${API_GET_USER_ENDPOINT}/${user.id}`)

      if (!userResponse.ok) {
        throw new Error(`HTTP error! status: ${userResponse.status}`)
      }

      const userDetails: UserResponse = await userResponse.json()

      // Check for blacklist
      if ((userDetails.blacklist ?? []).length > 0) {
        const conferencesData = await getListConferenceFromJSON()

        // Filter and map based on blacklist
        const blacklisted = conferencesData.payload
          .filter((conf: ConferenceInfo) => conf.id !== null)
          .filter((conf: ConferenceInfo) =>
            (userDetails.blacklist ?? []).some(
              (blacklistedConf: Blacklist) => blacklistedConf.id === conf.id
            )
          )
          .map((conf: ConferenceInfo) => {
            const blacklistConfInfo: Blacklist | undefined =
              userDetails.blacklist?.find((bc: Blacklist) => bc.id === conf.id)
            return {
              ...conf,
              blacklistedAt: blacklistConfInfo?.blacklistedAt // Store the blacklist timestamp
            }
          })
        setBlacklistedConferences(blacklisted) // Update state with blacklisted conferences
      } else {
        setBlacklistedConferences([]) // Set to empty if none are blacklisted
      }
    } catch (error) {
      console.error('Failed to fetch blacklist data:', error) // Updated error message
    } finally {
      if (initialLoad) {
        setLoading(false)
        setInitialLoad(false)
      }
    }
  }, [initialLoad])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Update loading state based on blacklistedConferences after initial load
  useEffect(() => {
    if (!initialLoad) {
      setLoading(false)
    }
  }, [blacklistedConferences, initialLoad])

  if (!loggedIn) {
    if (loading) {
      return <div className='container mx-auto p-4'>{t('Loading')}</div>
    }
    return (
      <div className='container mx-auto p-4'>
        {t('Please_log_in_to_view_blacklisted_conferences')}{' '}
        {/* Updated message */}
      </div>
    )
  }

  if (loading) {
    return <div className='container mx-auto p-4'>{t('Loading')}</div>
  }

  // Transform blacklisted conferences data for rendering
  const transformedConferences = blacklistedConferences.map(conf => {
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
      blacklistedAt: conf.blacklistedAt, // Use blacklistedAt timestamp
      status: conf.status // Keep status if needed
    }
  })
  // console.log('transformed Blacklisted Conferences:', transformedConferences); // Optional logging

  return (
    <div className='container mx-auto p-4'>
      <div className='mb-2 flex items-center justify-between'>
        {/* Updated Title */}
        <h1 className='text-2xl font-semibold'>
          {t('Blacklisted_Conferences')}
        </h1>
        <button
          onClick={() => {
            console.log('Refresh button clicked for Blacklist') // Updated log
            setLoading(true) // Optionally show loading spinner on refresh
            fetchData()
          }}
          className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400'
          aria-label='Refresh Blacklist' // Updated aria-label
        >
          {/* Refresh Icon */}
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

      {/* Check blacklistedConferences length */}
      {blacklistedConferences.length === 0 ? (
        // Updated empty state message
        <p>{t('You_have_not_blacklisted_any_conferences_yet')}</p>
      ) : (
        transformedConferences.map(conference => {
          // console.log('Rendering Blacklisted ConferenceItem:', conference); // Optional logging
          return (
            <div
              className='mb-4 rounded-xl border-2 px-4 py-2 shadow-xl'
              key={conference.id}
            >
              <div className='flex'>
                {/* Updated Label */}
                <span className='mr-1'>{t('Blacklisted_Time')}: </span>
                {/* Use blacklistedAt timestamp */}
                <Tooltip
                  text={formatDateFull(conference.blacklistedAt, language)}
                >
                  <span>{timeAgo(conference.blacklistedAt, language)}</span>
                </Tooltip>
              </div>
              <ConferenceItem
                key={conference.id} // Key moved to wrapper div is better practice, but keeping consistent with original
                conference={{
                  id: conference.id,
                  title: conference.title,
                  acronym: conference.acronym,
                  location: conference.location,
                  fromDate: conference.fromDate,
                  toDate: conference.toDate
                  // No need to pass blacklistedAt to ConferenceItem unless it uses it
                }}
              />
            </div>
          )
        })
      )}
    </div>
  )
}

export default BlacklistTab
