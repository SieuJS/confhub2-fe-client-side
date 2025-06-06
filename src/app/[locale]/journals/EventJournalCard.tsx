// EventJournalCard.tsx
'use client' // This is required for useTranslations in Client Components

import React, { useState, useEffect } from 'react'
import Image from 'next/image' // Keep Image if you use next/image for optimization
import { JournalResponseData } from '../../../models/response/journal.response' // Import your JournalResponse type
import Button from '../utils/Button'
import { Link } from '@/src/navigation' // Use next-intl's Link for locale-aware navigation
import { useTranslations } from 'next-intl' // Import the hook
import { journalFollowService } from '@/src/services/journal-follow.service'
import { toast } from 'react-toastify'

interface EventJournalCardProps {
  journal: JournalResponseData // Sử dụng JournalResponse type
}

const EventJournalCard: React.FC<EventJournalCardProps> = ({ journal }) => {
  // Initialize the translation function with a namespace
  const t = useTranslations('JournalCard')
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const followedJournals = await journalFollowService.getFollowedJournals()
        setIsFollowing(followedJournals.some(fj => fj.journalId === journal.id))
      } catch (error) {
        console.error('Error checking follow status:', error)
      }
    }
    checkFollowStatus()
  }, [journal.id])

  const handleFollowToggle = async () => {
    if (isLoading) return
    setIsLoading(true)
    try {
      if (isFollowing) {
        await journalFollowService.unfollowJournal(journal.id)
        toast.success('Successfully unfollowed journal')
      } else {
        await journalFollowService.followJournal(journal.id)
        toast.success('Successfully followed journal')
      }
      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error('Error toggling follow status:', error)
      toast.error('Failed to update follow status')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='relative flex flex-row-reverse overflow-hidden rounded-lg bg-gradient-to-r from-background to-background-secondary shadow-md'>
      {' '}
      {/* Horizontal flex container và đảo ngược hướng, Thêm relative */}
      <div className=' relative flex w-2/3  flex-col px-2 py-4'>
        {' '}
        {/* Content container, chiếm 2/3 chiều rộng */}
        <h3 className='mb-1 text-left text-lg font-semibold'>
          {journal.Title}
        </h3>{' '}
        {/* Use journal.Title */}
        {journal.ISSN && (
          // Use translation key for "ISSN:"
          <p className='text-left text-sm'>
            {t('issnLabel')}: {journal.ISSN}
          </p>
        )}
      </div>
      {/* Image container, chiếm 1/3 chiều rộng */}
      {/* Consider using next/image if the images are static or known sizes for optimization */}
      {/* <div className="flex h-52 w-40 relative">
      <Image
        src={journal.Image || '/default-journal.jpg'} // Use default image path directly
        alt={journal.Title || t('defaultJournalAltText')} // Internationalize default alt text if image is missing
        layout="fill" // Use layout="fill" with parent relative
        objectFit="cover"
        className="rounded-lg"
      />
    </div> */}
      <div className='relative flex h-52 w-40'>
        {' '}
        {/* Image container, chiếm 1/3 chiều rộng */}
        <img
          src={journal.Image || '/bg-2.jpg'}
          alt={journal.Title || t('defaultJournalAltText')} // Internationalize default alt text if image is missing
          style={{
            objectFit: 'cover',
            position: 'absolute',
            width: '100%',
            height: '100%'
          }}
          className='rounded-lg'
        />
      </div>
      <div className='absolute bottom-4 right-4 flex space-x-2'>
        {' '}
        {/* Position buttons, add space between */}
        {/* Details Button (wrapped in Link) */}
        <Button variant='primary' size='small' rounded className='px-3 py-1'>
          <Link
            href={{ pathname: '/journals/detail', query: { id: journal.Sourceid } }}
          >
            {t('detailsButton')} {/* Use translation key */}
          </Link>
        </Button>
        <Button
          variant={isFollowing ? 'secondary' : 'primary'}
          size='small'
          rounded
          className='px-3 py-1'
          onClick={handleFollowToggle}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
        </Button>
      </div>
    </div>
  )
}

export default EventJournalCard
