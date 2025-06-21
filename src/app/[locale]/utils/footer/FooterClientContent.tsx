// src/app/[locale]/utils/Footer/FooterClientContent.tsx

'use client';

import React, { ComponentType, FC, useState } from 'react';
import Image from 'next/image';
import { Link, usePathname, useRouter } from '@/src/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import type { FooterLink, IconProps } from './types'; // Import kiểu dữ liệu

// --- Định nghĩa các props mà component này sẽ nhận ---
interface FooterClientContentProps {
  linkColumns: LinkColumnProps[];
  socialLinks: {
    href: string;
    label: string;
  }[];
  texts: {
    footerDescription: string;
    newsletterTitle: string;
    newsletterSubtitle: string;
    enterYourEmail: string;
    copyrights: string;
  };
}

// BƯỚC 1: Import các component icon cần thiết
import {
  ArrowRightIcon,
  BookOpenIcon,
  GlobeAltIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';


// --- Các component icon có thể giữ nguyên ở đây hoặc tách ra file riêng ---
const FacebookIcon: FC<IconProps> = ({ className }) => (
  <svg
    className={className}
    fill='currentColor'
    viewBox='0 0 24 24'
    aria-hidden='true'
  >
    <path
      fillRule='evenodd'
      d='M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z'
      clipRule='evenodd'
    />
  </svg>
)
const YoutubeIcon: FC<IconProps> = ({ className }) => (
  <svg
    className={className}
    fill='currentColor'
    viewBox='0 0 24 24'
    aria-hidden='true'
  >
    <path
      fillRule='evenodd'
      d='M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.701V8.115l6.857 3.886-6.857 3.884z'
      clipRule='evenodd'
    />
  </svg>
)
const LinkedinIcon: FC<IconProps> = ({ className }) => (
  <svg
    className={className}
    fill='currentColor'
    viewBox='0 0 24 24'
    aria-hidden='true'
  >
    <path d='M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' />
  </svg>
)
const TiktokIcon: FC<IconProps> = ({ className }) => (
  <svg
    className={className}
    viewBox='0 0 24 24'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M12.94,1.61V15.78a2.83,2.83,0,0,1-2.83,2.83h0a2.83,2.83,0,0,1-2.83-2.83h0a2.84,2.84,0,0,1,2.83-2.84h0V9.17h0A6.61,6.61,0,0,0,3.5,15.78h0a6.61,6.61,0,0,0,6.61,6.61h0a6.61,6.61,0,0,0,6.61-6.61V9.17l.2.1a8.08,8.08,0,0,0,3.58.84h0V6.33l-.11,0a4.84,4.84,0,0,1-3.67-4.7H12.94Z'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.9}
      strokeMiterlimit={10}
    />
  </svg>
)

const socialIconMap: { [key: string]: FC<IconProps> } = {
  Facebook: FacebookIcon,
  YouTube: YoutubeIcon,
  LinkedIn: LinkedinIcon,
  TikTok: TiktokIcon,
};

// BƯỚC 2: Tạo một đối tượng để map tên icon (chuỗi) với component (hàm)
const linkColumnIconMap: { [key: string]: ComponentType<IconProps> } = {
  LinkIcon: LinkIcon,
  BookOpenIcon: BookOpenIcon,
  GlobeAltIcon: GlobeAltIcon,
};


// --- Định nghĩa props mới ---
interface LinkColumnProps {
  title: string;
  links: FooterLink[];
  icon: keyof typeof linkColumnIconMap; // Prop icon giờ là một chuỗi
}



// --- Component cột link (SỬA ĐỔI) ---
const FooterLinkColumn: FC<LinkColumnProps> = ({ title, links, icon: iconName }) => {
  // Lấy component Icon từ map dựa trên tên
  const Icon = linkColumnIconMap[iconName];
  if (!Icon) return null; // Trả về null nếu không tìm thấy icon

  return (
    <div>
      <h4 className='mb-4 flex items-center text-sm font-semibold uppercase tracking-wider'>
        <Icon className='mr-2 h-5 w-5 text-indigo-400' />
        {title}
      </h4>
      <ul className='space-y-3'>
        {links.map(link => (
          <li key={link.label}>
            <Link href={link.href} className='transition-colors duration-300 ease-in-out'>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};


// --- Component chính ---
export default function FooterClientContent({ linkColumns, socialLinks, texts }: FooterClientContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (email) {
      router.push({
        pathname: '/auth/register',
        query: { email: email },
      });
    }
  };

  const isHomePage = pathname === '/' || /^\/[a-z]{2}$/.test(pathname) || /^\/[a-z]{2}\/$/.test(pathname);
  const bottomBarMarginTopClass = isHomePage ? 'mt-16' : 'mt-8';

  return (
    <footer className='w-full bg-gradient-to-r from-background to-background-secondary'>
      <div className='container mx-auto max-w-screen-2xl px-12 py-8'>
        {isHomePage && (
          <>
            <div className='grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-12'>
              <div className='md:col-span-4'>
                <div className='flex items-center'>
                  <Image src={`/hcmus_logo.png`} alt='Company Logo' width={80} height={80} className='h-14 w-16' />
                  <Image src={`/icon-512x512-removebg-preview.png`} alt='Company Logo' width={100} height={100} className='h-18 w-18 mb-1' />
                </div>
                <p className='ml-1 text-xl font-bold'>Global Conference & Journal Hub</p>
                <p className='text-md mt-4'>{texts.footerDescription}</p>
              </div>
              <div className='md:col-span-8'>
                <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3'>
                  {linkColumns.map(col => (
                    <FooterLinkColumn key={col.title} {...col} />
                  ))}
                </div>
              </div>
            </div>

            {!isLoggedIn && (
              <div className='mt-16 rounded-lg bg-slate-400 p-8'>
                <div className='grid items-center gap-8 md:grid-cols-2'>
                  <div>
                    <h3 className='text-2xl font-bold'>{texts.newsletterTitle}</h3>
                    <p className='mt-2'>{texts.newsletterSubtitle}</p>
                  </div>
                  <form className='mt-4 flex w-full md:mt-0' onSubmit={handleNewsletterSubmit}>
                    <input
                      type='email'
                      placeholder={texts.enterYourEmail}
                      className='w-full rounded-l-md border-0 bg-slate-300 px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                    <button type='submit' className='flex-shrink-0 rounded-r-md bg-indigo-400 px-6 py-3 font-semibold transition-colors hover:bg-indigo-700'>
                      <ArrowRightIcon className='h-6 w-6' />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        <div className={`${bottomBarMarginTopClass} flex flex-col items-center border-t border-slate-700 pt-8`}>
          <div className='mb-4 text-center sm:mb-0'>
            <p className='text-sm leading-relaxed'>
              <span>Global Conference & Journal Hub.</span>
              <br />
              <span>{texts.copyrights}</span>
            </p>
          </div>
          <div className='flex justify-center space-x-6'>
            {socialLinks.map(link => {
              const Icon = socialIconMap[link.label];
              return (
                <a key={link.href} href={link.href} target='_blank' rel='noopener noreferrer' aria-label={link.label} className='transition-colors hover:text-indigo-400'>
                  {Icon && <Icon className='mt-6 h-6 w-6' />}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}