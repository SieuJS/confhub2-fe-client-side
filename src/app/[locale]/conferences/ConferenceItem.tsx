// components/conferences/ConferenceItem.tsx

import React from 'react'
import Image from 'next/image'
import Button from '../utils/Button'
import { Link } from '@/src/navigation'

interface ConferenceItemProps {
  conference: {
    id: string
    title: string
    acronym: string
    location: string
    fromDate?: string
    toDate?: string
    followedAt?: string
    status?: string
  }
}

const ConferenceItem: React.FC<ConferenceItemProps> = ({ conference }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const showDetailButton = !(
    conference.status === 'Pending' || conference.status === 'Rejected'
  )
  const showEditButton =
    conference.status === 'Pending' || conference.status === 'Approved'

  return (
    <div className='mb-4 grid grid-cols-9 gap-4 rounded-md bg-background p-4 shadow-md'>
      <div className='relative col-span-1 flex items-center justify-center'>
        <Image
          src={'/bg-2.jpg'}
          alt={conference.title}
          width={500}
          height={300}
          className='rounded-md object-cover'
        />
      </div>
      <div className='col-span-6 text-left'>
        <h3 className='text-lg font-semibold text-button'>
          {conference.title} ({conference.acronym})
        </h3>
        <p>
          <strong>Dates:</strong>{' '}
          {conference.fromDate
            ? formatDate(conference.fromDate) +
              ' - ' +
              formatDate(conference.toDate)
            : 'Dates not available'}
        </p>
        <p>
          <strong>Location:</strong> {conference.location}
        </p>
      </div>
      <div className='col-span-2 flex items-center justify-center'>
        {/* Show Detail button based on showDetailButton */}
        {showDetailButton && (
          <Link
            href={{
              pathname: '/conferences/detail',
              query: { id: conference.id }
            }}
          >
            <Button
              variant='primary'
              size='medium'
              rounded
              className='mr-2 w-24'
            >
              Details
            </Button>
          </Link>
        )}

        {/* Show Edit button based on showEditButton */}
        {showEditButton && (
          <Link
            href={{
              pathname: '/updateconference',
              query: { id: conference.id }
            }}
          >
            <Button variant='secondary' size='medium' rounded className='w-24'>
              Edit
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}

export default ConferenceItem
