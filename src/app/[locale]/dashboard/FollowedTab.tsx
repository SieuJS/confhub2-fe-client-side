import React, { useState, useEffect } from 'react';
import ConferenceItem from '../conferences/ConferenceItem';
import { getListConference } from '../../../api/getConference/getListConferences'; // Import getListConference
import { ConferenceListResponse, ConferenceInfo } from '../../../models/response/conference.list.response'; // Import types
import { UserResponse } from '../../../models/response/user.response'; // Import UserResponse

interface FollowedTabProps { }

const API_GET_USER_ENDPOINT = 'http://localhost:3000/api/v1/user'; // Endpoint lấy thông tin user

const FollowedTab: React.FC<FollowedTabProps> = () => {
  const [followedConferences, setFollowedConferences] = useState<ConferenceInfo[]>([]); // Sử dụng ConferenceInfo[]
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  // Không cần allConferences nữa

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          setLoggedIn(false);
          setLoading(false);
          return;
        }

        const user = JSON.parse(userData);
        setLoggedIn(true); // Người dùng đã đăng nhập

        // 1. Lấy thông tin user (bao gồm followedConferences)
        const userResponse = await fetch(`${API_GET_USER_ENDPOINT}/${user.id}`);
        if (!userResponse.ok) {
          throw new Error(`HTTP error! status: ${userResponse.status}`);
        }
        const userDetails: UserResponse = await userResponse.json();

        // 2. Lấy danh sách tất cả conferences (nếu cần hiển thị thông tin chi tiết)
        // Tối ưu hóa: Chỉ fetch nếu có followed conferences
        if (userDetails.followedConferences.length > 0) {
            const conferencesData = await getListConference();

            // 3. Lọc danh sách conferences dựa trên followedConferences từ userDetails
            const followed = conferencesData.payload.filter(conf =>
              userDetails.followedConferences.includes(conf.id)
            );
            setFollowedConferences(followed);

        } else {
             setFollowedConferences([]); // Nếu không có conference nào được follow
        }

      } catch (error) {
        console.error("Failed to fetch data:", error);
        // Handle error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Chạy một lần khi component mount


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