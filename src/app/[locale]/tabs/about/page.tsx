"use client";

import { useTranslations } from 'next-intl';

export default function About() {
  const t = useTranslations('');
  
  return (
    <div className='px-10'>
      <div className="py-14 bg-background w-full"></div>
      About us
    </div>
  )
}