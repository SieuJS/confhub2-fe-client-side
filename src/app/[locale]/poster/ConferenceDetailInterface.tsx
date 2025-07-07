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
              <div className='h-[500px] w-full overflow-hidden rounded-2xl'>
                <MapPoster location={conferenceLocation} />
              </div>
            </div>
          </div>
        </div>

        {/* --- START: PHẦN CONFERENCE FEEDBACK ĐÃ ĐƯỢC ĐIỀU CHỈNH KÍCH THƯỚC --- */}
        <div className='mt-20 border-t-2 border-gray-200 pt-16 font-sans'>
          {/* Header với tiêu đề và bộ lọc */}
          <div className='flex flex-wrap items-center justify-between gap-8'>
            <div>
              <h2 className='text-7xl font-bold text-gray-800'>
                Conference Feedback
              </h2>
              <p className='mt-4 text-5xl text-gray-500'>
                Showing 1 of 1 Conference Review
              </p>
            </div>
            <div className='flex items-center gap-6'>
              <select className='rounded-xl border-2 border-gray-300 bg-gray-100 px-8 py-4 text-5xl text-gray-700 shadow-lg focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'>
                <option>All Feedback</option>
              </select>
              <select className='rounded-xl border-2 border-gray-300 bg-gray-100 px-8 py-4 text-5xl text-gray-700 shadow-lg focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'>
                <option>Recently Added</option>
              </select>
            </div>
          </div>

          <div className='mt-16 grid grid-cols-2 gap-x-24 gap-y-16'>
            {/* Bên trái: Tổng kết đánh giá */}
            <div className='col-span-1'>
              <p className='text-9xl font-bold text-gray-800'>5.0</p>
              <div className='my-4 flex text-yellow-400'>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className='h-14 w-14 fill-current' />
                ))}
              </div>
              <p className='text-4xl text-gray-500'>Based on 1 review</p>
              <div className='mt-8 space-y-4'>
                {[
                  { rating: 5, count: 1, percentage: 100 },
                  { rating: 4, count: 0, percentage: 0 },
                  { rating: 3, count: 0, percentage: 0 },
                  { rating: 2, count: 0, percentage: 0 },
                  { rating: 1, count: 0, percentage: 0 }
                ].map(({ rating, count, percentage }) => (
                  <div key={rating} className='flex items-center gap-6'>
                    <span className='w-24 text-4xl text-gray-600'>
                      {rating} ★
                    </span>
                    <div className='h-6 flex-1 rounded-full bg-gray-200'>
                      <div
                        className={`h-full rounded-full ${
                          percentage > 0 ? 'bg-green-500' : ''
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className='w-12 text-right text-4xl text-gray-600'>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bên phải: Danh sách review */}
            <div className='col-span-1'>
              <div className='rounded-2xl border-2 border-gray-200 p-8'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-6'>
                    <img
                      src='/avatar-placeholder.png' // Sử dụng ảnh placeholder
                      alt='Reviewer Avatar'
                      className='h-24 w-24 rounded-full bg-gray-300' // Tăng kích thước và thêm bg
                    />
                    <div>
                      <p className='text-5xl font-semibold text-gray-800'>
                        Nguyễn Hữu Thắng
                      </p>
                      <p className='mt-2 text-4xl text-gray-500'>
                        3/7/2025 08:32
                      </p>
                    </div>
                  </div>
                  <div className='flex shrink-0 text-yellow-400'>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className='h-10 w-10 fill-current' />
                    ))}
                  </div>
                </div>
                <p className='mt-6 text-5xl text-gray-700'>Hay</p>
              </div>
            </div>
          </div>

          {/* Dấu ngăn cách */}
          <div className='my-16 border-t-2 border-gray-200'></div>

          {/* Form gửi feedback */}
          <div>
            <textarea
              className='w-full rounded-2xl border-2 border-gray-300 p-8 text-5xl shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
              rows={5}
              placeholder='Write your feedback...'
            ></textarea>
            <button className='mt-8 rounded-xl bg-[#4DB6AC] px-10 py-5 text-5xl font-semibold text-white shadow-lg transition-colors hover:bg-[#26A69A] focus:outline-none focus:ring-2 focus:ring-[#4DB6AC] focus:ring-offset-2'>
              Post Feedback
            </button>
          </div>
        </div>
        {/* --- END: PHẦN CONFERENCE FEEDBACK --- */}
      </div>
    </div>
  )
}

export default ConferenceDetailInterface
