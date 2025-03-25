'use client'

// frontend/MyConferencesTab.tsx
import React, { useState, useMemo } from 'react'
import ConferenceItem from '../../conferences/ConferenceItem'
import Button from '../../utils/Button'
import { Link } from '@/src/navigation'
import useMyConferences from '../../../../hooks/dashboard/myConferences/useMyConferences'
import { formatDateFull, timeAgo } from '../timeFormat'
import Tooltip from '../../utils/Tooltip'
import { useTranslations } from 'next-intl'

// Enum for conference status
enum ConferenceStatus {
  Approve = 'Approved',
  Pending = 'Pending',
  Rejected = 'Rejected'
}

const MyConferencesTab: React.FC = () => {
  const t = useTranslations('')
  const languge = t('language')

  const [displayStatus, setDisplayStatus] = useState<ConferenceStatus>(
    ConferenceStatus.Pending
  )
  const userData = localStorage.getItem('user')
  const user = userData ? JSON.parse(userData) : null
  const { conferences, isLoading, error, refetch } = useMyConferences(
    user?.id || ''
  )

  // useMemo calls *must* be at the top level, before any conditional returns.
  const transformedConferences = useMemo(() => {
    if (!conferences) {
      return [] // Return an empty array if conferences is null/undefined
    }
    return conferences
      .map(conf => ({
        id: conf.conference.id,
        title: conf.conference.title,
        acronym: conf.conference.acronym,
        location: `${conf.location.cityStateProvince}, ${conf.location.country}`,
        year: conf.organization.year,
        summerize: conf.organization.summerize,
        fromDate: conf.dates.find(d => d.type === 'Conference Date')?.fromDate,
        toDate: conf.dates.find(d => d.type === 'Conference Date')?.toDate,
        websiteUrl: conf.organization.link,
        status: conf.status as ConferenceStatus,
        createdAt: conf.conference.createdAt
      }))
      .sort((a, b) => {
        if (!a.createdAt) return 1
        if (!b.createdAt) return -1
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [conferences])

  const filteredConferences = useMemo(() => {
    return transformedConferences.filter(
      conference => conference.status === displayStatus
    )
  }, [transformedConferences, displayStatus])

  if (!user) {
    return <div>{t('Please_log_in_to_view_your_conferences')}</div>
  }

  if (isLoading) {
    return <div>{t('Loading')}</div>
  }

  if (error) {
    return (
      <div>
        {t('Error')}: {error}
      </div>
    )
  }

  const getStatusTitle = (status: ConferenceStatus) => {
    switch (status) {
      case ConferenceStatus.Approve:
        return t('My_conferences_are_approved')
      case ConferenceStatus.Pending:
        return t('My_conferences_are_pending')
      case ConferenceStatus.Rejected:
        return t('My_conferences_are_rejected')
      default:
        return t('My_conferences_are_pending')
    }
  }

  return (
    <div className='container mx-auto p-4'>
      <Link href={`/addconference`}>
        <Button variant='primary' size='medium' rounded className='w-fill mr-2'>
          {t('Add_Conference')}
        </Button>
      </Link>

      {/* Status Switching Buttons */}
      <div className='my-4 flex space-x-4'>
        <Button
          variant={
            displayStatus === ConferenceStatus.Pending ? 'primary' : 'secondary'
          }
          size='small'
          onClick={() => setDisplayStatus(ConferenceStatus.Pending)}
        >
          {t('Pending')}
        </Button>

        <Button
          variant={
            displayStatus === ConferenceStatus.Approve ? 'primary' : 'secondary'
          }
          size='small'
          onClick={() => setDisplayStatus(ConferenceStatus.Approve)}
        >
          {t('Approved')}
        </Button>

        <Button
          variant={
            displayStatus === ConferenceStatus.Rejected
              ? 'primary'
              : 'secondary'
          }
          size='small'
          onClick={() => setDisplayStatus(ConferenceStatus.Rejected)}
        >
          {t('Rejected')}
        </Button>
      </div>

      <h1 className='my-2 text-2xl font-semibold'>
        {getStatusTitle(displayStatus)}
      </h1>

      {filteredConferences.length === 0 ? (
        <p className=''>{t('You_have_no_conference')}</p>
      ) : (
        filteredConferences.map(conference => (
          <div
            className='mb-4 rounded-xl border-2 px-4 py-2 shadow-xl'
            key={conference.id}
          >
            <div className='flex'>
              <span className='mr-1'>{t('Created_Time')}: </span>
              <Tooltip text={formatDateFull(conference.createdAt, languge)}>
                <span>{timeAgo(conference.createdAt, languge)}</span>
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
                toDate: conference.toDate,
                status: conference.status // Pass the status
              }}
            />
          </div>
        ))
      )}
      <button onClick={refetch}>{t('Refetch_Data')}</button>
    </div>
  )
}

export default MyConferencesTab
