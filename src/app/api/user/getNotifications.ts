// src/api/user/getNotifications.ts
import { Notification } from '@/src/models/response/user.response'; // Import Notification

export const getNotifications = async (userId: string): Promise<Notification[] | null> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/${userId}/notifications`); // Adjust the API endpoint as needed

    if (!response.ok) {
      // Handle non-2xx responses (e.g., 404, 500)
      console.error(`Error fetching notifications: ${response.status} ${response.statusText}`);

        if(response.status === 404) {
            return []; // Return empty array if 404.
        }
      return null; // Or throw an error, depending on your error handling strategy
    }

    const data: Notification[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return null; // Or throw an error
  }
};