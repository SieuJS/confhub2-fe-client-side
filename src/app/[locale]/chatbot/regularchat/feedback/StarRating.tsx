// src/app/[locale]/chatbot/regularchat/feedback/StarRating.tsx
import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex space-x-1">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <label key={index}>
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              onClick={() => onRatingChange(ratingValue)}
              className="sr-only" // Hide the actual radio button
            />
            <Star
              className="cursor-pointer transition-colors duration-200"
              color={ratingValue <= (hover || rating) ? '#ffc107' : '#e4e5e9'}
              fill={ratingValue <= (hover || rating) ? '#ffc107' : '#e4e5e9'}
              size={28}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(0)}
            />
          </label>
        );
      })}
    </div>
  );
};

export default StarRating;