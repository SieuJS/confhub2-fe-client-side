// src/app/apis/chatbot/chatbot.ts
import { ChatMessageType } from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import { FeedbackFormData } from '@/src/app/[locale]/chatbot/regularchat/feedback/FeedbackModal';
import { appConfig } from '@/src/middleware';

interface FeedbackPayload {
  feedback: FeedbackFormData;
  conversationContext: ChatMessageType[];
}

export const submitChatFeedback = async (payload: FeedbackPayload): Promise<void> => {
  try {
    const response = await fetch(`${appConfig.NEXT_PUBLIC_BACKEND_URL}/api/v1/chatbot/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit feedback');
    }
    // Không cần trả về gì nếu thành công
  } catch (error) {
    console.error('Error in submitChatFeedback:', error);
    throw error; // Re-throw để component có thể bắt lỗi
  }
};