// BlacklistTab.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from '@/src/navigation';
import Button from '../../utils/Button';
import BlacklistConferenceCard from './BlacklistConferenceCard';
import { ConferenceInfo, Location } from '../../../../models/response/conference.list.response';
import { timeAgo, formatDateFull } from '../timeFormat'; // Giữ lại nếu vẫn dùng ở đâu đó khác
import Tooltip from '../../utils/Tooltip'; // Giữ lại nếu vẫn dùng ở đâu đó khác
import { useTranslations } from 'next-intl';
import { appConfig } from '@/src/middleware';
import { useAuth } from '@/src/contexts/AuthContext';
import { Loader2 } from 'lucide-react'; // THÊM DÒNG NÀY

interface BlacklistTabProps {}

const API_GET_BLACKLIST_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/blacklist-conference`;

// Định nghĩa lại kiểu dữ liệu cho BlacklistedConferences
interface BlacklistedConferenceResponse extends Omit<ConferenceInfo, 'dates' | 'location'> {
  conferenceId: string; // API trả về conferenceId
  title: string; // Đảm bảo các trường này có mặt
  acronym: string;
  location: Location | null; // Sử dụng Location từ models
  dates?: { fromDate?: string; toDate?: string }[]; // API của bạn có vẻ không có type, nên bỏ nó đi
  createdAt: string; // Thời gian blacklisted
  // Các trường khác từ ConferenceInfo nếu API blacklist trả về
}

const BlacklistTab: React.FC<BlacklistTabProps> = () => {
  const t = useTranslations('');
  const language = t('language');

  const [blacklistedConferences, setBlacklistedConferences] = useState<
    BlacklistedConferenceResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const { logout } = useAuth();
  const [isBanned, setIsBanned] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true); // Bắt đầu loading khi fetchData được gọi
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoggedIn(false);
        setBlacklistedConferences([]); // Đảm bảo làm sạch dữ liệu cũ
        return;
      }

      setLoggedIn(true); // Giả sử đã đăng nhập, sẽ được cập nhật lại nếu 401

      const response = await fetch(`${API_GET_BLACKLIST_ENDPOINT}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          console.error('User is banned.');
          setLoggedIn(false);
          setIsBanned(true);
        } else if (response.status === 401) {
          console.error('Authentication error. Please log in.');
          setLoggedIn(false);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setBlacklistedConferences([]);
        return;
      }

      let blacklist: BlacklistedConferenceResponse[] = await response.json();
      
      // Sắp xếp danh sách theo createdAt giảm dần (mới nhất lên trên)
      blacklist.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

      setBlacklistedConferences(blacklist);
    } catch (error) {
      console.error('Failed to fetch blacklist data:', error);
      setBlacklistedConferences([]);
      setLoggedIn(false);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Hàm render loading
  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-80 text-gray-500">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      <p className="mt-4 text-lg">{t('MyConferences.Loading_your_conferences')}</p> {/* Sử dụng cùng một key dịch */}
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
    }
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

  // 3. Nếu đã đăng nhập và không bị cấm, hiển thị nội dung chính.
  return (
    <div className='container mx-auto p-4 md:p-6 bg-gray-10 min-h-screen'>
      <div className='flex justify-end mb-6'>
        <Link href="/conferences">
          <Button variant="primary" size="medium" rounded>{t('Explore_All_Conferences')}</Button>
        </Link>
      </div>

      <h1 className='my-4 text-xl font-semibold text-gray-800 md:text-2xl'>
        {t('Blacklisted_Conferences')} ({blacklistedConferences.length})
      </h1>

      {/* Hiển thị loading nếu không phải lần tải ban đầu nhưng vẫn đang tải */}
      {loading && !initialLoad && renderLoading()}

      {/* Hiển thị nội dung nếu không còn loading HOẶC nếu không có loading ban đầu và danh sách trống */}
      {!loading && blacklistedConferences.length === 0 ? (
        <div className="my-10 text-center text-gray-500 bg-white p-10 rounded-lg shadow-sm">
          <p className="text-lg">{t('You_have_not_blacklisted_any_conferences_yet')}</p>
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
            {blacklistedConferences.map(conference => (
              <BlacklistConferenceCard
                key={conference.conferenceId}
                conference={conference}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default BlacklistTab;