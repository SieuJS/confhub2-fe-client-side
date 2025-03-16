// MyConferencesTab.tsx
import React, { useState, useEffect } from 'react'
import ConferenceItem from '../conferences/ConferenceItem'
import Button from '../utils/Button'
import { Link } from '@/src/navigation'
import { ConferenceResponse } from '../../../models/response/conference.response'
import ConferencesData from '../../../models/data/conferences-list.json'

// Define ConferenceInfo *inside* MyConferencesTab.tsx
interface ConferenceInfo {
  id: string
  title: string
  acronym: string
  location: string
  fromDate?: string
  toDate?: string
  summary?: string
  websiteUrl?: string
  year?: number
  status?: ConferenceStatus // Add a status property
}

// Enum for conference status
enum ConferenceStatus {
  Active = 'active',
  Pending = 'pending',
  Cancelled = 'cancelled'
}

const MyConferencesTab: React.FC = () => {
  const [localConferences, setLocalConferences] = useState<ConferenceInfo[]>([])
  const [displayStatus, setDisplayStatus] = useState<ConferenceStatus>(
    ConferenceStatus.Active
  ) // State to control which list is displayed

  useEffect(() => {
    // Simulate fetching and transforming data, including setting a status.  In a real app,
    // this would come from your API and likely already have a status field.
    const transformedConferences = (ConferencesData as ConferenceResponse[])
      .slice(0, 6) // Take more for variety of statuses
      .map((confRes, index): ConferenceInfo => {
        let status: ConferenceStatus
        if (index < 2) {
          status = ConferenceStatus.Active
        } else if (index < 4) {
          status = ConferenceStatus.Pending
        } else {
          status = ConferenceStatus.Cancelled
        }

        return {
          id: confRes.conference.id,
          title: confRes.conference.title,
          acronym: confRes.conference.acronym,
          location: `${confRes.locations.cityStateProvince}, ${confRes.locations.country}`,
          year: confRes.organization.year,
          summary: confRes.organization.summary,
          fromDate:
            confRes.dates.length > 0 ? confRes.dates[0].fromDate : undefined,
          toDate:
            confRes.dates.length > 0 ? confRes.dates[0].toDate : undefined,
          websiteUrl: confRes.organization.link,
          status: status // Assign the status
        }
      })
    setLocalConferences(transformedConferences)
  }, [])

  // Filter conferences based on the selected status
  const filteredConferences = localConferences.filter(
    conference => conference.status === displayStatus
  )

  const getStatusTitle = (status: ConferenceStatus) => {
    switch (status) {
      case ConferenceStatus.Active:
        return 'My Conferences'
      case ConferenceStatus.Pending:
        return 'My Conferences are pending'
      case ConferenceStatus.Cancelled:
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
            displayStatus === ConferenceStatus.Active ? 'primary' : 'secondary'
          }
          size='small'
          onClick={() => setDisplayStatus(ConferenceStatus.Active)}
        >
          Active
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
            displayStatus === ConferenceStatus.Cancelled
              ? 'primary'
              : 'secondary'
          }
          size='small'
          onClick={() => setDisplayStatus(ConferenceStatus.Cancelled)}
        >
          Cancelled
        </Button>
      </div>

      {/* Display the selected list */}
      <h1 className='my-2 text-2xl font-semibold'>
        {getStatusTitle(displayStatus)}
      </h1>
      {filteredConferences.length === 0 ? (
        <p className='text-gray-500'>
          You do not have any conferences in this category yet.
        </p>
      ) : (
        filteredConferences.map(conference => (
          <ConferenceItem key={conference.id} conference={conference} />
        ))
      )}
    </div>
  )
}

export default MyConferencesTab
