// hooks/useAddFeedback.ts
import { useState } from 'react';
import { addFeedback } from '../../app/apis/conference/addFeedBack'; // Path to your API function
import { Feedback } from '../../models/send/feedback.send';

const useAddFeedback = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newFeedback, setNewFeedback] = useState<Feedback | null>(null); // Store new feedback

    const submitFeedback = async (conferenceId: string, description: string, star: number) => { // Change to conferenceId
        setLoading(true);
        setError(null);
        setNewFeedback(null); // Clear previous feedback
        try {
            const feedback = await addFeedback({ conferenceId, description, star }); // Pass conferenceId
            setNewFeedback(feedback); // Store the new feedback
            //window.location.reload();

            const userData = JSON.parse(localStorage.getItem('user') || 'null'); // Use localStorage
            if(userData) {
                const t = await fetch(
                    '/apis/logs/user-conference',
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            userId: userData.id,
                            trustCredit: userData.trustCredit || 0,
                            action: 'add feedback',
                            conferenceId
                        }),
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
            }
            return feedback
        } catch (err: any) {
            setError(err.message || 'An error occurred while submitting feedback.');
            return null
        } finally {
            setLoading(false);
        }
    };

    return { submitFeedback, loading, error, newFeedback };
};

export default useAddFeedback;