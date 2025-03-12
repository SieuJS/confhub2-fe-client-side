// AIAbout.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

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

interface WordProps {
    word: string;
    index: number;
    isVisible: boolean;
}

const Word: React.FC<WordProps> = ({ word, index, isVisible }) => {
    const isWhitespace = /^\s+$/.test(word); // Check if the word is only whitespace

    return (
        <span
            style={{
                display: 'inline-block',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(20px)' : 'translateY(0)',
                transition: 'transform 0.2s ease-out, opacity 0.7s ease-out',
                transitionDelay: `${index * 0.05}s`, //Adjust for spacing between words falling.
                width: isWhitespace ? '0.3em' : 'auto', // Set width for whitespace
                visibility: isWhitespace ? 'visible' : 'visible',  //Make sure spaces are visible
            }}
        >
            {word}
        </span>
    );
};

const AIAbout: React.FC = () => {
    const [currentLanguage, setCurrentLanguage] = useState(languages[0]);
    const [languageIndex, setLanguageIndex] = useState(0);
    const [animate, setAnimate] = useState(false);
    const languageRef = useRef<HTMLSpanElement>(null);

    const [titleVisible, setTitleVisible] = useState(false);
    const titleRef = useRef<HTMLHeadingElement>(null);

    const [wordsVisible, setWordsVisible] = useState<boolean[]>([]);

    const titleText = " Take a decisive step toward fact based decisions";

    useEffect(() => {
        // Initialize wordsVisible state. Split by spaces *and* newlines
        const initialWords = titleText.split(/(\s+)/); // Split and keep spaces
        setWordsVisible(Array(initialWords.length).fill(false));
    }, [titleText]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setTitleVisible(true);

                        // Trigger word reveal animation
                        let index = 0;
                        const intervalId = setInterval(() => {
                            setWordsVisible(prev => {
                                const next = [...prev];
                                next[index] = true;
                                return next;
                            });
                            index++;
                            if (index >= titleText.split(/(\s+)/).length) {
                                clearInterval(intervalId);
                            }
                        }, 100); // Adjust timing for word reveal speed.
                         observer.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: '0px',
                threshold: 0.2,
            }
        );

        if (titleRef.current) {
            observer.observe(titleRef.current);
        }

        return () => {
            if (titleRef.current) {
                observer.unobserve(titleRef.current);
            }
        };
    }, [titleText]);

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
    const getWordsWithLineBreaks = (text: string): string[] => {
        return text.split(/(\s+)/);
    };

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
                    ref={titleRef}
                    className={`text-5xl font-bold mb-12`}
                    style={{ whiteSpace: 'pre-line' }}
                >
                    {getWordsWithLineBreaks(titleText).map((word, index) => (
                        <Word key={index} word={word} index={index} isVisible={wordsVisible[index]} />
                    ))}
                </h1>
                <p className="text-xl text-gray-400 mb-12">
                    Through efficiency, quality, and ease of use, <br />
                    Research AI enables you to think in a data-driven, fact-based and unbiased way.
                </p>

                {/* AI-Powered Insights Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Explanation of AI Understanding */}
                    <div className="text-left">
                        <h2 className="text-3xl font-semibold mb-4">
                            We understand you in{' '}
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
                            Making wise decisions is the key to success in virtually any
                            field of work. Yet there is little guidance available to help
                            nurture this unique and valuable skill. This is where our
                            Research AI proves to be your most valuable companion, with a
                            unique combination of human-curated, rich data, perfectly
                            intuitive operation, speed, and an almost infinite variety of
                            languages. Choosing Research AI will therefore be the first of
                            many great decisions you will make in the future.
                        </p>
                    </div>

                    {/* AI Info Graphics */}
                    <div className="bg-gray-800 rounded-lg shadow-md p-4">
                        <img src="./AI_Infographics.png" alt="AI Info" />
                    </div>
                </div>
            </div>
        </div>

      </div>


        
    );
};

export default AIAbout;