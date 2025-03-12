"use client";

import AIAbilities from "../../components/landingChatbot/AIAbilities";
import AIAbout from "../../components/landingChatbot/AIAbout";
import AIBanner from "../../components/landingChatbot/AIBanner";
import AIBanner2 from "../../components/landingChatbot/AIBanner2";
import AIFAQ from "../../components/landingChatbot/AIFAQ";
import AIStatistics from "../../components/landingChatbot/AIStatistics";
import { useEffect, useState } from 'react';
import Button from '../../components/utils/Button';

export default function AILanding() {
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
    <div className="bg-black">
      <AIBanner />
      {/* <AIBanner2 /> */}
      <AIAbout />
      <AIAbilities />
      <AIStatistics />
      <AIFAQ />

      {isVisibleButton && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-20 right-20 bg-button hover:bg-logo-shadow font-bold px-8 py-4 rounded z-10"
        >
         Chat Now        
        </Button>
      )}
    </div>
  );
}