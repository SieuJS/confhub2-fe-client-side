import { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { UserResponse } from '@/src/models/response/user.response';
import { getUserById } from '../../../app/apis/user/getUserById';

interface GetUserResult {
  user: UserResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useGetUser = (userId: string | null): GetUserResult => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // FIX 1: Wrap fetchData in useCallback.
  // This memoizes the function, so its reference only changes when `userId` changes.
  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setUser(null); // Also clear user data if there's no ID
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const userData = await getUserById(userId);
      setUser(userData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user.');
      setUser(null); // Clear user data on error
    } finally {
      setLoading(false);
    }
  }, [userId]); // The dependency for fetchData is the userId.

  // FIX 2: Now you can safely add `fetchData` as a dependency here.
  // The effect will only re-run when the memoized `fetchData` function changes (i.e., when userId changes).
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // FIX 3: It's good practice to also memoize the returned refetch function.
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { user, loading, error, refetch };
};