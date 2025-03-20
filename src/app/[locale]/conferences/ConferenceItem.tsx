// components/conferences/ConferenceItem.tsx
import React, { useState } from 'react'
import Image from 'next/image'
import Button from '../utils/Button'
import { Link } from '@/src/navigation'

// Define the *exact* data ConferenceItem needs.  This is the key change.
interface ConferenceItemProps {
  conference: {
    id: string
    title: string
    acronym: string
    location: string
    fromDate?: string
    toDate?: string
    followedAt?: string // Thêm followedAt vào đây
    status?: string // Thêm status vào đây
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

  return (
    <div className='mb-4 grid grid-cols-9 gap-4 rounded-md bg-background p-4 shadow-md'>
      <div className='relative col-span-1 flex items-center justify-center'>
        <Image
          src={'/bg-2.jpg'}
          alt={conference.title}
          width={500} //  Ví dụ: Chiều rộng mong muốn (px)
          height={300} // Ví dụ: Chiều cao tương ứng (px)
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
        {conference.status !== 'Pending' &&
          conference.status !== 'Rejected' && (
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
      </div>
    </div>
  )
}

export default ConferenceItem
