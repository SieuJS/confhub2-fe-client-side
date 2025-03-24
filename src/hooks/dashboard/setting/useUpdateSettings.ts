// src/hooks/useUpdateUser.ts
import { useState } from 'react';
import { UserResponse, Setting } from '@/src/models/response/user.response';  // Import your UserResponse and Setting type
import { updateUser } from '../../../app/api/user/updateUser'; // Adjust path if needed.

interface UpdateUserResult {
  updateUserSetting: (userId: string, updatedSetting: Partial<Setting>) => Promise<void>;
  updateUserProfile:(userId: string, updatedProfile: Partial<UserResponse>) => Promise<void>
  loading: boolean;
  error: string | null;
}

export const useUpdateUser = (): UpdateUserResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUserSetting = async (userId: string, updatedSetting: Partial<Setting>) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch the current user data
      const response =  await fetch(`http://localhost:3000/api/v1/user/${userId}`);

      if (!response.ok) {
          throw new Error(`Failed to fetch user data. Status: ${response.status}`);
      }
      const currentUserData: UserResponse = await response.json();

      // Merge current settings with the updated settings
      const newSettings: Setting = {
        ...currentUserData.setting,
        ...updatedSetting,
      }
      const updatedData = {
        ...currentUserData,
        setting: newSettings
      }
       await updateUser(userId, updatedData);

    } catch (err: any) {
      setError(err.message || 'Failed to update user setting.');
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (userId: string, updatedProfile: Partial<UserResponse>) => {
    setLoading(true);
    setError(null);
    try{
        await updateUser(userId, updatedProfile);
    }
    catch(err: any){
        setError(err.message || 'Failed to update user profile');
    }
    finally{
        setLoading(false);
    }
  }

  return { updateUserSetting, updateUserProfile, loading, error };
};