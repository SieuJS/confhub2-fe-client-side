// frontend/MyConferencesTab.tsx
import React, { useState, useMemo } from 'react'
import ConferenceItem from '../conferences/ConferenceItem'
import Button from '../utils/Button'
import { Link } from '@/src/navigation'
import useMyConferences from '../../../hooks/dashboard/myConferences/useMyConferences'
import { formatDateFull, timeAgo } from './timeFormat'
import Tooltip from '../utils/Tooltip'

// Enum for conference status
enum ConferenceStatus {
  Approve = 'Approved',
  Pending = 'Pending',
  Rejected = 'Rejected'
}

const MyConferencesTab: React.FC = () => {
  const [displayStatus, setDisplayStatus] = useState<ConferenceStatus>(
    ConferenceStatus.Approve
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
        location: `${conf.locations.cityStateProvince}, ${conf.locations.country}`,
        year: conf.organization.year,
        summary: conf.organization.summary,
        fromDate: conf.dates.find(d => d.type === 'Conference Date')?.fromDate,
        toDate: conf.dates.find(d => d.type === 'Conference Date')?.toDate,
        websiteUrl: conf.organization.link,
        status: conf.status as ConferenceStatus,
        createdAt: conf.conference.createdAt,
        
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
    return <div>Please log in to view your conferences.</div>
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  const getStatusTitle = (status: ConferenceStatus) => {
    switch (status) {
      case ConferenceStatus.Approve:
        return 'My Conferences'
      case ConferenceStatus.Pending:
        return 'My Conferences are Pending'
      case ConferenceStatus.Rejected:
        return 'My Conferences are cancel'
      default:
        return 'My Conferences'
    }
  }

  return (
    <div className='container mx-auto p-4'>
      <Link href={`/addconference`}>
        <Button variant='primary' size='medium' rounded className='w-fill mr-2'>
          Add Conference
        </Button>
      </Link>

      {/* Status Switching Buttons */}
      <div className='my-4 flex space-x-4'>
        <Button
          variant={
            displayStatus === ConferenceStatus.Approve ? 'primary' : 'secondary'
          }
          size='small'
          onClick={() => setDisplayStatus(ConferenceStatus.Approve)}
        >
          Approve
        </Button>
        <Button
          variant={
            displayStatus === ConferenceStatus.Pending ? 'primary' : 'secondary'
          }
          size='small'
          onClick={() => setDisplayStatus(ConferenceStatus.Pending)}
        >
          Pending
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
          Rejected
        </Button>
      </div>

      <h1 className='my-2 text-2xl font-semibold'>
        {getStatusTitle(displayStatus)}
      </h1>

      {filteredConferences.length === 0 ? (
        <p className=''>
          You do not have any conferences in this category yet.
        </p>
      ) : (
        filteredConferences.map(conference => (
          <div
            className='mb-4 rounded-xl border-2 px-4 py-2 shadow-xl'
            key={conference.id}
          >
            <div className='flex'>
              <span className='mr-1'>Created Time: </span>
              <Tooltip text={formatDateFull(conference.createdAt)}>
                <span>{timeAgo(conference.createdAt)}</span>
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
      <button onClick={refetch}>Refetch Data</button>
    </div>
  )
}

export default MyConferencesTab
