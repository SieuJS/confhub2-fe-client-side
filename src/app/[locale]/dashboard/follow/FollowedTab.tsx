import React, { useState, useEffect, useCallback } from 'react';
import { Link } from '@/src/navigation';
import Button from '../../utils/Button';
import FollowedConferenceCard from './FollowedConferenceCard';
import { ConferenceInfo, Location } from '@/src/models/response/conference.list.response';
import { useTranslations } from 'next-intl';
import { appConfig } from '@/src/middleware';
import { useAuth } from '@/src/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface FollowedTabProps { }

// Kế thừa ConferenceInfo (ngoại trừ 'dates') và thêm trường 'followedAt'
interface FollowedConferenceResponse extends Omit<ConferenceInfo, 'dates' | 'location'> { // Bỏ 'location' khỏi Omit
  id: string;
  followedAt: string;
  // Định nghĩa lại kiểu cho 'dates' để phản ánh nó là một MẢNG
  dates?: { fromDate?: string; toDate?: string }[];
  // Định nghĩa lại kiểu cho 'location' để khớp với API response VÀ TYPE CHÍNH XÁC
  location: Location | null; // Sử dụng kiểu Location đã import
}

const API_GET_USER_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1`;

const FollowedTab: React.FC<FollowedTabProps> = () => {
  const t = useTranslations('');
  const language = t('language');

  const [followedConferences, setFollowedConferences] = useState<
    FollowedConferenceResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true); // Biến này kiểm soát liệu đây có phải lần tải đầu tiên không
  const [isBanned, setIsBanned] = useState(false);
  const { logout } = useAuth();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No token found, cannot fetch followed conferences.');
      setLoggedIn(false);
      setFollowedConferences([]);
      setLoading(false);
      setInitialLoad(false); // Đảm bảo initialLoad được đặt thành false ngay cả khi không có token
      return;
    }

    setLoggedIn(true); // Giả sử đã đăng nhập nếu có token, sẽ được cập nhật lại nếu 401

    try {
      const response = await fetch(
        `${API_GET_USER_ENDPOINT}/follow-conference/followed`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Authentication error. Please log in.');
          setLoggedIn(false);
        } else if (response.status === 403) {
          console.error('User is banned.');
          setLoggedIn(false);
          setIsBanned(true);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setFollowedConferences([]); // Xóa dữ liệu cũ nếu có lỗi
        return;
      }

      let followed: FollowedConferenceResponse[] = await response.json();

      // Sắp xếp danh sách theo followedAt giảm dần (mới nhất lên trên)
      followed.sort((a, b) => {
        const dateA = new Date(a.followedAt).getTime();
        const dateB = new Date(b.followedAt).getTime();
        return dateB - dateA;
      });

      setFollowedConferences(followed);
    } catch (error) {
      console.error('Failed to fetch followed conferences:', error);
      setFollowedConferences([]);
      setLoggedIn(false); // Nếu có lỗi mạng hoặc lỗi khác, coi như chưa đăng nhập hoặc không lấy được dữ liệu
    } finally {
      setLoading(false);
      setInitialLoad(false); // Sau khi fetch xong, dù thành công hay thất bại, đây không còn là lần tải ban đầu
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Hàm render loading (đã có, nhưng đặt ở đây để dễ đọc)
  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-80 text-gray-500">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      <p className="mt-4 text-lg">{t('MyConferences.Loading_your_conferences')}</p>
    </div>
  );

  // LOGIC ĐIỀU CHỈNH CHÍNH:
  // 1. Nếu đang tải VÀ là lần tải ban đầu, hiển thị loading spinner.
  if (loading && initialLoad) {
    return <div className='container mx-auto p-4'>{renderLoading()}</div>;
  }

  // 2. Sau khi initialLoad đã hoàn tất, nếu không đăng nhập (hoặc bị cấm), hiển thị thông báo tương ứng.
  if (!loggedIn) {
    if (isBanned) {
      // Gọi logout chỉ khi thực sự có trạng thái bị cấm và cần xử lý
      // (có thể cân nhắc gọi ở useEffect để tránh vòng lặp render nếu logout thay đổi state)
      // Hiện tại, logic của bạn đã có preventRedirect, nên nó sẽ không chuyển hướng trang
      logout({ callApi: true, preventRedirect: true });
      return (
        <div className='container mx-auto p-4 text-center'>
          <h2 className='text-xl font-bold text-red-600 mb-2'>{t('MyConferences.Account_Banned_Title')}</h2>
          <p className='mb-4'>{t('MyConferences.Account_Banned_Message')}</p>
          <Link href='/auth/login'>
            <Button variant='primary'>{t('Sign_In')}</Button>
          </Link>
        </div>
      );
    } else {
      return (
        <div className='container mx-auto p-4 text-center'>
          <h2 className='text-xl font-semibold mb-2'>{t('MyConferences.Login_Required_Title')}</h2>
          <p className='mb-4'>{t('MyConferences.Login_Required_Message')}</p>
          <Link href='/auth/login'>
            <Button variant='primary'>{t('Sign_In')}</Button>
          </Link>
        </div>
      );
    }
  }

  // 3. Nếu đã đăng nhập và không bị cấm, hiển thị nội dung chính.
  return (
    <div className='container mx-auto p-4 md:p-6 bg-gray-10 min-h-screen'>
      <div className='flex justify-end mb-6'>
        <Link href="/conferences">
          <Button variant="primary" size="medium" rounded>{t('Explore_All_Conferences')}</Button>
        </Link>
      </div>

      <h1 className='my-4 text-xl font-semibold text-gray-800 md:text-2xl'>
        {t('Followed_Conferences')} ({followedConferences.length})
      </h1>

      {/* Hiển thị loading nếu không phải lần tải ban đầu nhưng vẫn đang tải (ví dụ: refresh dữ liệu) */}
      {loading && !initialLoad && renderLoading()}

      {/* Hiển thị nội dung nếu không còn loading HOẶC nếu không có loading ban đầu và danh sách trống */}
      {!loading && followedConferences.length === 0 ? (
        <div className="my-10 text-center text-gray-500 bg-white p-10 rounded-lg shadow-sm">
          <p className="text-lg">{t('You_are_not_following_any_conferences_yet')}</p>
          <Link href="/conferences">
            <Button
              variant="link"
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
            >
              {t('Explore_All_Conferences')}
            </Button>
          </Link>
        </div>
      ) : (
        // Chỉ hiển thị danh sách khi không còn loading HOẶC khi đã có dữ liệu
        !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {followedConferences.map(conference => (
              <FollowedConferenceCard
                key={conference.id}
                conference={conference}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default FollowedTab;