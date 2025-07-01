// hooks/useGetFeedback.ts
import { useState, useEffect, useCallback } from 'react';
import { getFeedBack } from '../../app/apis/conference/getFeedBack'; // Path to your API function
import { FeedbackResponse } from '../../models/response/feedback.list.response';
import { Feedback } from '@/src/models/send/feedback.send';


const useGetFeedBack = (
  conferenceId?: string, 
  newFeedback?: Feedback | null
) => {
    const [feedbackResponse, setFeedbackResponse] = useState<FeedbackResponse[] | undefined>();
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true);
    const fetchFeedback = useCallback(async () => {
      if (!conferenceId) {
      // Nếu không có conferenceId, không fetch và reset state
        setFeedbackResponse([]);
        setIsLoading(false);
      return;
      }
        try {
            const data = await getFeedBack(conferenceId); // Gọi API.
            setFeedbackResponse(data);
        } catch (error: any) {
        // console.error("Failed to fetch conferences:", error);
            setError(error.message); // Lấy message từ error object.
            setFeedbackResponse([]);
        } finally {
          setIsLoading(false);
      }
  }, [conferenceId]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback, newFeedback]);

  return {
    feedbackResponse,
    isLoading,
    error
  }
}
export default useGetFeedBack;
