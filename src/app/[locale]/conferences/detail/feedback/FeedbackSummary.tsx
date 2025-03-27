// src/components/Feedback/FeedbackSummary.tsx
import React from 'react';
import { getStarsArray } from './utils/uiUtils'; // Adjust path

interface FeedbackSummaryProps {
  overallRating: number;
  ratingDistribution: Record<number, number>;
  totalReviews: number;
}

const FeedbackSummary: React.FC<FeedbackSummaryProps> = ({
  overallRating,
  ratingDistribution,
  totalReviews,
}) => {
    const overallStars = getStarsArray(overallRating);

    const getBarColor = (star: number): string => {
        return star >= 4
                ? '#22c55e' // green-500
                : star === 3
                    ? '#eab308' // yellow-500
                    : star === 2
                    ? '#f97316' // orange-500
                    : '#ef4444'; // red-500
    };

    return (
        <div className='mb-8 w-full md:mb-0 md:w-1/2'>
            {/* Overall Rating & Bars */}
            <div className='mb-6 flex flex-col items-start sm:flex-row'>
                <div className='mb-4 sm:mb-0 sm:mr-8'>
                    <div className='text-4xl font-bold '>
                        {overallRating.toFixed(1)}
                    </div>
                    <div className='flex text-yellow-500'>
                        {overallStars.map((star, index) => (
                            <span key={index}>{star}</span>
                        ))}
                    </div>
                    <div className='text-sm text-gray-600'>
                        based on {totalReviews} reviews
                    </div>
                </div>
                {/* Rating Bars */}
                <div className='w-full flex-1'>
                    {[5, 4, 3, 2, 1].map(star => (
                        <div key={star} className='mb-2 flex items-center'>
                            <div className='w-10 text-sm font-medium text-gray-700'>
                                {star}{' '}
                                <span className='ml-1 inline-block text-xs text-yellow-500'>★</span>
                            </div>
                            <div className='relative mx-2 h-4 flex-1 rounded-sm bg-gray-200'>
                                <div
                                    className='absolute h-4 rounded-sm'
                                    style={{
                                        width: `${totalReviews > 0 ? (ratingDistribution[star] / totalReviews) * 100 : 0}%`,
                                        backgroundColor: getBarColor(star)
                                    }}
                                ></div>
                            </div>
                            <div className='w-16 text-right text-sm text-gray-600'>
                                {ratingDistribution[star]}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Feedback Description */}
            <div className='hidden text-sm text-gray-700 md:block'>
                Conference feedback helps us understand what attendees valued most
                and identify areas for improvement in future events... {/* Keep description or make it a prop */}
            </div>
        </div>
    );
};

export default FeedbackSummary;