// src/app/[locale]/conference/detail/FollowerAvatars.tsx
import React from 'react'
import { useTranslations } from 'next-intl'

// Cập nhật interface Follower để phù hợp với cấu trúc data mới
interface Follower {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    avatar?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  };
}

interface FollowerAvatarsProps {
  followBy: Follower[] | undefined | null;
}

const FollowerAvatars: React.FC<FollowerAvatarsProps> = ({ followBy }) => {
  const t = useTranslations('');

  if (!followBy || followBy.length === 0) {
    return <p className='text-sm'>{t('No_followers_yet')}</p>;
  }

  const maxVisibleFollowers = 5;
  const visibleFollowers = followBy.slice(0, maxVisibleFollowers);
  const remainingFollowers = followBy.length - maxVisibleFollowers;

  // console.log('Visible Followers:', visibleFollowers); // Có thể bỏ dòng này nếu không cần debug

  return (
    <div className='flex items-center -space-x-1'>
      {visibleFollowers.map(follower => {
        const fullName = `${follower.user.firstName || ''} ${follower.user.lastName || ''}`.trim();
        const avatarSrc = follower.user.avatar || '/avatar1.jpg'; // Default avatar

        return (
          <img
            key={follower.id} // Sử dụng follower.id là duy nhất cho key
            src={avatarSrc}
            alt={fullName || 'User Avatar'} // Alt text hữu ích cho SEO và accessibility
            width={32}
            height={32}
            className='h-8 w-8 rounded-full border-2 border-white object-cover' // Thêm object-cover để ảnh không bị bóp méo
            title={fullName || t('Anonymous_User')} // Hiển thị tên khi hover, dùng t() nếu có bản dịch cho "Anonymous_User"
          />
        );
      })}
      {remainingFollowers > 0 && (
        <span className='z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-20 text-xs font-medium dark:bg-gray-800'>
          +{remainingFollowers}
        </span>
      )}
    </div>
  );
};

export default FollowerAvatars;