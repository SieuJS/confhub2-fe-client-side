// src/app/[locale]/conferences/detail/ConferenceFeedback.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { ConferenceResponse } from '../../../../models/response/conference.response';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import useAddFeedback from '../../../../hooks/conferenceDetails/useAddFeedBack';
import { useAuth } from '@/src/contexts/AuthContext'; // <<<< THAY ĐỔI QUAN TRỌNG
import { Feedback, SortOption } from '../../../../models/send/feedback.send';
import GeneralPagination from '../../utils/GeneralPagination';
import { useProcessedFeedbacks } from '@/src/hooks/conferenceDetails/useProcessedFeedbacks';
import {
  calculateOverallRating,
  calculateRatingDistribution
} from './feedback/utils/feedbackUtils';
import FeedbackControls from './feedback/FeedbackControls';
import FeedbackSummary from './feedback/FeedbackSummary';
import FeedbackItem from './feedback/FeedbackItem';
import FeedbackForm from './feedback/FeedbackForm';
import SignInPrompt from './feedback/SignInPrompt';
import { useTranslations } from 'next-intl';

interface ConferenceFeedbackProps {
  conferenceData: ConferenceResponse | null;
}

const ITEMS_PER_PAGE = 5;

const ConferenceFeedback: React.FC<ConferenceFeedbackProps> = ({
  conferenceData
}) => {
  const t = useTranslations('feedback');

  // --- State ---
  const [filterStar, setFilterStar] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('time');
  const [description, setDescription] = useState('');
  const [star, setStar] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  // const [isClient, setIsClient] = useState(false); // Không cần isClient nữa nếu dùng isInitializing từ useAuth

  // --- Hooks ---
  const { submitFeedback, loading, error: feedbackError, newFeedback } = useAddFeedback(); // Đổi tên error để tránh trùng
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // <<<< THAY ĐỔI QUAN TRỌNG: Sử dụng useAuth từ Context
  // isInitializing cho biết AuthProvider có đang trong quá trình kiểm tra auth ban đầu hay không
  const { isLoggedIn, isInitializing: isAuthInitializing, user } = useAuth();

  // --- Effects ---
  // useEffect(() => {
  //   setIsClient(true); // Không cần nữa
  // }, []);

  // --- Data Preparation ---
  const conferenceId = conferenceData?.id;
  const baseFeedbacks = conferenceData?.feedbacks ?? [];

  const allFeedbacks = useMemo(() => {
    const combined: Feedback[] = [...baseFeedbacks];
    if (newFeedback && !combined.some(f => f.id === newFeedback.id)) {
      combined.unshift(newFeedback);
    }
    return combined;
  }, [baseFeedbacks, newFeedback]);

  const displayedFeedbacks = useProcessedFeedbacks(
    allFeedbacks,
    filterStar,
    sortOption
  );

  // --- Pagination Logic ---
  const totalPages = Math.ceil(displayedFeedbacks.length / ITEMS_PER_PAGE);

  const paginatedFeedbacks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return displayedFeedbacks.slice(startIndex, endIndex);
  }, [displayedFeedbacks, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStar, sortOption]);

  const totalReviews = displayedFeedbacks.length;

  // --- Calculations ---
  const { overallRating, ratingDistribution } = useMemo(() => {
    return {
      overallRating: calculateOverallRating(allFeedbacks),
      ratingDistribution: calculateRatingDistribution(allFeedbacks)
    };
  }, [allFeedbacks]);

  // --- Event Handlers ---
  const handleStarClick = (selectedStar: number) => {
    setStar(selectedStar);
  };

  const handleSubmit = async () => {
    if (!conferenceId || star === null || description.trim() === '') {
      console.error('Missing conferenceId, star, or description');
      return;
    }
    // Kiểm tra xem user có tồn tại không trước khi gửi feedback
    if (!user || !user.id) {
        console.error('User is not available for submitting feedback.');
        // Có thể hiển thị thông báo lỗi cho người dùng
        return;
    }

    const addedFeedback = await submitFeedback(conferenceId, description, star); // submitFeedback có thể cần userId từ `user.id`
    if (addedFeedback) {
      setDescription('');
      setStar(null);
      // Có thể fetch lại feedbacks hoặc dựa vào newFeedback để cập nhật UI
    }
  };

  const handleSignInClick = () => {
    const localePrefix = pathname.split('/')[1] || 'en';
    const fullUrl = `${pathname}?${searchParams.toString()}`;
    try {
      localStorage.setItem('returnUrl', fullUrl);
    } catch (e) {
      console.error('Failed to set returnUrl in localStorage', e);
    }
    const pathWithLocale = `/${localePrefix}/auth/login`;
    router.push(pathWithLocale);
  };

  let message;
  if (paginatedFeedbacks.length > 0) {
    message = ''; // No message needed if there are feedbacks on the current page
  } else if (displayedFeedbacks.length === 0) {
    if (filterStar !== null) {
      message = t('no_feedback_matching_filter', { starCount: filterStar });
    } else {
      message = t('no_feedback_yet');
    }
  } else {
    message = t('no_feedback_on_page');
  }

  // --- Render ---
  // Hiển thị loading cho đến khi AuthProvider khởi tạo xong
  // Bạn có thể muốn một UI loading tinh tế hơn cho phần feedback này
  if (isAuthInitializing) {
    return (
      <div className="container mx-auto rounded-lg px-2 py-6 text-center sm:px-4 lg:px-6">
        Loading feedback section...
      </div>
    );
  }

  return (
    <div className='container mx-auto rounded-lg px-2 py-2 sm:px-4 lg:px-6'>
      <FeedbackControls
        filterStar={filterStar}
        sortOption={sortOption}
        totalReviews={allFeedbacks.length}
        displayedCount={displayedFeedbacks.length}
        onFilterChange={setFilterStar}
        onSortChange={setSortOption}
      />

      <div className='mt-6 flex flex-col gap-8 md:flex-row md:gap-8'>
        <div className='w-full md:w-1/2'>
          <FeedbackSummary
            overallRating={overallRating}
            ratingDistribution={ratingDistribution}
            totalReviews={allFeedbacks.length}
          />
          <div className='mt-6'>
            {/*
              Render dựa trên isLoggedIn thực tế sau khi AuthProvider đã khởi tạo.
              Không cần isClient nữa vì isAuthInitializing đã đảm bảo client-side context sẵn sàng.
            */}
            {isLoggedIn ? (
              <FeedbackForm
                star={star}
                description={description}
                loading={loading} // Loading từ useAddFeedback
                error={feedbackError} // Error từ useAddFeedback
                onStarClick={handleStarClick}
                onDescriptionChange={setDescription}
                onSubmit={handleSubmit}
              />
            ) : (
              <SignInPrompt onSignInClick={handleSignInClick} />
            )}
          </div>
        </div>

        <div className='w-full md:w-1/2 '>
          <div className='space-y-4'>
            {message && paginatedFeedbacks.length === 0 && ( // Chỉ hiển thị message nếu trang hiện tại rỗng
              <div className='pt-4 text-center '>{message}</div>
            )}
            {paginatedFeedbacks.map(feedback => (
              <FeedbackItem key={feedback.id} feedback={feedback} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className='mt-6 flex justify-center'>
              <GeneralPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConferenceFeedback;