// hooks/useAddFeedback.ts
import { useState, useCallback } from 'react';
import { getFeedBack } from '../../app/apis/conference/getFeedBack'; // Path to your API function
import { FeedbackResponse } from '../../models/response/feedback.list.response';

interface UseGetFeedbackProps {
  initialData?: FeedbackResponse;
}

const useGetFeedBack = (conferenceId: string, { initialData }: UseGetFeedbackProps = {}) => {
    const [feedbacks, setFeedbacks] = useState<FeedbackResponse | undefined>(initialData);
    const [error, setError] = useState<string | null>(null)
    const fetchFeedback = (async () => {
        try {
            const data = await getFeedBack(conferenceId); // Gọi API.
            setFeedbacks(data);
        } catch (error: any) {
        console.error("Failed to fetch conferences:", error);
            setError(error.message); // Lấy message từ error object.
        }
  });

  return {
    feedbacks,
    error
  }
}
export default useGetFeedBack;
