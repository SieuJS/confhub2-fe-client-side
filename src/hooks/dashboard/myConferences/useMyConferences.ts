// frontend/hooks/useMyConferences.ts
import { useState, useEffect } from 'react';
import { AddedConference } from '../../../models/send/addConference.send'; //  Define this type

// Define the shape of the data returned by the API
interface UseMyConferencesResult {
    conferences: AddedConference[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void; // Add refetch function
}

const useMyConferences = (userId: string): UseMyConferencesResult => {
    const [conferences, setConferences] = useState<AddedConference[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/my-conferences`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add Authorization header if you use token-based auth:
                    // 'Authorization': `Bearer ${your_auth_token}`
                },
                body: JSON.stringify({ userId })
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch conferences: ${response.status} ${response.statusText}`);
            }
            const data: AddedConference[] = await response.json();
            console.log(data);
            setConferences(data);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchData();
        }
    }, [userId]); // Only refetch if userId changes

    return { conferences, isLoading, error, refetch: fetchData };
};

export default useMyConferences;