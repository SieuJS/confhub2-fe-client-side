'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'

const Support = () => {
  const t = useTranslations('')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const faqCategories = [
    {
      name: t('AboutWebsite_name'),
      value: 'about_website'
    },
    {
      name: t('Account_name'),
      value: 'account'
    },
    {
      name: t('ConferenceJournal_name'),
      value: 'conference_journal'
    },
    {
      name: t('PostConference_name'),
      value: 'post_conference'
    },
    {
      name: t('FavoriteFeature_name'),
      value: 'favorite_feature'
    },
    {
      name: t('Chatbot_name'),
      value: 'chatbot'
    }
  ]

  const faqData = [
    // Về trang web
    {
      category: 'about_website',
      question: t('AboutWebsite_question1'),
      answer: t('AboutWebsite_answer1')
    },
    {
      category: 'about_website',
      question: t('AboutWebsite_question2'),
      answer: t('AboutWebsite_answer2')
    },
    {
      category: 'about_website',
      question: t('AboutWebsite_question3'),
      answer: t('AboutWebsite_answer3')
    },
    {
      category: 'about_website',
      question: t('AboutWebsite_question4'),
      answer: t('AboutWebsite_answer4')
    },
    {
      category: 'about_website',
      question: t('AboutWebsite_question5'),
      answer: t('AboutWebsite_answer5')
    },

    // Về tài khoản
    {
      category: 'account',
      question: t('Account_question1'),
      answer: t('Account_answer1')
    },
    {
      category: 'account',
      question: t('Account_question2'),
      answer: t('Account_answer2')
    },
    {
      category: 'account',
      question: t('Account_question3'),
      answer: t('Account_answer3')
    },
    {
      category: 'account',
      question: t('Account_question4'),
      answer: t('Account_answer4')
    },
    {
      category: 'account',
      question: t('Account_question5'),
      answer: t('Account_answer5')
    },
    {
      category: 'account',
      question: t('Account_question6'),
      answer: t('Account_answer6')
    },

    //Hội nghị và tạp chí
    {
      category: 'conference_journal',
      question: t('ConferenceJournal_question1'),
      answer: t('ConferenceJournal_answer1')
    },
    {
      category: 'conference_journal',
      question: t('ConferenceJournal_question2'),
      answer: t('ConferenceJournal_answer2')
    },
    {
      category: 'conference_journal',
      question: t('ConferenceJournal_question3'),
      answer: t('ConferenceJournal_answer3')
    },
    {
      category: 'conference_journal',
      question: t('ConferenceJournal_question4'),
      answer: t('ConferenceJournal_answer4')
    },
    {
      category: 'conference_journal',
      question: t('ConferenceJournal_question5'),
      answer: t('ConferenceJournal_answer5')
    },
    {
      category: 'conference_journal',
      question: t('ConferenceJournal_question6'),
      answer: t('ConferenceJournal_answer6')
    },
    {
      category: 'conference_journal',
      question: t('ConferenceJournal_question7'),
      answer: t('ConferenceJournal_answer7')
    },

    //Đăng bài
    {
      category: 'post_conference',
      question: t('PostConference_question1'),
      answer: t('PostConference_answer1')
    },
    {
      category: 'post_conference',
      question: t('PostConference_question2'),
      answer: t('PostConference_answer2')
    },
    {
      category: 'post_conference',
      question: t('PostConference_question3'),
      answer: t('PostConference_answer3')
    },
    {
      category: 'post_conference',
      question: t('PostConference_question4'),
      answer: t('PostConference_answer4')
    },
    {
      category: 'post_conference',
      question: t('PostConference_question5'),
      answer: t('PostConference_answer5')
    },
    {
      category: 'post_conference',
      question: t('PostConference_question6'),
      answer: t('PostConference_answer6')
    },
    {
      category: 'post_conference',
      question: t('PostConference_question7'),
      answer: t('PostConference_answer7')
    },

    //Favorite
    {
      category: 'favorite_feature',
      question: t('FavoriteFeature_question1'),
      answer: t('FavoriteFeature_answer1')
    },
    {
      category: 'favorite_feature',
      question: t('FavoriteFeature_question2'),
      answer: t('FavoriteFeature_answer2')
    },
    {
      category: 'favorite_feature',
      question: t('FavoriteFeature_question3'),
      answer: t('FavoriteFeature_answer3')
    },
    {
      category: 'favorite_feature',
      question: t('FavoriteFeature_question4'),
      answer: t('FavoriteFeature_answer4')
    },
    {
      category: 'favorite_feature',
      question: t('FavoriteFeature_question5'),
      answer: t('FavoriteFeature_answer5')
    },

    //Chatbot
    {
      category: 'chatbot',
      question: t('Chatbot_question1'),
      answer: t('Chatbot_answer1')
    },
    {
      category: 'chatbot',
      question: t('Chatbot_question2'),
      answer: t('Chatbot_answer2')
    },
    {
      category: 'chatbot',
      question: t('Chatbot_question3'),
      answer: t('Chatbot_answer3')
    },
    {
      category: 'chatbot',
      question: t('Chatbot_question4'),
      answer: t('Chatbot_answer4')
    },
    {
      category: 'chatbot',
      question: t('Chatbot_question5'),
      answer: t('Chatbot_answer5')
    },
    {
      category: 'chatbot',
      question: t('Chatbot_question6'),
      answer: t('Chatbot_answer6')
    },
    {
      category: 'chatbot',
      question: t('Chatbot_question7'),
      answer: t('Chatbot_answer7')
    },
    {
      category: 'chatbot',
      question: t('Chatbot_question8'),
      answer: t('Chatbot_answer8')
    }
  ]

  const filteredFaqData = faqData.filter(
    item =>
      (selectedCategory === null || item.category === selectedCategory) && // Filter by category
      (searchTerm === '' ||
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())) // Filter by search term
  )

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setExpandedIndex(null) // Collapse all accordions when searching
  }

  const handleCategoryClick = (categoryValue: string | null) => {
    setSelectedCategory(categoryValue)
    setExpandedIndex(null) // Collapse all accordions when category changes
    setSearchTerm('') // Clear search term when category changes
  }
  return (
    <>
      <div className='w-full bg-gradient-to-r from-background to-background-secondary p-8'>
        {/* Added padding */}
        <div className='container relative grid grid-cols-1 items-center gap-4 md:grid-cols-3'>
          <div className='flex flex-col items-center md:col-span-3'>
            {/* Title and search bar column */}
            <h2 className='py-8 text-center text-3xl font-bold'>
              {t('How_can_we_help_you')}
            </h2>
            {/* Removed pt-40 */}
          </div>
        </div>
        {/* Search Bar */}
        <div className='relative mx-20 mb-12 md:mx-40 lg:mx-60 '>
          {/* Increased mb for spacing */}
          <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
            <svg
              className='h-5 w-5 '
              viewBox='0 0 20 20'
              fill='currentColor'
              aria-hidden='true'
            >
              <path
                fillRule='evenodd'
                d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <input
            type='text'
            className='block w-full rounded-full border border-background-secondary bg-background py-6 pl-10 pr-3 shadow-sm focus:border-background-secondary focus:outline-none focus:ring-1 focus:ring-background-secondary sm:text-sm' // Increased py-3 for taller search bar
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        {/* Two-Column Layout */}
        <div className='mx-12 flex gap-4'>
          {/* Using grid for 2-column layout */}
          {/* Left Column - Categories */}
          <div className='w-full rounded-lg  p-4 shadow-lg md:w-1/3 '>
            {/* Adjusted width for smaller screens */}

            <ul className='space-y-2'>
              <li
                key='all'
                className={`cursor-pointer py-1  ${selectedCategory === null ? 'font-bold ' : ''}`}
                onClick={() => handleCategoryClick(null)}
              >
                {t('All')}
              </li>
              {faqCategories.map(category => (
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
          <div className='w-full rounded-lg  p-4 shadow-xl md:w-2/3'>
            {/* Adjusted width for smaller screens */}
            <div className='space-y-4'>
              {filteredFaqData.map((item, index) => (
                <div key={index} className='rounded-lg border shadow-sm'>
                  <div
                    className='flex cursor-pointer items-center justify-between px-4 py-3'
                    onClick={() => toggleAccordion(index)}
                  >
                    <h3 className='text-lg font-semibold'>{item.question}</h3>
                    <svg
                      className={`h-5 w-5 transition-transform duration-200 ${expandedIndex === index ? 'rotate-180' : ''}`}
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M19 9l-7 7-7-7'
                      ></path>
                    </svg>
                  </div>
                  {expandedIndex === index && (
                    <div className='px-4 pb-4 pt-0'>
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
              {filteredFaqData.length === 0 && (
                <p className='text-gray-500'>{t('noResultsFound')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Support
