// src/hooks/conferenceDetails/useBlacklistConference.ts
import { useState, useEffect, useCallback } from 'react';
import { ConferenceResponse } from '@/src/models/response/conference.response'; // Adjust path
import { UserResponse } from '@/src/models/response/user.response'; // Adjust path

const API_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user`; // Base user endpoint

const useBlacklistConference = (conferenceData: ConferenceResponse | null) => {
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state specific to blacklist action
  const [error, setError] = useState<string | null>(null);

  const conferenceId = conferenceData?.conference?.id;

  // Fetch initial blacklist status
  useEffect(() => {
    if (!conferenceData) {
      setIsBlacklisted(false);
      return;
    }

    let isMounted = true; // Prevent state update on unmounted component
    const fetchInitialStatus = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        // Not logged in, cannot be blacklisted by this user
        setIsBlacklisted(false);
        return;
      }

      try {
        const user = JSON.parse(userData);
        if (!user?.id) {
             setIsBlacklisted(false);
             return;
        }

        // Fetch the full user data to check the blacklist array
        // Consider optimizing this if user data gets very large,
        // maybe have a dedicated endpoint like /user/:id/is-blacklisted/:conferenceId
        setLoading(true); // Indicate loading initial state
        setError(null);
        const response = await fetch(`${API_ENDPOINT}/${user.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const fullUserData: UserResponse = await response.json();

        if (isMounted) {
          const blacklisted = fullUserData.blacklist?.some(
            (bc) => bc.id === conferenceId
          ) ?? false;
          setIsBlacklisted(blacklisted);
        }
      } catch (err: any) {
         if (isMounted) {
            setError(err.message || 'Error fetching initial blacklist status');
            console.error('Error fetching initial blacklist status:', err);
         }
      } finally {
          if (isMounted) {
              setLoading(false);
          }
      }
    };

    fetchInitialStatus();

    return () => {
        isMounted = false; // Cleanup function to set isMounted to false
    };
  }, [conferenceData]); // Rerun effect if conferenceId changes

  // Function to handle the blacklist/unblacklist action
  const handleBlacklistClick = useCallback(async () => {
    if (!conferenceId) {
      setError("Conference ID is missing.");
      console.error("Conference ID is missing for blacklist action.");
      return;
    }

    const userData = localStorage.getItem('user');
    if (!userData) {
      setError("User not logged in.");
      console.error('User not logged in for blacklist action.');
      // Optionally trigger redirect to login here if needed
      return;
    }

    let user;
    try {
        user = JSON.parse(userData);
        if (!user?.id) throw new Error("User ID not found in local storage.");
    } catch (parseError) {
        setError("Failed to parse user data from local storage.");
        console.error("Failed to parse user data:", parseError);
        return;
    }


    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_ENDPOINT}/${user.id}/blacklist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if you use token-based auth:
          // 'Authorization': `Bearer ${your_auth_token}`
        },
        body: JSON.stringify({ conferenceId }), // Send conferenceId in the body
      });

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
        } catch (e) { /* Ignore if response is not JSON */ }
        throw new Error(errorMsg);
      }

      const updatedUser: UserResponse = await response.json();

      // Update state based on the response from the server
      const nowBlacklisted = updatedUser.blacklist?.some(
          (bc) => bc.id === conferenceId
        ) ?? false;
      setIsBlacklisted(nowBlacklisted);

    } catch (err: any) {
      setError(err.message || 'Error updating blacklist status.');
      console.error('Error updating blacklist status:', err);
      // Optionally revert optimistic UI update here if you implemented one
    } finally {
      setLoading(false);
    }
  }, [conferenceId]); // Dependency: conferenceId

  return { isBlacklisted, handleBlacklistClick, loading, error };
};

export default useBlacklistConference;