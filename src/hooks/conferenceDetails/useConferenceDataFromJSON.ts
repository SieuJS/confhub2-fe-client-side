// hooks/useConferenceData.ts
import { useState, useEffect } from 'react';
import { ConferenceResponse } from '../../models/response/conference.response'; // Adjust path as needed
import { getConferenceFromJSON } from '../../app/api/conference/getConferenceDetails'; // Adjust path as needed

const useConferenceDataJSON = (id: string | null) => {
    const [conferenceDataFromJSON, setConferenceData] = useState<ConferenceResponse | null>(null);

    useEffect(() => {
        const fetchConferenceData = async () => {
          
            try {
                if (id) {
                    const conferenceInfo = await getConferenceFromJSON(id);
                    setConferenceData(conferenceInfo);
                }
            } catch (err: any) {
                if (err.status === 404) {
                } else {
                    console.error('Error fetching conference data:', err);
                }
            } 
        };

        if (id) {
            fetchConferenceData();
        } else {
        }
    }, [id]);

    return { conferenceDataFromJSON };
};

export default useConferenceDataJSON;