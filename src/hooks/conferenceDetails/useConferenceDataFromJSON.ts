// hooks/useConferenceDataJSON.ts
import { useState, useEffect } from 'react';
import { ConferenceResponse } from '../../models/response/conference.response';
import { getConferenceFromJSON } from '../../app/api/conference/getConferenceDetails';

// Thêm tham số 'enabled'
const useConferenceDataJSON = (id: string | null, enabled: boolean = true) => {
    const [conferenceDataFromJSON, setConferenceData] = useState<ConferenceResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        // Chỉ fetch khi id có giá trị VÀ hook được 'enabled'
        if (!id || !enabled) {
            // Nếu không enabled hoặc không có id, reset state và không làm gì cả
            setConferenceData(null);
            setError(null);
            setLoading(false);
            return;
        }

        const fetchConferenceData = async () => {
            setLoading(true); // Chỉ set loading true khi bắt đầu fetch
            setError(null);
            try {
                const conferenceInfo = await getConferenceFromJSON(id);
                console.log(conferenceInfo)
                setConferenceData(conferenceInfo);
            } catch (err: any) {
                if (err.status === 404) {
                    setError("Conference not found in JSON"); // Phân biệt lỗi
                } else {
                    setError(err.message || 'An error occurred while fetching JSON data.');
                    console.error('Error fetching JSON data:', err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchConferenceData();

    // Thêm 'enabled' vào dependency array
    }, [id, enabled]);

    return { conferenceDataFromJSON, error, loading };
};

export default useConferenceDataJSON;