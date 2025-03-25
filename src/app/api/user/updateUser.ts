import { UserResponse } from '@/src/models/response/user.response';

export const updateUser = async (userId: string, updatedData: Partial<UserResponse>): Promise<UserResponse> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user data');
    }
  
    return response.json();
  };