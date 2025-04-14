// ConferenceFeedback.tsx
import React, { useState, useMemo } from 'react'
import { ConferenceResponse } from '../../../../models/response/conference.response' // Adjust path
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import useAddFeedback from '../../../../hooks/conferenceDetails/useAddFeedBack' // Adjust path
import useAuthApi from '@/src/hooks/auth/useAuthApi' // Adjust path
import { Feedback, SortOption } from '../../../../models/send/feedback.send'
import GeneralPagination from '../../utils/GeneralPagination'
// Import Hooks
import { useProcessedFeedbacks } from '@/src/hooks/conferenceDetails/feedback/useProcessedFeedbacks' // Adjust path

// Import Utils
import {
  calculateOverallRating,
  calculateRatingDistribution
} from './feedback/utils/feedbackUtils' // Adjust path

// Import Components
import FeedbackControls from './feedback/FeedbackControls' // Adjust path
import FeedbackSummary from './feedback/FeedbackSummary' // Adjust path
import FeedbackItem from './feedback/FeedbackItem' // Adjust path
import FeedbackForm from './feedback/FeedbackForm' // Adjust path
import SignInPrompt from './feedback/SignInPrompt' // Adjust path
import { useTranslations } from 'next-intl'

interface ConferenceFeedbackProps {
  conferenceData: ConferenceResponse | null
}

const ITEMS_PER_PAGE = 5 // Define how many feedbacks per page

const ConferenceFeedback: React.FC<ConferenceFeedbackProps> = ({
  conferenceData
}) => {
  const t = useTranslations('feedback')

  // --- State ---
  const [filterStar, setFilterStar] = useState<number | null>(null)
  const [sortOption, setSortOption] = useState<SortOption>('time')
  const [description, setDescription] = useState('')
  const [star, setStar] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1) // State for pagination

  // --- Hooks ---
  const { submitFeedback, loading, error, newFeedback } = useAddFeedback()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isLoggedIn } = useAuthApi()

  // --- Data Preparation ---
  const conferenceId = conferenceData?.id
  const baseFeedbacks = conferenceData?.feedbacks ?? []

  // Combine base feedbacks and new feedback (if any)
  const allFeedbacks = useMemo(() => {
    const combined: Feedback[] = [...baseFeedbacks] // Ensure type
    if (newFeedback && !combined.some(f => f.id === newFeedback.id)) {
      combined.unshift(newFeedback) // Add to beginning
    }
    return combined
  }, [baseFeedbacks, newFeedback])

  // Filter and Sort Feedbacks using custom hook
  const displayedFeedbacks = useProcessedFeedbacks(
    allFeedbacks,
    filterStar,
    sortOption
  )

  // --- Pagination Logic ---
  const totalPages = Math.ceil(displayedFeedbacks.length / ITEMS_PER_PAGE)

  // Get the feedbacks for the *current* page using slice
  const paginatedFeedbacks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return displayedFeedbacks.slice(startIndex, endIndex)
  }, [displayedFeedbacks, currentPage])

  // Handler for the Pagination component
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Optional: Scroll to top of feedback list when page changes
    // window.scrollTo({ top: feedbackListRef.current?.offsetTop, behavior: 'smooth' });
  }

  // Reset page to 1 when filters/sort change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [filterStar, sortOption])

  const totalReviews = displayedFeedbacks.length // Total *filtered/sorted* reviews

  // --- Calculations (Based on *all* feedbacks) ---
  // Use useMemo to recalculate only when allFeedbacks changes
  const { overallRating, ratingDistribution } = useMemo(() => {
    const reviews = allFeedbacks
    return {
      overallRating: calculateOverallRating(reviews),
      ratingDistribution: calculateRatingDistribution(reviews)
    }
  }, [allFeedbacks])

  // --- Event Handlers ---
  const handleStarClick = (selectedStar: number) => {
    setStar(selectedStar)
  }

  const handleSubmit = async () => {
    if (!conferenceId || star === null || description.trim() === '') {
      alert('Please select a rating and write a review.')
      console.error('Missing conferenceId, star, or description', {
        conferenceId,
        star,
        description
      })
      return
    }

    const addedFeedback = await submitFeedback(conferenceId, description, star)
    if (addedFeedback) {
      setDescription('')
      setStar(null)
      // `allFeedbacks` will update via `newFeedback`, triggering `useProcessedFeedbacks`
    }
  }

  const handleSignInClick = () => {
    const localePrefix = pathname.split('/')[1] || 'en'
    const fullUrl = `${pathname}?${searchParams.toString()}`
    try {
      localStorage.setItem('returnUrl', fullUrl)
    } catch (e) {
      console.error('Failed to set returnUrl in localStorage', e)
    }
    const pathWithLocale = `/${localePrefix}/auth/login`
    router.push(pathWithLocale)
  }

  let message
  if (displayedFeedbacks.length > 0) {
    message = t('no_feedback_on_page')
  } else {
    if (filterStar !== null) {
      message = t('no_feedback_matching_filter', { starCount: filterStar })
    } else {
      message = t('no_feedback_yet')
    }
  }

  // --- Render ---
  return (
    <div className='container mx-auto rounded-lg px-2 py-2 sm:px-4 lg:px-6'>
      <FeedbackControls
        filterStar={filterStar}
        sortOption={sortOption}
        totalReviews={allFeedbacks.length} // Show total unfiltered count here maybe?
        displayedCount={displayedFeedbacks.length} // Or show filtered count
        onFilterChange={setFilterStar}
        onSortChange={setSortOption}
      />

      {/* Main Content Area */}
      <div className='flex flex-col md:flex-row md:space-x-8'>
        <div className=''>
          <FeedbackSummary
            overallRating={overallRating}
            ratingDistribution={ratingDistribution}
            totalReviews={totalReviews}
          />

          {/* Post Feedback Section or Sign In Prompt */}
          {isLoggedIn ? (
            <FeedbackForm
              star={star}
              description={description}
              loading={loading}
              error={error}
              onStarClick={handleStarClick}
              onDescriptionChange={setDescription}
              onSubmit={handleSubmit}
            />
          ) : (
            <SignInPrompt onSignInClick={handleSignInClick} />
          )}
        </div>

        {/* === Right Column (Comments & Form/Prompt) === */}
        <div className='w-full md:w-1/2'>
          {/* Feedback Comments List - Use *paginated* feedbacks */}
          <div className='mb-8 space-y-4'>
            {paginatedFeedbacks.length === 0 ? (
              <div className='text-center '>{message}</div>
            ) : (
              // Use paginatedFeedbacks here
              paginatedFeedbacks.map(feedback => (
                <FeedbackItem key={feedback.id} feedback={feedback} />
              ))
            )}
          </div>

          {/* Render Pagination Component */}
          <GeneralPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            // You can optionally pass maxPageNumbersToShow or className here
            // maxPageNumbersToShow={7}
            className='mb-4'
          />
        </div>
      </div>
    </div>
  )
}

export default ConferenceFeedback
