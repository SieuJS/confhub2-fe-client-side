// ConferenceFeedback.tsx
import React, { useState } from 'react'
import { ConferenceResponse } from '../../../../models/response/conference.response'
import Image from 'next/image'
import useAddFeedback from '../../../../hooks/conferenceDetails/useAddFeedBack'
// import { useLocalStorage } from 'usehooks-ts'; // REMOVE
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import useAuthApi from '@/src/hooks/auth/useAuthApi' // Import useAuthApi

interface ConferenceFeedbackProps {
  conferenceData: ConferenceResponse | null
}

const ConferenceFeedback: React.FC<ConferenceFeedbackProps> = ({
  conferenceData
}) => {
  const [sortBy, setSortBy] = useState<'all' | 'recent'>('all')
  const [description, setDescription] = useState('')
  const [star, setStar] = useState<number | null>(null)
  const { submitFeedback, loading, error, newFeedback } = useAddFeedback()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Use useAuthApi for authentication
  const { isLoggedIn } = useAuthApi()

  const conferenceId = conferenceData?.conference.id
  const feedbacks = conferenceData?.feedBacks ?? []

  let sortedFeedbacks = [...feedbacks]
  if (sortBy === 'recent') {
    sortedFeedbacks.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0)
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0)
      return dateB.getTime() - dateA.getTime()
    })
  }

  if (newFeedback) {
    let insertIndex = 0
    if (sortBy === 'recent') {
      const newFeedbackDate = newFeedback.createdAt
        ? new Date(newFeedback.createdAt)
        : new Date(0)
      while (insertIndex < sortedFeedbacks.length) {
        const existingFeedback = sortedFeedbacks[insertIndex]
        if (existingFeedback && existingFeedback.createdAt) {
          const existingFeedbackDate = new Date(existingFeedback.createdAt)
          if (newFeedbackDate.getTime() > existingFeedbackDate.getTime()) {
            break
          }
        } else {
          break
        }
        insertIndex++
      }
    }
    sortedFeedbacks.splice(insertIndex, 0, newFeedback)
  }

  const calculateOverallRating = () => {
    if (feedbacks.length === 0) return 0
    const totalStars = feedbacks.reduce(
      (sum, feedback) => sum + (feedback.star ?? 0),
      0
    )
    return totalStars / feedbacks.length
  }

  const calculateRatingDistribution = () => {
    const distribution: { [key: number]: number } = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    }
    feedbacks.forEach(feedback => {
      const star = feedback.star ?? 0
      if (star >= 1 && star <= 5) {
        distribution[star]++
      } else {
        console.warn(`Invalid star rating: ${star}`)
      }
    })
    return distribution
  }

  const overallRating = calculateOverallRating()
  const ratingDistribution = calculateRatingDistribution()
  const totalReviews = feedbacks.length

  const getStars = (starCount: number) => {
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push(i < starCount ? '★' : '☆')
    }
    return stars
  }

  const handleStarClick = (selectedStar: number) => {
    setStar(selectedStar)
  }

  const handleSubmit = async () => {
    if (!conferenceId) {
      console.error('conferenceId is missing')
      return
    }
    if (star === null || description.trim() === '') {
      alert('Please select a rating and write a review.')
      return
    }

    const addedFeedback = await submitFeedback(conferenceId, description, star)
    if (addedFeedback) {
      setDescription('')
      setStar(null)
    }
  }

  const handleSignInClick = () => {
    const localePrefix = pathname.split('/')[1]
    const fullUrl = `${pathname}?${searchParams.toString()}`
    localStorage.setItem('returnUrl', fullUrl)
    const pathWithLocale = `/${localePrefix}/auth/login`
    router.push(pathWithLocale)
  }

  return (
    <div className='container mx-auto rounded-lg px-4 py-6 sm:px-6 lg:px-8'>
      {' '}
      {/* Thêm padding ngang responsive */}
      {/* Header Section */}
      <div className='mb-6 flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0'>
        <div>
          <h2 className='text-2xl font-semibold '>Conference Feedback</h2>
          <div className='text-sm text-gray-600'>
            {' '}
            {/* Thêm màu cho dễ nhìn */}
            Showing {totalReviews} Conference Reviews
          </div>
        </div>
        <div className='flex space-x-2'>
          <button
            className={`rounded-md px-3 py-2 text-sm ${
              sortBy === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200' // Cải thiện contrast
            }`}
            onClick={() => setSortBy('all')}
          >
            All Feedback
          </button>
          <button
            className={`rounded-md px-3 py-2 text-sm ${
              sortBy === 'recent'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200' // Cải thiện contrast
            }`}
            onClick={() => setSortBy('recent')}
          >
            Recently Added
          </button>
        </div>
      </div>
      {/* Main Content Area - Responsive Layout */}
      {/* Sử dụng flex-col mặc định (mobile first), md:flex-row cho màn hình vừa trở lên */}
      <div className='flex flex-col md:flex-row md:space-x-8'>
        {' '}
        {/* Thêm space-x cho desktop */}
        {/* === Cột Bên Trái (Chứa Rating & Description) === */}
        {/* w-full mặc định, md:w-1/2 cho desktop. Thêm mb-8 khi xếp chồng, md:mb-0 khi cạnh nhau */}
        <div className='mb-8 w-full md:mb-0 md:w-1/2'>
          {/* Overall Rating & Bars */}
          <div className='mb-6 flex flex-col items-start sm:flex-row'>
            {' '}
            {/* Stack trên mobile nhỏ hơn, row trên sm+ */}
            {/* Rating Score & Stars */}
            <div className='mb-4 sm:mb-0 sm:mr-8'>
              {' '}
              {/* Margin bottom khi stack, margin right khi row */}
              <div className='text-4xl font-bold '>
                {overallRating.toFixed(1)}
              </div>
              <div className='flex text-yellow-500'>
                {getStars(Math.round(overallRating)).map((star, index) => (
                  <span key={index}>{star}</span>
                ))}
              </div>
              <div className='text-sm text-gray-600'>
                based on {totalReviews} reviews
              </div>
            </div>
            {/* Rating Bars */}
            <div className='w-full flex-1'>
              {' '}
              {/* Đảm bảo chiếm đủ không gian còn lại hoặc toàn bộ width khi stack */}
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className='mb-2 flex items-center'>
                  <div className='w-10 text-sm font-medium text-gray-700'>
                    {' '}
                    {/* Thêm màu */}
                    {star}{' '}
                    <span className='ml-1 inline-block text-xs text-yellow-500'>
                      ★
                    </span>
                  </div>
                  <div className='relative mx-2 h-4 flex-1 rounded-sm bg-gray-200'>
                    <div
                      className='absolute h-4 rounded-sm' // Bỏ bg-yellow-500 ở đây
                      style={{
                        width: `${totalReviews > 0 ? (ratingDistribution[star] / totalReviews) * 100 : 0}%`,
                        // Màu sắc dựa trên star
                        backgroundColor:
                          star >= 4
                            ? '#22c55e' // green-500
                            : star === 3
                              ? '#eab308' // yellow-500
                              : star === 2
                                ? '#f97316' // orange-500
                                : '#ef4444' // red-500
                      }}
                    ></div>
                  </div>
                  <div className='w-16 text-right text-sm text-gray-600'>
                    {ratingDistribution[star]} reviews
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Description - Luôn hiển thị, vị trí được kiểm soát bởi flex parent */}
          <div className='hidden text-sm text-gray-700 md:block'>
            {' '}
            {/* Bỏ mb-6 nếu không cần thêm khoảng cách */}
            Conference feedback helps us understand what attendees valued most
            and identify areas for improvement in future events. Our rating
            system considers factors like the recency of the feedback and the
            attendees overall experience.
          </div>
        </div>{' '}
        {/* === Hết Cột Bên Trái === */}
        {/* === Cột Bên Phải (Chứa Comments & Form) === */}
        {/* w-full mặc định, md:w-1/2 cho desktop */}
        <div className='w-full md:w-1/2'>
          {/* Feedback Comments */}
          <div className='mb-8 space-y-4'>
            {sortedFeedbacks.length === 0 ? (
              <div className='text-center text-gray-500'>No feedback yet.</div>
            ) : (
              sortedFeedbacks.map(feedback => (
                <div
                  key={feedback.id}
                  className='rounded-md border border-gray-200 bg-white p-4' // Thêm bg-white nếu nền khác
                >
                  <div className='mb-2 flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0'>
                    {' '}
                    {/* Responsive cho header comment */}
                    <div className='flex items-center'>
                      <Image
                        src={feedback.avatar} // Use a generic placeholder
                        alt='User Avatar'
                        width={30}
                        height={30}
                        className='mr-2 h-8 w-8 rounded-full object-cover' // Thêm object-cover
                      />

                      <div className='font-medium text-gray-800'>
                        {' '}
                        {`${feedback.firstName} ${feedback.lastName}` || 'Unknown'}
                      </div>
                    </div>
                    <div className='flex text-yellow-500'>
                      {getStars(feedback.star ?? 0).map((star, index) => (
                        <span key={index}>{star}</span>
                      ))}
                    </div>
                  </div>
                  <div className='mb-2 text-xs text-gray-500'>
                    {' '}
                    {/* Giảm cỡ chữ ngày tháng */}
                    {feedback.createdAt
                      ? `${new Date(feedback.createdAt).toLocaleDateString()} ${new Date(feedback.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` // Định dạng giờ phút
                      : 'Date Unavailable'}
                  </div>
                  <div className='mb-3 text-gray-700'>
                    {feedback.description}
                  </div>{' '}
                  {/* Thêm màu */}
                  <div className='flex items-center justify-between'>
                    {/* Phần Reply/Report có thể ẩn trên mobile nếu cần */}
                    <div className='text-sm text-blue-600'>
                      {' '}
                      {/* Màu cho link/button */}
                      <button className='mr-4 hover:underline'>Reply</button>
                      <button className='hover:underline'>Report</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Post Feedback Section */}
          {isLoggedIn ? (
            <div className='border-t border-gray-200 pt-6'>
              <div className='mb-3 font-medium text-gray-800'>
                Rate the Conference:
              </div>{' '}
              {/* Thêm màu */}
              <div className='mb-4 flex text-3xl'>
                {' '}
                {/* Bỏ text-yellow-500 ở đây */}
                {[1, 2, 3, 4, 5].map(starValue => (
                  <span
                    key={starValue}
                    onClick={() => handleStarClick(starValue)}
                    // Thay đổi màu dựa trên state 'star' và hover
                    className={`cursor-pointer transition-colors ${
                      star !== null && starValue <= star
                        ? 'text-yellow-500' // Màu khi được chọn
                        : 'text-gray-300 hover:text-yellow-400' // Màu mặc định và khi hover
                    }`}
                  >
                    ★ {/* Luôn hiển thị sao đầy */}
                  </span>
                ))}
              </div>
              <textarea
                placeholder='Write your feedback...'
                className='mb-4 w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-blue-500'
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
              <div className='flex items-center justify-end'>
                {' '}
                {/* Đẩy nút sang phải */}
                {/* <div className='flex space-x-2'></div> */}
                <button
                  className='rounded-md bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600 disabled:opacity-50' // Thêm style disabled
                  onClick={handleSubmit}
                  disabled={loading || !star || !description.trim()} // Vô hiệu hóa nếu đang tải, chưa chọn sao hoặc chưa nhập mô tả
                >
                  {loading ? 'Posting...' : 'Post Feedback'}
                </button>
              </div>
              {error && <p className='mt-2 text-sm text-red-500'>{error}</p>}{' '}
              {/* Thêm text-sm */}
            </div>
          ) : (
            <div className='border-t border-gray-200 pt-6 text-center sm:text-left'>
              {' '}
              {/* Canh giữa trên mobile */}
              <p className='mb-2 text-gray-600'>
                Want to share your feedback?
              </p>{' '}
              {/* Giảm mb */}
              <p className='mb-4 text-gray-600'>
                Please sign in to post your feedback.
              </p>
              <button
                className='rounded-md bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600'
                onClick={handleSignInClick}
              >
                Sign In
              </button>
            </div>
          )}
        </div>{' '}
        {/* === Hết Cột Bên Phải === */}
      </div>{' '}
      {/* Hết Main Content Area */}
    </div>
  )
}

export default ConferenceFeedback
