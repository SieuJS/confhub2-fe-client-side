"use client";
import { useTranslations } from 'next-intl'
import Button from './components/Button'
import Banner from './components/Banner'
import PopularConferences from './components/PopularConferences'
import ConferenceByCountry from './components/ConferenceByCountry'
import ConferenceByTopic from './components/ConferenceByTopic'
import Image from 'next/image'
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes'; // Import useTheme from next-themes
import Footer from './components/Footer';


export default function DashboardPage() {
  const t = useTranslations('')
  const { theme } = useTheme(); // Use the useTheme hook to get the current theme

 

  return (
    <div className="">
      <Banner />
      <PopularConferences />
      <ConferenceByCountry />
      <ConferenceByTopic  />
      
      
   
    </div>
  )
}
