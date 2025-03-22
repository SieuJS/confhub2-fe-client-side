
// components/Header/components/NotificationIcon.tsx (Added relative positioning)
import { FC } from 'react';

interface NotificationIconProps {
  notificationEffect: boolean;
  unreadCount: number; // New prop for unread count
}

export const NotificationIcon: FC<NotificationIconProps> = ({ notificationEffect, unreadCount }) => (
  <div className="relative"> {/* Add relative positioning */}
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-button ${notificationEffect ? 'animate-bounce text-yellow-500' : ''}`}><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M22 8c0-2.3-.8-4.3-2-6"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/><path d="M4 2C2.8 3.7 2 5.7 2 8"/></svg>
    {unreadCount > 0 && (
      <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5">
        {unreadCount}
      </span>
    )}
  </div>
);

// Other icon components (No changes needed)
export const MenuIcon: FC = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className='lucide lucide-menu'
  >
    <line x1='3' x2='21' y1='12' y2='12' />
    <line x1='3' x2='21' y1='6' y2='6' />
    <line x1='3' x2='21' y1='18' y2='18' />
  </svg>
);

export const CloseIcon: FC = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className='text-foreground h-8 w-8'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M6 18L18 6M6 6l12 12'
    />
  </svg>
);

export const UserIcon: FC = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className='lucide lucide-user-check'
  >
    <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
    <circle cx='9' cy='7' r='4' />
    <polyline points='16 11 18 13 22 9' />
  </svg>
);

