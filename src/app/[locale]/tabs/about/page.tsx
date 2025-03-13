"use client";

import { useTranslations } from 'next-intl';
import { Header } from '../../components/utils/Header';
import Footer from '../../components/utils/Footer';

export default function About({ locale }: { locale: string }) {
  const t = useTranslations('');
  
  return (
    <>
      <Header locale={locale} />
      <div className='px-10'>
        <div className="py-14 bg-background w-full"></div>
        About us
      </div>
      <Footer />
    </>
  )
}