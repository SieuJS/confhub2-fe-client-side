// hooks/useFollowConference.ts
import { useState, useEffect } from 'react';
import { ConferenceResponse } from '../../models/response/conference.response'; // Adjust path
import { UserResponse } from '../../models/response/user.response'; // Adjust path
import * as usersData from '../../models/data/user-list.json';  // Adjust path

const useFollowConference = (conferenceData: ConferenceResponse | null) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const users: UserResponse[] = (usersData as any).default || usersData;

    useEffect(() => {
        if (!conferenceData) return;

        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setIsFollowing(user.followedConferences?.includes(conferenceData.conference.id) || false);
        }
    }, [conferenceData?.conference.id]);

    const handleFollowClick = () => {
        if (!conferenceData) return;

        const conferenceId = conferenceData.conference.id;
        const userData = localStorage.getItem('user');

        if (userData) {
            const user: { email: string; loginStatus: string; followedConferences?: string[] } = JSON.parse(userData);
            const userEmail = user.email;
            const userIndex = users.findIndex((u: UserResponse) => u.email === userEmail);

            if (userIndex !== -1) {
                const updatedUser: UserResponse = { ...users[userIndex] };

                if (!updatedUser.followedConferences) {
                    updatedUser.followedConferences = [];
                }

                if (isFollowing) {
                    updatedUser.followedConferences = updatedUser.followedConferences.filter((id: string) => id !== conferenceId);
                } else {
                    if (!updatedUser.followedConferences.includes(conferenceId)) {
                        updatedUser.followedConferences.push(conferenceId);
                    }
                }

                const updatedUsers = [...users];
                updatedUsers[userIndex] = updatedUser;

                localStorage.setItem('user', JSON.stringify({
                    email: user.email,
                    loginStatus: user.loginStatus,
                    followedConferences: updatedUser.followedConferences
                }));

                setIsFollowing(!isFollowing);
            } else {
                console.error("User not found in user-list.json");
            }
        } else {
            console.error("User not logged in");
        }
    };

    return { isFollowing, handleFollowClick };
};

export default useFollowConference;