// src/app/[locale]/conferences/detail/ConferenceFeedback.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { ConferenceResponse } from '../../../../models/response/conference.response';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import useAddFeedback from '../../../../hooks/conferenceDetails/useAddFeedBack';
import useGetFeedBack from '@/src/hooks/conferenceDetails/useGetFeedBack';
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
  const { isLoggedIn, isInitializing: isAuthInitializing, user, logout } = useAuth();

  // --- Effects ---
  // useEffect(() => {
  //   setIsClient(true); // Không cần nữa
  // }, []);

  // --- Data Preparation ---
  const conferenceId = conferenceData?.id;

  const {feedbackResponse, error: fetchFeedbacksError, isLoading: loadingFeedbacks} = useGetFeedBack(conferenceId, newFeedback);
  const rawFeedbacks = feedbackResponse ?? [];

  const allFeedbacks: Feedback[] = useMemo(() => {
    if (!rawFeedbacks) return []; // Nếu rawFeedbacks là undefined, trả về mảng rỗng
    return rawFeedbacks.map((fbResponse): Feedback => ({
      id: fbResponse.id,
      organizedId: fbResponse.conferenceId, // Giả định: organizedId là conferenceId
      creatorId: fbResponse.creatorId,
      firstName: fbResponse.firstName,
      lastName: fbResponse.lastName,
      avatar: fbResponse.avatar ?? 'avatar1.png', // Cung cấp giá trị mặc định
      description: fbResponse.description,
      star: fbResponse.star,
      createdAt: fbResponse.createdAt,
      updatedAt: fbResponse.updatedAt,
    }));
  }, [rawFeedbacks]);

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
  }, [filterStar, sortOption, allFeedbacks.length]);


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
  if (loadingFeedbacks) {
    message = t('loading_feedbacks');
  } else if (fetchFeedbacksError) {
    message = t('error_fetching_feedbacks', { error: fetchFeedbacksError });
  } else if (paginatedFeedbacks.length > 0) {
    message = '';
  } else if (displayedFeedbacks.length === 0) {
    if (filterStar !== null) {
      message = t('no_feedback_matching_filter', { starCount: filterStar });
    } else {
      message = t('no_feedback_yet');
    }
  } else {
    message = t('no_feedback_on_page');
  }

  // if (feedbackError === 'User is banned')
  // {
  //   return <div className='flex h-screen items-center justify-center'>
  //     Your account is banned, you'll automatically logout
  //   </div>
  // }

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
          {/* Hiển thị FeedbackSummary */}
          {loadingFeedbacks && !allFeedbacks.length ? (
            <div className="text-center py-4">{t('loading_summary')}</div>
          ) : !loadingFeedbacks && !fetchFeedbacksError ? (
            <FeedbackSummary
              overallRating={overallRating}
              ratingDistribution={ratingDistribution}
              totalReviews={allFeedbacks.length}
            />
          ) : null}
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
            {message && (loadingFeedbacks || fetchFeedbacksError || paginatedFeedbacks.length === 0) && ( // Chỉ hiển thị message nếu trang hiện tại rỗng
              <div className='pt-4 text-center '>{message}</div>
            )}
            {!loadingFeedbacks && !fetchFeedbacksError && paginatedFeedbacks.map(feedback => (
              <FeedbackItem key={feedback.id} feedback={feedback} />
            ))}
          </div>

          {!loadingFeedbacks && !fetchFeedbacksError && totalPages > 1 && (
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