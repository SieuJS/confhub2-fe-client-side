'use client'

import React, { ComponentType, FC, useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { Link, usePathname, AppPathname, useRouter } from '@/src/navigation'
import {
  BookOpenIcon,
  GlobeAltIcon,
  LinkIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/src/contexts/AuthContext'

// --- A. ĐỊNH NGHĨA CÁC KIỂU DỮ LIỆU (TYPES) ---
type Translator = (key: string, values?: Record<string, any>) => string;
type FooterLink = {
  label: string;
  href: AppPathname | { pathname: AppPathname; query: Record<string, string | number> };
};
type FooterLinkColumnProps = {
  title: string;
  links: FooterLink[];
  icon: ComponentType<{ className?: string }>;
};
type IconProps = {
  className?: string;
};


// --- B. TẠO CÁC COMPONENT TÁI SỬ DỤNG VÀ DỮ LIỆU ---
const FooterLinkColumn: FC<FooterLinkColumnProps> = ({ title, links, icon: Icon }) => (
  <div>
    <h4 className='mb-4 flex items-center text-sm font-semibold uppercase tracking-wider text-gray-900'>
      <Icon className='mr-2 h-5 w-5 text-indigo-400' />
      {title}
    </h4>
    <ul className='space-y-3'>
      {links.map((link) => (
        <li key={link.label}>
          <Link
            href={link.href}
            className='text-gray-500 transition-colors duration-300 ease-in-out hover:text-gray-900'
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);
const FacebookIcon: FC<IconProps> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);
const YoutubeIcon: FC<IconProps> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.701V8.115l6.857 3.886-6.857 3.884z" clipRule="evenodd" />
  </svg>
);
const LinkedinIcon: FC<IconProps> = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
);
const TiktokIcon: FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M12.94,1.61V15.78a2.83,2.83,0,0,1-2.83,2.83h0a2.83,2.83,0,0,1-2.83-2.83h0a2.84,2.84,0,0,1,2.83-2.84h0V9.17h0A6.61,6.61,0,0,0,3.5,15.78h0a6.61,6.61,0,0,0,6.61,6.61h0a6.61,6.61,0,0,0,6.61-6.61V9.17l.2.1a8.08,8.08,0,0,0,3.58.84h0V6.33l-.11,0a4.84,4.84,0,0,1-3.67-4.7H12.94Z"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.9}
            strokeMiterlimit={10}
        />
    </svg>
);

// --- C. COMPONENT FOOTER CHÍNH ---
const Footer = () => {
  const t = useTranslations('') as Translator;
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

  const quickLinks = [
    { href: '/support', label: t('Support') },
    { href: '/conferences', label: t('Conferences') },
    { href: '/visualization', label: t('Visualization') },
    { href: '/addconference', label: t('Add_Conference') },
    { href: '/chatbot/landing', label: t('Chatbot.Chatbot') }
  ] as FooterLink[];

  const popularTopics = [
    { href: { pathname: '/conferences', query: { topics: 'Business' } }, label: t('Business') },
    { href: { pathname: '/conferences', query: { topics: 'Banking and Economics' } }, label: t('Banking_and_Economics') },
    { href: { pathname: '/conferences', query: { topics: 'Engineering' } }, label: t('Engineering') },
    { href: { pathname: '/conferences', query: { topics: 'Education' } }, label: t('Education') },
    { href: { pathname: '/conferences', query: { topics: 'Health' } }, label: t('Health') }
  ] as FooterLink[];

  const popularCountries = [
    { href: { pathname: '/conferences', query: { country: 'Australia' } }, label: t('Australia') },
    { href: { pathname: '/conferences', query: { country: 'Germany' } }, label: t('Germany') },
    { href: { pathname: '/conferences', query: { country: 'India' } }, label: t('India') },
    { href: { pathname: '/conferences', query: { country: 'United States' } }, label: t('United_States') },
    { href: { pathname: '/conferences', query: { country: 'United Kingdom' } }, label: t('United_Kingdom') }
  ] as FooterLink[];

  const socialLinks = [
    { href: 'https://www.facebook.com/VNUHCM.US', label: 'Facebook', icon: FacebookIcon },
    { href: 'https://www.youtube.com/channel/UCYtIjCGvl-VNizt_XWk9Uzg', label: 'YouTube', icon: YoutubeIcon },
    { href: 'https://www.linkedin.com/school/vnuhcm---university-of-science/', label: 'LinkedIn', icon: LinkedinIcon },
    { href: 'https://www.tiktok.com/@tvts.hcmus', label: 'TikTok', icon: TiktokIcon },
  ];

  const isHomePage =
    pathname === '/' ||
    /^\/[a-z]{2}$/.test(pathname) ||
    /^\/[a-z]{2}\/$/.test(pathname)

  // Determine the top margin for the bottom bar conditionally
  const bottomBarMarginTopClass = isHomePage ? 'mt-16' : 'mt-8'; // You can adjust 'mt-8' to whatever looks good

  return (
    <footer className='w-full bg-gradient-to-r from-background to-background-secondary text-gray-700'>
      <div className='container mx-auto max-w-screen-2xl px-12 py-16'>
        {isHomePage && (
          <>
            {/* --- Main Footer Grid --- */}
            <div className='grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-12'>
              <div className='md:col-span-4'>
                <div className='flex items-center'>
                  <Image
                    src={`/hcmus_logo.png`}
                    alt='Company Logo'
                    width={80}
                    height={80}
                    className='h-18 w-20'
                  />
                  <Image
                    src={`/icon-512x512-removebg-preview.png`}
                    alt='Company Logo'
                    width={120}
                    height={120}
                    className='h-18 w-18 mb-1'
                  />
                  <span className='ml-1 text-xl font-bold text-gray-900'>
                    Global Conference & Journal Hub
                  </span>
                </div>
                <p className='mt-4 text-md text-gray-500'>
                  {t('Footer_Description')}
                </p>
              </div>
              <div className='md:col-span-8'>
                <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3'>
                  <FooterLinkColumn title={t('Quick_link')} links={quickLinks} icon={LinkIcon} />
                  <FooterLinkColumn title={t('Popular_topics')} links={popularTopics} icon={BookOpenIcon} />
                  <FooterLinkColumn title={t('Popular_countries')} links={popularCountries} icon={GlobeAltIcon} />
                </div>
              </div>
            </div>

            {/* --- Newsletter Section --- */}
            {!isLoggedIn && (
              <div className='mt-16 rounded-lg bg-slate-400 p-8'>
                <div className='grid items-center gap-8 md:grid-cols-2'>
                  <div>
                    <h3 className='text-2xl font-bold text-gray-900'>{t('Newsletter_Title')}</h3>
                    <p className='mt-2 text-gray-700'>{t('Newsletter_Subtitle')}</p>
                  </div>
                  <form className='flex w-full mt-4 md:mt-0' onSubmit={handleNewsletterSubmit}>
                    <input
                      type='email'
                      placeholder={t('Enter_your_email')}
                      className='w-full rounded-l-md border-0 bg-slate-300 px-4 py-3 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <button type='submit' className='flex-shrink-0 rounded-r-md bg-indigo-400 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-indigo-700'>
                      <ArrowRightIcon className='h-6 w-6' />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {/* --- Bottom Bar: Copyright and Socials --- */}
        {/* Apply margin-top class conditionally */}
        <div className={`${bottomBarMarginTopClass} flex flex-col items-center border-t border-slate-700 pt-8`}>
          <div className='text-center mb-4 sm:mb-0'>
            <p className='text-sm leading-relaxed text-gray-700'>
              <span>Global Conference & Journal Hub.</span>
              <br />
              <span>{t('Copyrights', { year: new Date().getFullYear() })}</span>
            </p>
          </div>
          <div className='flex justify-center space-x-6'>
            {socialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="text-gray-500 transition-colors hover:text-indigo-400"
              >
                <link.icon className="mt-6 h-6 w-6" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer