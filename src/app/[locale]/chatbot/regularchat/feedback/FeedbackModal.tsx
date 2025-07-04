// src/app/[locale]/chatbot/regularchat/feedback/FeedbackModal.tsx
import React, { useState, useEffect } from 'react';
import { X, ThumbsUp, ThumbsDown } from 'lucide-react';
import StarRating from './StarRating';

export type FeedbackType = 'like' | 'dislike';

export interface FeedbackFormData {
  type: FeedbackType;
  rating: number;
  title: string;
  details: string;
}

interface FeedbackModalProps {
  isOpen: boolean;
  feedbackType: FeedbackType | null;
  onClose: () => void;
  onSubmit: (formData: FeedbackFormData) => void;
  isSubmitting: boolean;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, feedbackType, onClose, onSubmit, isSubmitting }) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');

  useEffect(() => {
    // Reset form when modal opens or feedback type changes
    if (isOpen) {
      setRating(feedbackType === 'like' ? 5 : 1);
      setTitle('');
      setDetails('');
    }
  }, [isOpen, feedbackType]);

  if (!isOpen || !feedbackType) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Vui lòng chọn số sao đánh giá.');
      return;
    }
    onSubmit({ type: feedbackType, rating, title, details });
  };

  const modalTitle = feedbackType === 'like' ? 'Phản hồi tích cực' : 'Góp ý để cải thiện';
  const Icon = feedbackType === 'like' ? ThumbsUp : ThumbsDown;
  const iconColor = feedbackType === 'like' ? 'text-green-500' : 'text-red-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl dark:bg-gray-800">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <div className="flex items-center space-x-3">
          <Icon size={32} className={iconColor} />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{modalTitle}</h2>
        </div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Cảm ơn bạn đã dành thời gian giúp chúng tôi cải thiện chất lượng phản hồi.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block font-semibold text-gray-700 dark:text-gray-300">
              Mức độ hài lòng của bạn? <span className="text-red-500">*</span>
            </label>
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>

          <div>
            <label htmlFor="feedback-title" className="mb-2 block font-semibold text-gray-700 dark:text-gray-300">
              Tiêu đề (Tùy chọn)
            </label>
            <input
              id="feedback-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Phản hồi không chính xác"
              className="w-full rounded-md border border-gray-300 bg-gray-20 px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
            />
          </div>

          <div>
            <label htmlFor="feedback-details" className="mb-2 block font-semibold text-gray-700 dark:text-gray-300">
              Nội dung chi tiết (Tùy chọn)
            </label>
            <textarea
              id="feedback-details"
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Vui lòng mô tả rõ hơn về trải nghiệm của bạn..."
              className="w-full rounded-md border border-gray-300 bg-gray-20 px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 shadow-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md border border-transparent bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi phản hồi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;