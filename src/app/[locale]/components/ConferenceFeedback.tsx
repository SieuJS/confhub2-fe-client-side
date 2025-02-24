// ConferenceFeedback.tsx
"use client";

import React, { useState } from 'react';
import Button from './Button'; // Adjust path if necessary

interface ConferenceFeedbackProps {
    onSubmitFeedback: (rating: number | null, comment: string) => void;
}

const ConferenceFeedback: React.FC<ConferenceFeedbackProps> = ({ onSubmitFeedback }) => {
    const [rating, setRating] = useState<number | null>(null);

    const [comment, setComment] = useState('');

    const handleRatingClick = (star: number) => {
        setRating(star);
    };

    const handleCommentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setComment(event.target.value);
    };

    const handleSubmit = () => {
        onSubmitFeedback(rating, comment);
        // Reset form after submission (optional)
        setRating(null);
        setComment('');
    };

    const renderStar = (star: number) => {
        const isSelected = rating !== null && star <= rating;
        return (
            <button
                key={star}
                onClick={() => handleRatingClick(star)}
                className={`text-3xl ${isSelected ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-400 focus:outline-none`}
            >
                {isSelected ? '★' : '☆'}
            </button>
        );
    };

    return (
        <div className="mt-8">
            <h3 className="text-xl font-semibold mb-2">Conference Feedback</h3>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Rating:
                </label>
                <div>
                    {[1, 2, 3, 4, 5].map((star) => renderStar(star))}
                </div>
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Comment:
                </label>
                <textarea
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows={4}
                    placeholder="Write your comment here..."
                    value={comment}
                    onChange={handleCommentChange}
                />
            </div>
            <Button onClick={handleSubmit} variant="primary" size="medium" rounded>
                Submit Feedback
            </Button>
        </div>
    );
};

export default ConferenceFeedback;