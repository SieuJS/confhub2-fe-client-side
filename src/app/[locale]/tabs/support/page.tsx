"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes';

const FAQ: React.FC = () => {
  const t = useTranslations('FAQ');
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // State for selected category

  // Define FAQ categories and data
  const faqCategories = [
    {
      name: t('categoryConference') || 'About Conference', // Translated category names
      value: 'conference',
    },
    {
      name: t('categoryAccount') || 'About Account',
      value: 'account',
    },
    {
      name: t('categoryJournal') || 'About Journal',
      value: 'journal',
    },
    {
      name: t('categoryGeneral') || 'General',
      value: 'general',
    },
  ];

  const faqData = [
    {
      category: 'conference',
      question: t('conferenceQuestion1') || "Conference Question 1?", // Example questions with categories
      answer: t('conferenceAnswer1') || "Answer to Conference Question 1.",
    },
    {
      category: 'conference',
      question: t('conferenceQuestion2') || "Conference Question 2?",
      answer: t('conferenceAnswer2') || "Answer to Conference Question 2.",
    },
    {
      category: 'account',
      question: t('accountQuestion1') || "Account Question 1?",
      answer: t('accountAnswer1') || "Answer to Account Question 1.",
    },
    {
      category: 'account',
      question: t('accountQuestion2') || "Account Question 2?",
      answer: t('accountAnswer2') || "Answer to Account Question 2.",
    },
    {
      category: 'journal',
      question: t('journalQuestion1') || "Journal Question 1?",
      answer: t('journalAnswer1') || "Answer to Journal Question 1.",
    },
    {
      category: 'journal',
      question: t('journalQuestion2') || "Journal Question 2?",
      answer: t('journalAnswer2') || "Answer to Journal Question 2.",
    },
    {
      category: 'general',
      question: "What is this website about?",
      answer: "This website is designed to provide information and resources about our products and services.",
    },
    {
      category: 'general',
      question: "How do I contact support?",
      answer: "You can contact our support team by emailing support@example.com or calling us at +1-555-123-4567.",
    },
    {
      category: 'general',
      question: "Do you offer refunds?",
      answer: "Yes, we offer refunds under certain conditions. Please see our Refund Policy page for more details.",
    },
    // Add more FAQ items here, categorized
  ];

  const filteredFaqData = faqData.filter(item =>
    (selectedCategory === null || item.category === selectedCategory) && // Filter by category
    (searchTerm === '' || item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.answer.toLowerCase().includes(searchTerm.toLowerCase())) // Filter by search term
  );


  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setExpandedIndex(null); // Collapse all accordions when searching
  };

  const handleCategoryClick = (categoryValue: string | null) => {
    setSelectedCategory(categoryValue);
    setExpandedIndex(null); // Collapse all accordions when category changes
    setSearchTerm(''); // Clear search term when category changes
  };

  return (
    <div className="bg-gradient-to-r from-background to-background-secondary w-full p-14"> {/* Added background div */}

<div className="relative container grid grid-cols-1 md:grid-cols-5 gap-4 items-center"> {/* Align items vertically center */}
          <div className='md:col-span-1 relative max-lg:hidden animate-float-up-down mt-6 h-[200px] md:h-[200px]'> {/* Image left - fixed height */}
            <Image
              src='/s1.png'
              alt='Background image left'
              layout='fill' // Use fill layout
              objectFit='contain'
              className='object-contain'
            />
          </div>
          <div className='md:col-span-3 flex flex-col items-center'> {/* Title and search bar column */}
            <h2 className="text-3xl font-bold text-center pt-28">{t('How can we help you?') }</h2> {/* Removed pt-40 */}
            </div>
            <div className='md:col-span-1 relative max-lg:hidden animate-float-up-down mt-10 h-[200px] md:h-[200px]'> {/* Image left - fixed height */}
            <Image
              src='/s2.png'
              alt='Background image left'
              layout='fill' // Use fill layout
              objectFit='contain'
              className='object-contain'
            />
          </div>
      </div>

        {/* Search Bar */}
        <div className="mb-12 relative mx-20 md:mx-40 lg:mx-60 "> {/* Increased mb for spacing */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 " viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-6 border border-background-secondary rounded-full bg-background shadow-sm focus:outline-none focus:border-background-secondary focus:ring-background-secondary focus:ring-1 sm:text-sm" // Increased py-3 for taller search bar
            placeholder={t('searchPlaceholder') || "Describe your issue"}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>


        {/* Two-Column Layout */}
        <div className="mx-12 flex gap-4"> {/* Using grid for 2-column layout */}
          {/* Left Column - Categories */}
          <div className="w-full md:w-1/3  rounded-lg p-4 shadow-lg"> {/* Adjusted width for smaller screens */}
            <h3 className="font-semibold text-lg mb-4">{t('categoriesTitle') || 'Categories'}</h3>
            <ul className="space-y-2">
              <li
                key="all"
                className={`cursor-pointer py-1  ${selectedCategory === null ? 'font-bold ' : ''}`}
                onClick={() => handleCategoryClick(null)}
              >
                {t('categoryAll') || 'All'}
              </li>
              {faqCategories.map((category) => (
                <li
                  key={category.value}
                  className={`cursor-pointer py-1  ${selectedCategory === category.value ? 'font-bold ' : ''}`}
                  onClick={() => handleCategoryClick(category.value)}
                >
                  {category.name}
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column - Questions and Answers */}
          <div className="w-full md:w-2/3  rounded-lg p-4 shadow-xl"> {/* Adjusted width for smaller screens */}
            <div className="space-y-4">
              {filteredFaqData.map((item, index) => (
                <div key={index} className="border rounded-lg shadow-sm">
                  <div
                    className="px-4 py-3 cursor-pointer flex justify-between items-center"
                    onClick={() => toggleAccordion(index)}
                  >
                    <h3 className="font-semibold text-lg">{item.question}</h3>
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${expandedIndex === index ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                  {expandedIndex === index && (
                    <div className="px-4 pb-4 pt-0">
                      <p className="">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
              {filteredFaqData.length === 0 && (
                <p className="text-gray-500">{t('noResultsFound') || 'No questions found in this category or matching your search.'}</p>
              )}
            </div>
          </div>
        </div>
      
    </div>
  );
};

export default FAQ;