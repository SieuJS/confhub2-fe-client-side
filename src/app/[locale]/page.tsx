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
  const [isVisibleButton, setIsVisibleButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) { // Adjust 300 to your preferred scroll distance
        setIsVisibleButton(true);
      } else {
        setIsVisibleButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // for smooth scrolling
    });
  };


  return (
    <div className="">
      <Banner />
      <PopularConferences />
      <ConferenceByCountry />
      <ConferenceByTopic  />

      {isVisibleButton && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 bg-button hover:bg-logo-shadow font-bold px-2 py-4 rounded"
        >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
          <path fill-rule="evenodd" d="M11.47 2.47a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06l-6.22-6.22V21a.75.75 0 0 1-1.5 0V4.81l-6.22 6.22a.75.75 0 1 1-1.06-1.06l7.5-7.5Z" clip-rule="evenodd" />
        </svg>
        </Button>
      )}
        
      

    </div>
  )
}