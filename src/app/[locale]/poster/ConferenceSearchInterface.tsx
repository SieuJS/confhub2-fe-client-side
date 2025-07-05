'use client'

import React, { useState } from 'react'
import {
  MapPin,
  CalendarDays,
  LayoutGrid,
  ChevronDown,
  Search,
  ListFilter,
  Info
} from 'lucide-react'

// =================================================================
// COMPONENT MỚI: Thanh tìm kiếm (SearchBar)
// =================================================================
const SearchBar: React.FC = () => {
  const [isAdvancedSearchVisible, setAdvancedSearchVisible] = useState(true)

  const advancedFilters = [
    { label: 'Submission Date', placeholder: 'Select Date Range' },
    { label: 'Rank', placeholder: 'A*' },
    { label: 'Source', placeholder: 'Source' },
    { label: 'Topics', placeholder: 'Enter topics' }
  ]

  return (
    <div className='mb-8'>
      {/* Thanh tìm kiếm chính */}
      <div className='flex items-center gap-4 rounded-full border border-gray-300 bg-white p-2 shadow-sm'>
        <div className='flex flex-grow items-center'>
          <Search className='ml-3 mr-2 h-5 w-5 text-gray-400' />
          <input
            type='text'
            placeholder='Type a command or search...'
            className='w-full border-none bg-transparent text-3xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-0'
          />
        </div>

        <div className='flex h-8 items-center'>
          <div className='h-full w-px bg-gray-200'></div>
        </div>

        <div className='flex items-center gap-2 pr-2 text-3xl text-gray-600'>
          <span>Keyword</span>
          <ChevronDown className='h-4 w-4' />
        </div>

        <div className='flex h-8 items-center'>
          <div className='h-full w-px bg-gray-200'></div>
        </div>

        <div className='flex items-center gap-4 text-3xl text-gray-600'>
          <div className='flex items-center gap-2'>
            <span>Start:</span>
            <input
              type='text'
              placeholder='mm/dd/yyyy'
              className='w-24 border-none bg-transparent p-0 focus:outline-none focus:ring-0'
            />
            <CalendarDays className='h-4 w-4 text-gray-400' />
          </div>
          <div className='flex items-center gap-2'>
            <span>End:</span>
            <input
              type='text'
              placeholder='mm/dd/yyyy'
              className='w-24 border-none bg-transparent p-0 focus:outline-none focus:ring-0'
            />
            <CalendarDays className='h-4 w-4 text-gray-400' />
          </div>
        </div>

        <div className='flex h-8 items-center'>
          <div className='h-full w-px bg-gray-200'></div>
        </div>

        <div className='flex items-center gap-6 pr-4 text-3xl text-gray-600'>
          <div className='flex items-center gap-2'>
            <ListFilter className='h-4 w-4' />
            <span>Type</span>
          </div>
          <div className='flex items-center gap-2'>
            <MapPin className='h-4 w-4' />
            <span>Location</span>
          </div>
        </div>

        <button className='rounded-full bg-teal-600 px-7 py-2 text-3xl font-semibold text-white transition hover:bg-teal-700'>
          Search
        </button>
        <button className='mr-1 rounded-full border border-gray-300 bg-white px-7 py-2 text-3xl font-semibold text-gray-700 transition hover:bg-gray-50'>
          Clear
        </button>
      </div>

      {/* Liên kết ẩn/hiện tìm kiếm nâng cao */}
      <div className='mt-3 text-right'>
        <button
          onClick={() => setAdvancedSearchVisible(!isAdvancedSearchVisible)}
          className='text-3xl text-gray-600 hover:text-teal-600 hover:underline'
        >
          {isAdvancedSearchVisible ? 'Hide' : 'Show'} advanced search options
        </button>
      </div>

      {/* Panel tìm kiếm nâng cao */}
      {isAdvancedSearchVisible && (
        <div className='mt-2 rounded-lg bg-slate-100 p-6 shadow-inner'>
          <div className='grid grid-cols-4 gap-x-6 gap-y-4 '>
            {advancedFilters.map((filter, index) => (
              <div key={index}>
                <label className='mb-1.5 flex items-center text-3xl font-semibold text-gray-700'>
                  {/* <span className='mr-2 flex h-4 w-4 items-center justify-center rounded-full bg-gray-500 text-3xl font-bold text-white'>
                    !
                  </span> */}
                  {filter.label}
                </label>
                <input
                  type='text'
                  placeholder={filter.placeholder}
                  className='w-full rounded-md border-gray-300 bg-white px-3 py-2 text-3xl shadow-sm focus:border-teal-500 focus:ring-teal-500'
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// =================================================================
// DỮ LIỆU VÀ CÁC COMPONENT KẾT QUẢ (KHÔNG ĐỔI)
// =================================================================

const conferenceData = [
  {
    rank: 'A*',
    status: 'Offline',
    imageUrl: '/bg-2.jpg',
    title: 'ACM Symposium on Theory of Computing (STOC)',
    location: 'Prague, Czech Republic',
    date: 'Jun 23, 2025 - Jun 27, 2025',
    topics: ['Algorithms and Data Structures']
  },
  {
    rank: 'A*',
    status: 'Offline',
    imageUrl: '/bg-2.jpg',
    title: 'IEEE Conference on Computer Vision and Pattern Recognition (CVPR)',
    location: 'Music City Center, Nashville, Tennessee',
    date: 'Jun 11, 2025 - Jun 15, 2025',
    topics: ['Biometrics', 'simulation', 'retrieval']
  },
  {
    rank: 'A*',
    status: 'Offline',
    imageUrl: '/bg-2.jpg',
    title:
      'International Conference on Automated Planning and Scheduling (ICAPS)',
    location: 'Melbourne, Victoria, Australia',
    date: 'Nov 9, 2025 - Nov 14, 2025',
    topics: []
  },
  {
    rank: 'A*',
    status: 'Offline',
    imageUrl: '/bg-2.jpg',
    title: 'ACM-SIGACT Symposium on Principles of Programming Languages (POPL)',
    location: 'Denver, Colorado, United States',
    date: 'Jan 22, 2025 - Jan 24, 2025',
    topics: []
  }
]

const ConferenceCard: React.FC<(typeof conferenceData)[0]> = ({
  rank,
  status,
  imageUrl,
  title,
  location,
  date,
  topics
}) => (
  <div className='flex flex-col overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-xl'>
    <div className='relative'>
      <img
        src={imageUrl}
        alt={title}
        className='h-80 w-full bg-gray-200 object-cover'
      />
      <span className='absolute left-4 top-4 rounded bg-[#FDEFB6] px-2 py-1 text-3xl font-bold text-gray-800'>
        Rank: {rank}
      </span>
      <span className='absolute right-4 top-4 rounded bg-[#F5DEDE] px-2 py-1 text-3xl font-bold text-rose-700'>
        {status}
      </span>
    </div>
    <div className='flex flex-grow flex-col p-5'>
      <h3 className='mb-3 h-20 text-3xl font-bold text-gray-800'>{title}</h3>
      <div className='mt-auto space-y-2 text-3xl text-gray-600'>
        <div className='flex items-start'>
          <MapPin className='mr-2.5 mt-0.5 h-4 w-4 flex-shrink-0' />
          <span>{location}</span>
        </div>
        <div className='flex items-start'>
          <CalendarDays className='mr-2.5 mt-0.5 h-4 w-4 flex-shrink-0' />
          <span>{date}</span>
        </div>
      </div>
      <div className='mt-4 flex flex-wrap gap-2 border-t border-gray-200 pt-4'>
        {topics.length > 0 ? (
          topics.map((topic, index) => (
            <span
              key={index}
              className='rounded-full bg-gray-100 px-3 py-1 text-3xl text-gray-700'
            >
              {topic}
            </span>
          ))
        ) : (
          <span className='rounded-full bg-gray-100 px-3 py-1 text-3xl text-gray-500'>
            No topics
          </span>
        )}
      </div>
    </div>
  </div>
)

const ConferenceResults: React.FC = () => {
  return (
    <>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-2xl font-bold text-gray-800'>
          Conference Results (64)
        </h2>
        <div className='flex items-center gap-3'>
          <span className='text-3xl text-gray-600'>Events per page:</span>
          <div className='flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 shadow-sm'>
            <span className='text-3xl font-medium text-gray-800'>4</span>
            <ChevronDown className='h-4 w-4 text-gray-500' />
          </div>
          <button className='rounded-md border border-gray-300 bg-white p-2 text-gray-600 shadow-sm hover:bg-gray-50'>
            <LayoutGrid className='h-5 w-5' />
          </button>
        </div>
      </div>
      <div className='grid grid-cols-4 gap-8 '>
        {conferenceData.map((conf, index) => (
          <ConferenceCard key={index} {...conf} />
        ))}
      </div>
    </>
  )
}

// =================================================================
// COMPONENT CHÍNH: Ghép nối SearchBar và ConferenceResults
// =================================================================
const ConferencePage: React.FC = () => {
  return (
    <div className='bg-gray-100 p-8 font-sans'>
      <SearchBar />
      <ConferenceResults />
    </div>
  )
}

export default ConferencePage
