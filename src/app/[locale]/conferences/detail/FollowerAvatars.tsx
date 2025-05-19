// src/app/[locale]/conference/detail/FollowerAvatars.tsx
import React from 'react'
import { useTranslations } from 'next-intl'

interface Follower {
  id: string
  avatar?: string | null
  firstName?: string | null
  lastName?: string | null
}

interface FollowerAvatarsProps {
  followBy: Follower[] | undefined | null
}

const FollowerAvatars: React.FC<FollowerAvatarsProps> = ({ followBy }) => {
  const t = useTranslations('')

  if (!followBy || followBy.length === 0) {
    return <p className='text-sm'>{t('No_followers_yet')}</p>
  }

  const maxVisibleFollowers = 5
  const visibleFollowers = followBy.slice(0, maxVisibleFollowers)
  const remainingFollowers = followBy.length - maxVisibleFollowers

  console.log('Visible Followers:', visibleFollowers)

  return (
    <div className='flex items-center -space-x-1'>
      {visibleFollowers.map(follower => (
        <img
          key={follower.id}
          src={follower.avatar || '/avatar1.jpg'} // Default avatar
          alt={`${follower.firstName || ''} ${follower.lastName || ''}`}
          width={32}
          height={32}
          className='h-8 w-8 rounded-full border-2 border-white'
        />
      ))}
      {remainingFollowers > 0 && (
        <span className='z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-20 text-xs font-medium dark:bg-gray-800'>
          +{remainingFollowers}
        </span>
      )}
    </div>
  )
}

export default FollowerAvatars
