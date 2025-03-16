'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';


const languages = [
  "mọi ngôn ngữ", // Vietnamese
  "all languages", // English
  "todas las lenguas", // Spanish
  "toutes les langues", // French
  "alle Sprachen", // German
  "tutti le lingue", // Italian
  "すべての言語", // Japanese
  "所有语言", // Chinese (Simplified)
  "모든 언어", // Korean
  "барлық тілдер", // Kazakh
  "جميع اللغات", // Arabic
  "всі мови", // Ukrainian
  "všechny jazyky", // Czech
  "wszystkie języki", // Polish
  "todos os idiomas", // Portuguese
  "semua bahasa", // Indonesian
  "всички езици", // Bulgarian
  "toate limbile", // Romanian
  "tüm diller", // Turkish
  "כל השפות", // Hebrew (all ha-safot)
  "όλες οι γλώσσες", // Greek (oles oi glosses)
  "हर भाषाएँ", // Hindi (har bhashayen)
  "ทุกภาษา", // Thai (thuk phasa)
  "ሁሉም ቋንቋዎች", // Amharic (huloom quanqu'ochi)
  "كل لغات", // Urdu (kul lughat)
  "Všechny jazyky", // Slovak (Všetky jazyky)
  "barcha tillar", //Uzbek (Cyrillic)
  "ყველა ენაზე", // Georgian (qvela enaze)
  "հոլսս լեզուներ", // Armenian (hols's lezunir)

];



const AIAbout: React.FC = () => {
  const t = useTranslations('');
  
  const [currentLanguage, setCurrentLanguage] = useState(languages[0]);
  const [languageIndex, setLanguageIndex] = useState(0);
  const [animate, setAnimate] = useState(false);
  const languageRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setAnimate(true);
      setTimeout(() => {
        setLanguageIndex((prevIndex) => (prevIndex + 1) % languages.length);
        setAnimate(false);
      }, 300);

    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setCurrentLanguage(languages[languageIndex]);
  }, [languageIndex]);

  // Function to split the title text into words, preserving line breaks.
  

  const [userMessage, setUserMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [typingUser, setTypingUser] = useState(false);
  const [typingAI, setTypingAI] = useState(false);

  const initialUserMessage = t('Chatbot_AI_Message');
  const initialAiResponse = t('Chatbot_User_Message');

  const resetTyping = () => {
      setUserMessage('');
      setAiResponse('');
      setTypingUser(false);
      setTypingAI(false);
  };

  const startTypingAnimation = () => {
      let userMessageIndex = 0;
      let aiMessageIndex = 0;
      let userTypingTimeout: NodeJS.Timeout;
      let aiTypingTimeout: NodeJS.Timeout;

      const startUserTyping = () => {
          setTypingUser(true);
          userTypingTimeout = setTimeout(() => {
              setUserMessage(initialUserMessage.substring(0, userMessageIndex));
              userMessageIndex++;

              if (userMessageIndex <= initialUserMessage.length) {
                  startUserTyping();
              } else {
                  setTypingUser(false);
                  startAITyping(); // Start AI typing after user typing is complete
              }
          }, 30);
      };

      const startAITyping = () => {
          setTimeout(() => { // Add a delay before AI starts typing
              setTypingAI(true);
              aiTypingTimeout = setTimeout(() => {
                  setAiResponse(initialAiResponse.substring(0, aiMessageIndex));
                  aiMessageIndex++;

                  if (aiMessageIndex <= initialAiResponse.length) {
                      startAITyping();
                  } else {
                      setTypingAI(false);
                  }
              }, 20);
          }, 20); // Delay AI typing by 1 second
      };

      startUserTyping();

      return () => {
          clearTimeout(userTypingTimeout);
          clearTimeout(aiTypingTimeout);
      };
  };

  useEffect(() => {
      let typingInterval: NodeJS.Timeout;

      const startInterval = () => {
          typingInterval = setInterval(() => {
              resetTyping();
              startTypingAnimation();
          }, 20000); // 15000 milliseconds = 15 seconds
          startTypingAnimation(); // Start immediately on mount
      };

      startInterval();

      return () => {
          clearInterval(typingInterval);
          resetTyping(); // Clear any ongoing typing on unmount
      };
  }, []);



  return (
    <div className="relative h-screen text-white">
      <Image
        src="/banner2.png"
        alt="Background Image"
        fill
        quality={100}
        className="z-0"
        style={{ objectFit: 'cover' }}  // Moved objectFit to the style prop
      />

      <div className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          {/* Title and Description */}
          <h1
            className={`text-5xl font-bold mb-12`}
          >
            {t('Slogan_Chatbot_about')}
          </h1>
          <p className="text-xl text-gray-400 mb-12">
            {t('Slogan_Chatbot_about1')}<br />
            {t('Slogan_Chatbot_about2')}
          </p>

          {/* AI-Powered Insights Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Explanation of AI Understanding */}
            <div className="text-left">
              <h2 className="text-3xl font-semibold mb-4">
                {t('We_understand_you_in')}{' '}
                <span
                  ref={languageRef}
                  className={`text-blue-400 inline-block transition-opacity duration-300 ${animate ? 'opacity-0' : 'opacity-100'
                    }`}
                  style={{ transitionTimingFunction: 'ease-in-out' }}
                >
                  {currentLanguage}
                </span>
              </h2>
              <p className="text-gray-300">
                {t('Slogan_Chatbot_about_describe')}
              </p>
            </div>

            {/* AI Chat-Like Section */}
            <div className="bg-gray-800 rounded-lg shadow-md p-4 flex flex-col">
              {/* User Message */}
              <div className="bg-blue-600 text-white p-3 rounded-lg self-end mb-2 max-w-md whitespace-pre-line">
                {typingUser ? userMessage + '...' : userMessage}
              </div>

              {/* AI Response */}
              <div className="bg-gray-700 text-white p-3 rounded-lg self-start max-w-md whitespace-pre-line">
                {typingAI ? aiResponse + '...' : aiResponse}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAbout;