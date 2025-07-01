// src/app/[locale]/chatbot/stores/messageStore/messageSelectors.ts
import { PersonalizationPayload } from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import { useSettingsStore } from '../setttingsStore'; // Note: relative path assuming structure
import { UserResponse } from '@/src/models/response/user.response';

export const getPersonalizationData = (): PersonalizationPayload | null => {
    const { isPersonalizationEnabled } = useSettingsStore.getState();
    if (!isPersonalizationEnabled) {
        return null;
    }

    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!userStr) {
        return null;
    }

    try {
        const userData = JSON.parse(userStr) as UserResponse;
        return {
            firstName: userData.firstName,
            lastName: userData.lastName,
            aboutMe: userData.aboutMe,
            interestedTopics: userData.interestedTopics,
        };
    } catch (error) {
        // console.error("Error parsing user data from localStorage for personalization:", error);
        return null;
    }
};