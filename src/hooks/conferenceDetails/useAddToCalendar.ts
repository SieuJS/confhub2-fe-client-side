// hooks/useAddToCalendar.ts
import { useState, useEffect } from 'react';
import { ConferenceResponse } from '../../models/response/conference.response';
import { UserResponse } from '../../models/response/user.response';

const API_ENDPOINT = 'http://localhost:3000/api/v1/user';

const useAddToCalendar = (conferenceData: ConferenceResponse | null) => {
  const [isAddToCalendar, setIsAddToCalendar] = useState(false);

  useEffect(() => {
    if (!conferenceData || !conferenceData.conference) return;

    const fetchUser = async () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        try {
          const response = await fetch(`${API_ENDPOINT}/${user.id}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const userData: UserResponse = await response.json();
          console.log(userData);
          setIsAddToCalendar(userData.calendar.includes(conferenceData.conference.id)); // Check if conferenceData.conference.id exists
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Xử lý lỗi (ví dụ: hiển thị thông báo)
        }
      }
    };
      fetchUser();
  }, [conferenceData?.conference?.id]); // Chạy lại khi conferenceData.conference.id thay đổi

  const handleAddToCalendar = async () => {
    if (!conferenceData) return;

    const conferenceId = conferenceData.conference.id;
    const userData = localStorage.getItem('user');

    if (userData) {
      const user = JSON.parse(userData);

      try {
        const response = await fetch(`${API_ENDPOINT}/${user.id}/add-to-calendar`, {
        method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ conferenceId, userId: user.id }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
        }

        const updatedUser = await response.json(); // Nhận user đã update từ server
        // Không cần cập nhật localStorage ở đây nữa
        setIsAddToCalendar(updatedUser.calendar.includes(conferenceId)); // Cập nhật state


      } catch (error: any) {
        console.error('Error following/unfollowing conference:', error.message);
        // Xử lý lỗi
      }
    } else {
      console.error('User not logged in');
    }
  };

  return { isAddToCalendar, handleAddToCalendar };
};

export default useAddToCalendar;
