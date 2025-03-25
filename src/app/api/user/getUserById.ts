// src/api/userApi.ts
import { UserResponse } from '@/src/models/response/user.response';


export const getUserById = async (userId: string): Promise<UserResponse> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/${userId}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch user data');
  }

  return response.json();
};