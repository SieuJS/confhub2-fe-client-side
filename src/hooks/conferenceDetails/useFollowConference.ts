// hooks/useFollowConference.ts
import { useState, useEffect } from 'react';
import { ConferenceResponse } from '../../models/response/conference.response';
import { UserResponse } from '../../models/response/user.response';

const API_ENDPOINT = 'http://localhost:3000/api/v1/user';

const useFollowConference = (conferenceData: ConferenceResponse | null) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conferenceData?.conference?.id) {
      setIsFollowing(false);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      const userData = localStorage.getItem('user');
      if (!userData) {
          setIsFollowing(false);
          setLoading(false);
          return;
      }

      const user = JSON.parse(userData);
      try {
        const response = await fetch(`${API_ENDPOINT}/${user.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const userData: UserResponse = await response.json();
        setIsFollowing(
          userData.followedConferences?.some(
            (followedConf) => followedConf.id === conferenceData.conference.id
          ) ?? false
        );
      } catch (err:any) {
        setError(err.message || 'Error fetching user data');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [conferenceData?.conference?.id]);

  const handleFollowClick = async () => {
    if (!conferenceData?.conference?.id) {
      setError("Conference data is missing.");
      return;
    }

    const conferenceId = conferenceData.conference.id;
    const userData = localStorage.getItem('user');

    if (!userData) {
      setError("User not logged in.");
      console.error('User not logged in');
      return;
    }

    const user = JSON.parse(userData);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_ENDPOINT}/${user.id}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conferenceId, userId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorData.message}`
        );
      }

      const updatedUser: UserResponse = await response.json();
      setIsFollowing(updatedUser.followedConferences?.some(conf => conf.id === conferenceId) ?? false); // FIXED HERE
    } catch (err:any) {
      setError(err.message || 'Error following/unfollowing conference.');
      console.error('Error following/unfollowing conference:', err);
    } finally {
      setLoading(false);
    }
  };

  return { isFollowing, handleFollowClick, loading, error };
};

export default useFollowConference;