// components/Header/components/NotificationIcon.tsx
import { FC } from 'react';
interface NotificationIconProps {
  notificationEffect: boolean;
}

export const NotificationIcon: FC<NotificationIconProps> = ({ notificationEffect }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    fill='currentColor'
    className={`size-9 text-button ${notificationEffect ? 'animate-bounce text-yellow-500' : ''}`}
  >
    <path
      fillRule='evenodd'
      d='M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z'
      clipRule='evenodd'
    />
  </svg>
);

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

