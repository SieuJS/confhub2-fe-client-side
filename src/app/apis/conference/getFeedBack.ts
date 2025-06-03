// api/feedback/getFeedback.ts
import { appConfig } from "@/src/middleware";
import { FeedbackResponse } from "../../../models/response/feedback.list.response"; // Create this model


export const getFeedBack = async (
    conferenceId: string // Change to conferenceId
): Promise<FeedbackResponse[]> => {
    // const userJSON = localStorage.getItem('user');
    // if (!userJSON) {
    //     throw new Error("User not logged in"); // Or handle differently
    // }
    // const user = JSON.parse(userJSON);
    // const creatorId = user.id;
    // if (!creatorId) {
    //     throw new Error("User ID not found in local storage");
    // }

    const response = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/feedback/${conferenceId}`, { // Use conferenceId in URL
          method: 'GET'
      });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get feedback');
    }

    const allFeedback: FeedbackResponse[] = await response.json();
    return allFeedback;
};


