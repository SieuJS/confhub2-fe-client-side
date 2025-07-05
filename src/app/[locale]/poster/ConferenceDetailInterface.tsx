'use client'

import React from 'react'
import {
  Calendar,
  Share2,
  Star,
  RefreshCw,
  Globe,
  Ban,
  Send,
  Clock,
  MapPin,
  Building,
  ExternalLink,
  Bell,
  Camera
} from 'lucide-react'
import Map from '../conferences/detail/Map'
import MapPoster from './MapPoster'

// Component phụ trợ cho các mục ngày quan trọng - Kích thước đã được tăng lên
const DateItem: React.FC<{ title: string; date: string }> = ({
  title,
  date
}) => (
  <div className='relative rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-lg'>
    {/* Tăng font size */}
    <p className='text-5xl font-medium '>{title}</p>
    <p className='text-5xl '>{date}</p>
    {/* Tăng kích thước badge "NEW" và vị trí */}
    <span className='absolute right-5 top-5 rounded-md bg-green-100 px-5 py-2 text-4xl font-semibold text-green-800'>
      NEW
    </span>
  </div>
)

const ConferenceDetailInterface: React.FC = () => {
  const topics = [
    'Biometrics',
    'simulation',
    'retrieval',
    'Transparency',
    '3D from multi-view and sensors',
    '3D from single images'
  ]

  const actionButtons = [
    { icon: Calendar, label: 'Calendar' },
    { icon: Share2, label: 'Share' },
    { icon: Star, label: 'Follow' },
    { icon: RefreshCw, label: 'Update' },
    { icon: Globe, label: 'Website' },
    { icon: Ban, label: 'Blacklist' },
    { icon: Send, label: 'Submit Paper' }
  ]

  const conferenceLocation = 'Music City Center, Nashville, Tennessee'

  return (
    // Tăng padding tổng thể
    <div className='min-h-screen bg-gray-100 p-8 font-sans '>
      {/* Tăng padding và shadow cho container chính */}
      <div className='mx-auto rounded-3xl bg-white p-20 shadow-2xl'>
        {/* Header Section */}
        {/* Tăng khoảng cách giữa các cột */}
        <div className='flex flex-row gap-8'>
          <div className='w-1/4'>
            <img
              src='/bg-2.jpg'
              alt='Conference Banner'
              // Tăng bo góc
              className=' w-full rounded-2xl bg-gray-200 object-cover'
            />
          </div>
          <div className='flex-1'>
            {/* Tăng khoảng cách và font size cho các tag */}
            <div className='mb-6 flex flex-wrap items-center gap-8'>
              <span className='text-6xl font-semibold text-red-600'>
                June 11 - June 15, 2025
              </span>
              <span className='rounded-xl bg-yellow-100 px-6 py-3 text-5xl font-bold text-yellow-700 '>
                Rank: A* (CORE2023)
              </span>
              <span className='rounded-xl bg-red-100 px-6 py-3 text-5xl font-bold text-red-700 '>
                Offline
              </span>
            </div>
            {/* Tăng font-size cho tiêu đề chính một cách đáng kể */}
            <h1 className='mb-6 text-7xl font-bold '>
              IEEE Conference on Computer Vision and Pattern Recognition
            </h1>
            {/* Tăng font-size và kích thước icon */}
            <div className='mb-8 flex items-center text-5xl '>
              <Clock className='mr-4 h-10 w-10' />
              <span>Updated: about 5 hours ago</span>
            </div>
            <div className='mb-8 flex items-center gap-4'>
              <div className='flex text-yellow-500'>
                {/* Tăng kích thước sao */}
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className='h-12 w-12' />
                ))}
              </div>
              <span className='text-5xl font-bold'>0.0</span>
              <span className='text-5xl '>(0 Ratings)</span>
            </div>
            {/* Tăng font-size, khoảng cách và kích thước icon */}
            <div className='space-y-6 text-5xl '>
              <div className='flex items-center'>
                <MapPin className='mr-4 h-10 w-10 ' />
                <span>Music City Center, Nashville, Tennessee</span>
              </div>
              <div className='flex items-center'>
                <Building className='mr-4 h-10 w-10 ' />
                <span>No publisher</span>
              </div>
            </div>
          </div>
          <div className='w-[700px]'>
            {/* Tăng khoảng cách giữa các nút */}
            <div className='flex flex-col space-y-4'>
              {actionButtons.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className='flex w-full items-center justify-start gap-6 rounded-xl border-2 border-gray-300 border-secondary bg-gray-100 px-10 py-5 text-5xl font-medium transition-colors hover:bg-gray-100'
                >
                  <Icon className='h-10 w-10 text-secondary' />
                  <span className='text-secondary'>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Topics Section */}
        {/* Tăng margin và padding */}
        <div className='mt-20 border-t-2 border-gray-200 pt-16'>
          <h3 className='mb-8 text-6xl font-semibold'>Topics:</h3>
          <div className='flex flex-wrap gap-6'>
            {topics.map(topic => (
              <span
                key={topic}
                className='cursor-pointer rounded-full bg-gray-100 px-8 py-4 text-5xl  hover:bg-gray-200'
              >
                {topic}
              </span>
            ))}
            <button className='rounded-full bg-blue-100 px-8 py-4 text-5xl font-semibold text-blue-700 hover:bg-blue-200'>
              View More
            </button>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className='mt-20'>
          {/* Container cho tất cả các section - tăng margin và space */}
          <div className='mt-16 space-y-8 text-5xl'>
            {/* Overview Content */}
            <div
              id='overview'
              className='rounded-2xl border-2 border-gray-200 p-8'
            >
              <h2 className='mb-8 text-7xl font-bold'>Overview</h2>
              <p className='leading-relaxed '>
                CVPR 2025, the IEEE/CVF Conference on Computer Vision and
                Pattern Recognition, will be held from June 11th to June 15th,
                2025, at the Music City Center in Nashville, TN. The conference
                includes the main conference and co-located workshops and short
                courses.
              </p>
            </div>

            {/* Important Dates Content */}
            <div
              id='important-dates'
              className='rounded-2xl border-2 border-gray-200 bg-gray-100/50 p-8'
            >
              <div className='flex items-center gap-4'>
                <h2 className='text-7xl font-bold'>Important Dates</h2>
              </div>

              <div className='relative mt-12 rounded-2xl bg-white p-10 shadow-lg'>
                <div className='flex items-center gap-5'>
                  <Calendar className='h-12 w-12 text-blue-600' />
                  <p className='text-6xl font-semibold'>Conference Dates</p>
                </div>
                <p className='mt-2 pl-[68px] text-5xl font-bold text-blue-600'>
                  June 11, 2025 → June 15, 2025
                </p>
                <span className='absolute right-5 top-5 rounded-md bg-green-100 px-5 py-2 text-4xl font-semibold text-green-800'>
                  NEW
                </span>
              </div>

              <div className='mt-16 grid grid-cols-3 gap-12'>
                <div className='flex flex-col gap-8 rounded-2xl bg-white p-10 shadow-lg'>
                  <div className='flex items-center gap-4'>
                    <Send className='h-14 w-14 text-purple-600' />
                    <h3 className='text-6xl font-bold'>Submission</h3>
                  </div>

                  <DateItem
                    title='Paper Submission Deadline'
                    date='November 15, 2024'
                  />
                </div>
                <div className='flex flex-col gap-8 rounded-2xl bg-white p-10 shadow-lg'>
                  <div className='flex items-center gap-4'>
                    <Bell className='h-14 w-14 text-yellow-500' />
                    <h3 className='text-6xl font-bold'>Notification</h3>
                  </div>
                  <DateItem title='Reviews Released' date='January 23, 2025' />
                </div>
                <div className='flex flex-col gap-8 rounded-2xl bg-white p-10 shadow-lg'>
                  <div className='flex items-center gap-4'>
                    <Camera className='h-14 w-14 text-red-500' />
                    <h3 className='text-6xl font-bold'>Camera-Ready</h3>
                  </div>
                  <DateItem
                    title='Camera Ready Deadline'
                    date='March 25, 2025'
                  />
                </div>
              </div>
            </div>

            {/* Map Content - tăng chiều cao của map */}
            <div id='map' className='rounded-2xl border-2 border-gray-200 p-8'>
              <h2 className='mb-8 text-7xl font-bold'>Map</h2>
              <div className='h-[900px] w-full overflow-hidden rounded-2xl'>
                <MapPoster location={conferenceLocation} />
              </div>
            </div>
          </div>
        </div>

        {/* Conference Feedback Section */}
        <div className='mt-24 border-t-2 border-gray-200 pt-20'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-7xl font-bold'>Conference Feedback</h2>
              <p className='mt-4 text-5xl '>
                Showing 0 of 0 Conference Reviews
              </p>
            </div>
            <div className='flex gap-6'>
              <select className='rounded-xl border-2 border-gray-300 px-6 py-3 text-5xl shadow-sm'>
                <option>All Feedback</option>
              </select>
              <select className='rounded-xl border-2 border-gray-300 px-6 py-3 text-5xl shadow-sm'>
                <option>Recently Added</option>
              </select>
            </div>
          </div>
          <div className='mt-16 rounded-2xl border-2 border-gray-200 p-8'>
            <div className='flex flex-row gap-8'>
              <div className='w-1/3 border-r-2 pr-16'>
                <p className='text-9xl font-bold'>0.0</p>
                <div className='my-4 flex text-gray-300'>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className='h-16 w-16 fill-current' />
                  ))}
                </div>
                <p className='text-5xl '>No reviews yet</p>
                <div className='mt-8 space-y-3'>
                  {[5, 4, 3, 2, 1].map(rating => (
                    <div key={rating} className='flex items-center gap-4'>
                      <span className='text-5xl '>{rating} ★</span>
                      <div className='h-5 w-full flex-1 rounded-full bg-gray-200'></div>
                      <span className='w-8 text-right text-5xl '>0</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className='flex flex-1 items-center justify-center'>
                <p className='text-6xl '>No feedback yet.</p>
              </div>
            </div>
          </div>
          <div className='mt-16 rounded-2xl border-2 border-gray-200 p-8'>
            <textarea
              className='w-full rounded-xl border-2 border-gray-300 p-6 text-5xl shadow-sm focus:border-blue-500 focus:ring-blue-500'
              rows={5}
              placeholder='Write your feedback...'
            ></textarea>
            <button className='mt-8 rounded-xl bg-blue-600 px-12 py-6 text-5xl font-semibold text-white hover:bg-blue-700'>
              Post Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConferenceDetailInterface
