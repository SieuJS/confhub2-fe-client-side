// ConferenceFeedback.tsx
import React, { useState } from 'react';
import { ConferenceResponse } from '../../../../models/response/conference.response'; // Correct path
import Image from 'next/image';
import useAddFeedback from '../../../../hooks/conferenceDetails/useAddFeedBack'; // Import the hook


interface ConferenceFeedbackProps {
    conferenceData: ConferenceResponse | null;
}

const ConferenceFeedback: React.FC<ConferenceFeedbackProps> = ({ conferenceData }) => {
    const [sortBy, setSortBy] = useState<'all' | 'recent'>('all');
    const [description, setDescription] = useState('');
    const [star, setStar] = useState<number | null>(null); // Use null for initial unselected state
    const { submitFeedback, loading, error, newFeedback } = useAddFeedback();

    //  const organizedId = conferenceData?.organization.id; // No longer needed here
    const conferenceId = conferenceData?.conference.id; // Get conferenceId
    const feedbacks = conferenceData?.feedBacks ?? [];

    // Sorting logic
    let sortedFeedbacks = [...feedbacks];
    if (sortBy === 'recent') {
        sortedFeedbacks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Add new feedback to the sorted list
    if (newFeedback) {
        // Find the correct position to insert based on sorting.
        let insertIndex = 0;
        if (sortBy === 'recent') {
            while (insertIndex < sortedFeedbacks.length && new Date(newFeedback.createdAt) < new Date(sortedFeedbacks[insertIndex].createdAt)) {
                insertIndex++;
            }
        }
        sortedFeedbacks.splice(insertIndex, 0, newFeedback);
    }

    // Calculate overall rating
    const calculateOverallRating = () => {
        if (feedbacks.length === 0) return 0;
        const totalStars = feedbacks.reduce((sum, feedback) => sum + feedback.star, 0);
        return totalStars / feedbacks.length; // Return a number
    };

    // Calculate rating distribution
    const calculateRatingDistribution = () => {
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        feedbacks.forEach(feedback => {
            distribution[feedback.star as keyof typeof distribution]++;
        });
        return distribution;
    };

    const overallRating = calculateOverallRating(); // overallRating is now a number
    const ratingDistribution = calculateRatingDistribution();
    const totalReviews = feedbacks.length;

    // Function to get stars display
    const getStars = (starCount: number) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(i < starCount ? '★' : '☆');
        }
        return stars;
    };
    const handleStarClick = (selectedStar: number) => {
        setStar(selectedStar);
    };

    const handleSubmit = async () => {
        // if (!organizedId) { // No longer check organizedId
        if (!conferenceId) {

            console.error("conferenceId is missing"); // Handle this case appropriately
            return;
        }
        if (star === null || description.trim() === "") {
            alert("Please select a rating and write a review."); // Or use a better UI for errors
            return;
        }

        const addedFeedback = await submitFeedback(conferenceId, description, star); //Pass ConferenceId
        if (addedFeedback) {
            setDescription('');
            setStar(null);
        }

    };



    return (
        <div className="container mx-auto py-6 rounded-lg">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-semibold ">Conference Feedback</h2>
                    <div className="text-sm ">Showing {totalReviews} Conference Reviews</div>
                </div>
                <div className="flex space-x-2">
                    <button
                        className={`px-3 py-2 rounded-md text-sm ${sortBy === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                        onClick={() => setSortBy('all')}
                    >
                        All Feedback
                    </button>
                    <button
                        className={`px-3 py-2 rounded-md text-sm ${sortBy === 'recent' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                        onClick={() => setSortBy('recent')}
                    >
                        Recently Added
                    </button>
                </div>
            </div>

            <div className="flex">
                {/* Left column */}
                <div className="w-1/2 pr-8">
                    {/* Overall Rating */}
                    <div className="mb-6 flex items-start">
                        <div>
                            <div className="text-4xl font-bold ">{overallRating.toFixed(1)}</div>
                            <div className="flex text-yellow-500">
                                {getStars(Math.round(overallRating)).map((star, index) => (
                                    <span key={index}>{star}</span>
                                ))}
                            </div>
                            <div className="text-sm ">based on {totalReviews} reviews</div>
                        </div>
                        <div className="ml-8 flex-1">
                            {/* Rating Bars */}
                            {[5, 4, 3, 2, 1].map(star => (
                                <div key={star} className="mb-2 flex items-center">
                                    <div className="w-10 text-sm font-medium ">{star} <span className="inline-block text-xs ml-1 text-yellow-500">★</span></div>
                                    <div className="mx-2 bg-gray-200 h-4 rounded-sm flex-1 relative">
                                        <div
                                            className="absolute bg-yellow-500 h-4 rounded-sm"
                                            style={{
                                                width: `${totalReviews > 0 ? (ratingDistribution[star as keyof typeof ratingDistribution] / totalReviews) * 100 : 0}%`,
                                                backgroundColor: star >= 4 ? 'green' : star == 3 ? 'yellow' : star == 2 ? "orange" : 'red' // More concise color logic.
                                            }}
                                        ></div>
                                    </div>
                                    <div className="w-16 text-right text-sm ">{ratingDistribution[star as keyof typeof ratingDistribution]} reviews</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feedback Description */}
                    <div className="mb-6 text-sm ">
                        Conference feedback helps us understand what attendees valued most and identify areas for improvement in future events.
                        <br />
                        Our rating system considers factors like the recency of the feedback and the attendees overall experience.
                    </div>
                </div>

                <div className="w-1/2 pl-8">
                    {/* Feedback Comments */}
                    <div className="space-y-4 mb-8">

                        {sortedFeedbacks.length === 0 ? (
                            <div className="text-center text-gray-500">No feedback yet.</div>
                        ) : (
                            sortedFeedbacks.map((feedback) => (
                                <div key={feedback.id} className="border border-gray-200 rounded-md p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <Image
                                                src="/user-placeholder.jpeg" // Use a generic placeholder
                                                alt="User Avatar"
                                                width={30}
                                                height={30}
                                                className="rounded-full w-8 h-8 mr-2"
                                            />

                                            <div className="font-medium ">User ID: {feedback.creatorId.substring(0, 8)}</div>  {/* Show part of creatorId */}
                                        </div>
                                        <div className="flex text-yellow-500">
                                            {getStars(feedback.star).map((star, index) => (
                                                <span key={index}>{star}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-sm  mb-2">
                                        {new Date(feedback.createdAt).toLocaleDateString()} {new Date(feedback.createdAt).toLocaleTimeString()}
                                    </div>
                                    <div className=" mb-3">
                                        {feedback.description}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm ">
                                            <button className="hover:underline mr-4">Reply</button>
                                            <button className="hover:underline">Report</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Feedback Input */}
                    <div className="border-t border-gray-200 pt-6">
                        <div className="mb-3 font-medium ">Rating:</div>
                        <div className="flex text-3xl text-yellow-500 mb-4">
                            {/* Clickable stars */}
                            {[1, 2, 3, 4, 5].map((starValue) => (
                                <span
                                    key={starValue}
                                    onClick={() => handleStarClick(starValue)}
                                    className={`cursor-pointer ${star !== null && starValue <= star ? 'text-yellow-500' : 'text-gray-300'}`}

                                >
                                    {starValue <= (star || 0) ? '★' : '☆'}
                                </span>
                            ))}
                        </div>
                        <textarea
                            placeholder="Write your feedback..."
                            className="w-full p-3 border border-gray-300 rounded-md text-sm  focus:ring-blue-500 focus:border-blue-500 mb-4"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <div className="flex justify-between items-center">
                            <div className="flex space-x-2">

                            </div>
                            <button
                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md"
                                onClick={handleSubmit}
                                disabled={loading} // Disable button during loading
                            >
                                {loading ? 'Posting...' : 'Post Feedback'}
                            </button>

                        </div>
                        {error && <p className="text-red-500 mt-2">{error}</p>} {/* Display error */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConferenceFeedback;