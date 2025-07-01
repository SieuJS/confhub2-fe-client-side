// src/hooks/conferenceDetails/useBlacklistConference.ts

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext'; // 1. Import useAuth
import { ConferenceResponse } from '@/src/models/response/conference.response';
import { appConfig } from '@/src/middleware';

const API_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/blacklist-conference`;

const useBlacklistConference = (conferenceData: ConferenceResponse | null) => {
  const { isLoggedIn, isInitializing } = useAuth(); // 2. Lấy trạng thái auth
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [loading, setLoading] = useState(false); // 3. Khởi tạo loading là false
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // --- 4. GUARD CLAUSE QUAN TRỌNG ---
    // Chỉ fetch khi:
    // 1. Việc xác thực đã hoàn tất (isInitializing là false)
    // 2. Người dùng đã đăng nhập (isLoggedIn là true)
    // 3. Có dữ liệu conference
    if (isInitializing || !isLoggedIn || !conferenceData) {
      setIsBlacklisted(false); // Đảm bảo trạng thái là false nếu không đủ điều kiện
      return; // Dừng thực thi nếu không đủ điều kiện
    }

    const fetchBlacklistStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_ENDPOINT}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${localStorage.getItem('token')}`,
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blacklistedConferences = await response.json();
        setIsBlacklisted(
          blacklistedConferences?.some(
            (blacklistConf: any) => blacklistConf.conferenceId === conferenceData.id
          ) ?? false
        );
      } catch (err: any) {
        setError(err.message || 'Error fetching blacklist data');
        // console.error('Error fetching blacklist data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlacklistStatus();
  }, [conferenceData, isLoggedIn, isInitializing]); // 5. Thêm isLoggedIn và isInitializing vào dependency array

  const handleBlacklistClick = async () => {
    if (!conferenceData?.id) {
      setError("Conference ID is missing.");
      return;
    }
    // Không cần kiểm tra localStorage ở đây nữa vì checkLoginAndRedirect đã làm việc đó
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_ENDPOINT}/${isBlacklisted ? 'remove' : 'add'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ conferenceId: conferenceData.id }),
      });

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) { /* Bỏ qua nếu response không phải JSON */ }
        throw new Error(errorMsg);
      }

      // 6. Đơn giản hóa việc cập nhật state
      // Chỉ cần đảo ngược trạng thái hiện tại là đủ và an toàn nhất
      setIsBlacklisted(prevState => !prevState);

    } catch (err: any) {
      setError(err.message || 'Error updating blacklist status.');
      // console.error('Error updating blacklist status:', err);
    } finally {
      setLoading(false);
    }
  };

  return { isBlacklisted, handleBlacklistClick, loading, error };
};

export default useBlacklistConference;