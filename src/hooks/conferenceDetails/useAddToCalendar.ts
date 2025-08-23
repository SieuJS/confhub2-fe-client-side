// src/hooks/conferenceDetails/useAddToCalendar.ts

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext'; // 1. Import useAuth
import { ConferenceResponse } from '../../models/response/conference.response';
import { Calendar } from '../../models/response/user.response';
import { appConfig } from '@/src/middleware';

const API_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1`;

const useAddToCalendar = (conferenceData: ConferenceResponse | null) => {
  const { isLoggedIn, isInitializing } = useAuth(); // 2. Lấy trạng thái auth
  const [isAddToCalendar, setIsAddToCalendar] = useState(false);
  const [loading, setLoading] = useState(false); // 3. Khởi tạo loading là false
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // --- 4. GUARD CLAUSE QUAN TRỌNG ---
    // Chỉ fetch khi:
    // 1. Việc xác thực đã hoàn tất (isInitializing là false)
    // 2. Người dùng đã đăng nhập (isLoggedIn là true)
    // 3. Có dữ liệu conference
    if (isInitializing || !isLoggedIn || !conferenceData) {
      setIsAddToCalendar(false); // Đảm bảo trạng thái là false nếu không đủ điều kiện
      return; // Dừng thực thi nếu không đủ điều kiện
    }

    const fetchCalendarStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_ENDPOINT}/calendar/conference-events`, {
          method: 'GET',
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const calendarEvents: Calendar[] = await response.json();
        setIsAddToCalendar(
          calendarEvents.some(
            (calendarConf) => calendarConf.id === conferenceData?.id
          ) ?? false
        );
        
      } catch (err: any) {
        setError(err.message || 'Error fetching calendar data');
        // console.error('Error fetching calendar data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarStatus();
  }, [conferenceData, isLoggedIn, isInitializing]); // 5. Thêm isLoggedIn và isInitializing vào dependency array

  const handleAddToCalendar = async () => {
    if (!conferenceData?.id) {
      setError("Conference data is missing.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_ENDPOINT}/calendar/${isAddToCalendar ? 'remove' : 'add'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ conferenceId: conferenceData.id }),
      });
      const userData = await JSON.parse(localStorage.getItem('user') || 'null'); // Use localStorage
        if(userData) {
          const t = await fetch(
            '/apis/logs/user-conference',
            {
              method: 'POST',
              body: JSON.stringify({
                userId: userData.id,
                trustCredit: userData.trustCredit || 0,
                action: `${isAddToCalendar ? 'remove from' : 'add to'} calendar`,
                conferenceId: conferenceData.id
              }),
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          console.log('Log interaction response:', t);
        }

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('User is banned');
        } else {
          const errorData = await response.json();
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${errorData.message}`
          );
        }
      }

      // 6. Đơn giản hóa việc cập nhật state
      // Chỉ cần đảo ngược trạng thái hiện tại là đủ và an toàn nhất
      setIsAddToCalendar(prevState => !prevState);

    } catch (err: any) {
      setError(err.message || 'Error updating calendar status.');
      // console.error('Error updating calendar status:', err);
    } finally {
      setLoading(false);
    }
  };

  return { isAddToCalendar, handleAddToCalendar, loading, error };
};

export default useAddToCalendar;