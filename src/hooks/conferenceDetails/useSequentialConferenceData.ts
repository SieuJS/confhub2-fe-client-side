// hooks/useSequentialConferenceData.ts
import { useState, useEffect } from 'react';
import { ConferenceResponse } from '../../models/response/conference.response';
import { getConferenceFromDB } from '../../app/apis/conference/getConferenceDetails';

const useSequentialConferenceData = (id: string | null) => {
    const [conferenceDataFromDB, setDbData] = useState<ConferenceResponse | null>(null);
    const [dbError, setDbError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true); // Tổng trạng thái loading

    useEffect(() => {
        const fetchAllData = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setDbData(null);
            setDbError(null);

            try {
                // --- Bước 1: Fetch từ DB ---
                console.log("Fetching from DB...");
                const dbInfo = await getConferenceFromDB(id);
                setDbData(dbInfo);
                console.log("Fetched from DB successfully.");
            } catch (dbErr: any) {
                console.error('Error fetching DB data:', dbErr);
                if (dbErr.status === 404) {
                    setDbError("Conference not found in DB");
                } else {
                    setDbError(dbErr.message || 'An error occurred while fetching DB data.');
                }
            } finally {
                setLoading(false);
                console.log("Finished all fetching attempts.");
            }
        };

        fetchAllData();

    }, [id]); // Chạy lại khi id thay đổi

    return {
        conferenceDataFromDB,
        dbError,
        loading // Trạng thái loading tổng
    };
};

export default useSequentialConferenceData;