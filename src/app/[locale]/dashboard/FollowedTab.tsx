// FollowedTab.tsx
import React, { useState, useEffect } from 'react';
import ConferenceItem from '../conferences/ConferenceItem';
import { getListConference } from '../../../api/getConference/getListConferences'; // Import getListConference
import { ConferenceListResponse } from '../../../models/response/conference.list.response';


interface FollowedTabProps { }

const FollowedTab: React.FC<FollowedTabProps> = () => {
    const [followedConferences, setFollowedConferences] = useState<any[]>([]); // Use any[] for now
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);
    const [allConferences, setAllConferences] = useState<ConferenceListResponse | null>(null); // Store all conferences

    useEffect(() => {
        const fetchData = async () => {
            try {
                const conferencesData = await getListConference();
                setAllConferences(conferencesData); // Store the full conference list

                const userData = localStorage.getItem('user');
                if (userData) {
                    const user = JSON.parse(userData);
                    setLoggedIn(user.loginStatus !== null);

                    if (user.loginStatus !== null && user.followedConferences && Array.isArray(user.followedConferences)) {
                        // Filter based on the full conference list
                        const followed = conferencesData.payload.filter(conf =>
                            user.followedConferences.includes(conf.id)
                        );
                        setFollowedConferences(followed);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch conferences:", error);
                // Handle error appropriately, e.g., show an error message to the user
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);



    if (!loggedIn) {
        return <div className="container mx-auto p-4">Please log in to view followed conferences.</div>;
    }

    if (loading) {
        return <div className="container mx-auto p-4">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-2">Followed Conferences</h1>
            {followedConferences.length === 0 ? (
                <p>You are not following any conferences yet.</p>
            ) : (
                followedConferences.map((conference) => (
                    <ConferenceItem key={conference.id} conference={conference} />
                ))
            )}
        </div>
    );
};

export default FollowedTab;