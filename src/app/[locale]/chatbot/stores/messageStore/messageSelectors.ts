// src/app/[locale]/chatbot/stores/messageStore/messageSelectors.ts
import { useSettingsStore } from '../setttingsStore';
import { UserResponse } from '@/src/models/response/user.response';
import { CombinedSettingsPayload, UserProfileData } from './messageState';

export const getCombinedSettingsData = (): CombinedSettingsPayload | null => {
    const { isPersonalizationEnabled, isGoogleSearchEnabled } = useSettingsStore.getState();

    // QUAN TRỌNG: Logic này có thể là vấn đề
    // Nếu bạn muốn gửi payload ngay cả khi chỉ một trong hai được bật,
    // điều kiện này cần được thay đổi.
    // Hiện tại: if (!isPersonalizationEnabled && !isGoogleSearchEnabled) { return null; }
    // Điều này có nghĩa là nếu isPersonalizationEnabled = false VÀ isGoogleSearchEnabled = false thì mới trả về null.
    // Nếu isPersonalizationEnabled = false NHƯNG isGoogleSearchEnabled = true, nó SẼ KHÔNG trả về null.
    // => Logic này có vẻ ĐÚNG với yêu cầu Google Search và Personalization độc lập.

    // Vậy vấn đề có thể nằm ở chỗ khác.

    // Hãy thêm log ở đây để kiểm tra giá trị từ store:
    console.log('[getCombinedSettingsData] Store values:', { isPersonalizationEnabled, isGoogleSearchEnabled });

    if (!isPersonalizationEnabled && !isGoogleSearchEnabled) {
        console.log('[getCombinedSettingsData] Both disabled, returning null.');
        return null;
    }

    const payload: CombinedSettingsPayload = {
        isPersonalizationEnabled: isPersonalizationEnabled,
        isGoogleSearchEnabled: isGoogleSearchEnabled,
    };
    console.log('[getCombinedSettingsData] Payload to be sent (before userProfile):', JSON.parse(JSON.stringify(payload)));


    if (isPersonalizationEnabled) {
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (userStr) {
            try {
                const userData = JSON.parse(userStr) as UserResponse;
                const userProfile: UserProfileData = {};

                if (userData.firstName) userProfile.firstName = userData.firstName;
                if (userData.lastName) userProfile.lastName = userData.lastName;
                if (userData.aboutMe) userProfile.aboutMe = userData.aboutMe;
                if (userData.interestedTopics && userData.interestedTopics.length > 0) {
                    userProfile.interestedTopics = userData.interestedTopics;
                }

                if (Object.keys(userProfile).length > 0) {
                    payload.userProfile = userProfile;
                }
            } catch (error) {
                console.error("Error parsing user data from localStorage for personalization:", error);
            }
        }
    }
    console.log('[getCombinedSettingsData] Final payload:', JSON.parse(JSON.stringify(payload)));
    return payload;
};