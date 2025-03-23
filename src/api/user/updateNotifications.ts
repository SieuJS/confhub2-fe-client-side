// src/api/user/updateNotifications.ts
import { Notification } from '@/src/models/response/user.response'; // Make sure this import is correct

interface UpdateNotificationsData {
  notifications: Notification[];
}

const API_UPDATE_NOTIFICATIONS_ENDPOINT = 'http://localhost:3000/api/v1/user'; // Adjust the port if necessary

async function updateNotifications(userId: string, data: UpdateNotificationsData): Promise<void> {
  try {
    const response = await fetch(`${API_UPDATE_NOTIFICATIONS_ENDPOINT}/${userId}/notifications`, {
      method: 'PUT', // Use PUT for updating existing resources
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json(); // Attempt to get error message
      throw new Error(`Failed to update notifications: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }
    //No need to return anything.

  } catch (error: any) {
    console.error('Error updating notifications:', error);
    throw error; // Re-throw the error for the calling function to handle
  }
}

export { updateNotifications };