// frontend/hooks/dashboard/myConferences/useMyConferences.ts
import { useState, useEffect, useCallback } from 'react'; // Thêm useCallback
// import { AddedConference } from '../../../models/send/addConference.send'; // Không dùng ở đây
import { appConfig } from '@/src/middleware';
// import { ConferenceInfo } from '@/src/models/response/conference.list.response'; // Không dùng ở đây
import { ConferenceResponse } from '@/src/models/response/conference.response'; // Đây là kiểu dữ liệu trả về từ API của bạn

interface UseMyConferencesResult {
    conferences: ConferenceResponse[] | null; // Cho phép null ban đầu
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>; // refetch nên là async
}

const useMyConferences = (
    userId: string | null, // Cho phép userId là null
    getToken: () => string | null // Hàm để lấy token
): UseMyConferencesResult => {
    const [conferences, setConferences] = useState<ConferenceResponse[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false); // Bắt đầu là false, chỉ true khi đang fetch
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!userId) {
            // Không fetch nếu không có userId (người dùng chưa đăng nhập hoặc thông tin chưa sẵn sàng)
            // Có thể set conferences về null hoặc mảng rỗng tùy theo logic hiển thị
            // setConferences(null);
            // setIsLoading(false); // Đảm bảo loading là false
            return;
        }

        const token = getToken();
        if (!token) {
            setError("Authentication token not found. Please log in.");
            // setIsLoading(false);
            // setConferences(null);
            return;
        }

        console.log(`[useMyConferences] Fetching conferences for user: ${userId}`);
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/conference/user`, // API endpoint này cần trả về conferences của user dựa trên token
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, // Sử dụng token được truyền vào
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
                throw new Error(errorData.message || `Failed to fetch conferences: ${response.status} ${response.statusText}`);
            }
            const data: ConferenceResponse[] = await response.json();
            // console.log("[useMyConferences] Data received:", data);
            setConferences(data);
        } catch (err: any) {
            console.error("[useMyConferences] Fetch error:", err);
            setError(err.message || 'An unknown error occurred while fetching conferences.');
            setConferences(null); // Xóa data cũ nếu có lỗi
        } finally {
            setIsLoading(false);
        }
    }, [userId, getToken]); // Dependencies cho useCallback

    useEffect(() => {
        // Fetch dữ liệu khi component mount lần đầu (nếu userId và token đã có)
        // hoặc khi userId hoặc getToken thay đổi (mặc dù getToken thường ổn định)
        fetchData();
    }, [fetchData]); // fetchData là dependency chính, đã bao gồm userId và getToken

    return { conferences, isLoading, error, refetch: fetchData };
};

export default useMyConferences;