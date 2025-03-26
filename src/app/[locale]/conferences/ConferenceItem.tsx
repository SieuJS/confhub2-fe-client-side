// components/conferences/ConferenceItem.tsx

import React from 'react'
import Image from 'next/image'
import Button from '../utils/Button'
import { Link } from '@/src/navigation'
import { useMediaQuery } from 'react-responsive'

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
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const sizeButton = isMobile ? 'small' : 'medium'
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
      <div className='relative col-span-1 flex  items-center justify-center '>
        <Image
          src={'/bg-2.jpg'}
          alt={conference.title}
          width={500}
          height={300}
          className='rounded-md object-cover'
        />
      </div>
      <div className='col-span-6 text-left text-sm md:text-base'>
        <h3 className='text-sm font-semibold text-button md:text-lg'>
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
              size={sizeButton}
              rounded
              className='mr-2'
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
            <Button variant='secondary' size={sizeButton} rounded className=''>
              Edit
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}

export default ConferenceItem
