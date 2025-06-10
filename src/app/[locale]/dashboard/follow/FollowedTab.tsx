// src/components/MyConferences/FollowedTab.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from '@/src/navigation';
import Button from '../../utils/Button';
import FollowedConferenceCard from './FollowedConferenceCard';
import { ConferenceInfo, Location } from '@/src/models/response/conference.list.response';
import { useTranslations } from 'next-intl';
import { appConfig } from '@/src/middleware';
import { useAuth } from '@/src/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import SearchInput from '../../utils/SearchInput';

interface FollowedTabProps { }

interface FollowedConferenceResponse extends Omit<ConferenceInfo, 'dates' | 'location'> {
  id: string;
  followedAt: string;
  dates?: { fromDate?: string; toDate?: string }[];
  location: Location | null;
}

const API_GET_USER_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1`;

// TÁCH COMPONENT LOADING RA ĐỂ TÁI SỬ DỤNG
const LoadingSpinner = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-80 text-gray-500">
    <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
    <p className="mt-4 text-lg">{message}</p>
  </div>
);


const FollowedTab: React.FC<FollowedTabProps> = () => {
  const t = useTranslations('');
  
  // BỎ isInitializing, chỉ cần isLoggedIn và logout
  const { logout, isLoggedIn } = useAuth();

  const [followedConferences, setFollowedConferences] = useState<FollowedConferenceResponse[]>([]);
  // State loading giờ chỉ phục vụ cho việc fetch conference
  const [loading, setLoading] = useState(true); 
  const [isBanned, setIsBanned] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    // Không cần set loading ở đây nữa, vì state ban đầu đã là true
    const token = localStorage.getItem('token');

    // isLoggedIn đã đảm bảo có token, nhưng kiểm tra lại cho chắc chắn
    if (!token) {
      setLoading(false);
      return;
    }

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
        if (response.status === 403) {
          setIsBanned(true);
        }
        // Các lỗi khác sẽ được AuthContext xử lý (logout nếu 401)
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let followed: FollowedConferenceResponse[] = await response.json();
      followed.sort((a, b) => new Date(b.followedAt).getTime() - new Date(a.followedAt).getTime());
      setFollowedConferences(followed);
    } catch (error) {
      console.error('Failed to fetch followed conferences:', error);
      setFollowedConferences([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Component này được render nghĩa là isInitializing đã xong.
    // Giờ chỉ cần kiểm tra isLoggedIn để quyết định fetch data hay không.
    if (isLoggedIn) {
      fetchData();
    } else {
      // Nếu không đăng nhập, dừng loading ngay lập tức để hiển thị thông báo
      setLoading(false);
    }
  }, [isLoggedIn, fetchData]);

  const filteredConferences = useMemo(() => {
    if (!searchTerm) return followedConferences;
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return followedConferences.filter(conference =>
      conference.title.toLowerCase().includes(lowercasedSearchTerm) ||
      conference.acronym.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [searchTerm, followedConferences]);

  // LOGIC RENDER MỚI, ĐƠN GIẢN HƠN
  
  // 1. Ưu tiên trạng thái loading của chính component này
  if (loading) {
    return (
      <div className='container mx-auto p-4'>
        <LoadingSpinner message={t('MyConferences.Loading_your_conferences')} />
      </div>
    );
  }

  // 2. Nếu không loading, kiểm tra trạng thái đăng nhập
  if (!isLoggedIn) {
    if (isBanned) {
      logout({ callApi: true, preventRedirect: true });
      return (
        <div className='container mx-auto p-4 text-center'>
          <h2 className='text-xl font-bold text-red-600 mb-2'>{t('MyConferences.Account_Banned_Title')}</h2>
          <p className='mb-4'>{t('MyConferences.Account_Banned_Message')}</p>
          <Link href='/auth/login'><Button variant='primary'>{t('Sign_In')}</Button></Link>
        </div>
      );
    }
    return (
      <div className='container mx-auto p-4 text-center'>
        <h2 className='text-xl font-semibold mb-2'>{t('MyConferences.Login_Required_Title')}</h2>
        <p className='mb-4'>{t('MyConferences.Login_Required_Message')}</p>
        <Link href='/auth/login'><Button variant='primary'>{t('Sign_In')}</Button></Link>
      </div>
    );
  }

  // 3. Nếu đã đăng nhập và không loading, hiển thị nội dung
  return (
    <div className='container mx-auto p-4 md:p-6 bg-gray-10 min-h-screen'>
      <div className='flex justify-between items-center mb-6 flex-wrap gap-4'>
        <h1 className='text-xl font-semibold text-gray-800 md:text-2xl'>
          {t('Followed_Conferences')} ({followedConferences.length})
        </h1>
        <Link href="/conferences">
          <Button variant="primary" size="medium" rounded>{t('Explore_All_Conferences')}</Button>
        </Link>
      </div>

      {followedConferences.length > 0 && (
        <div className="mb-6">
          <SearchInput
            initialValue={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder={t('Search_followed_conferences') || 'Search by name or acronym...'}
          />
        </div>
      )}

      {followedConferences.length === 0 && (
        <div className="my-10 text-center text-gray-500 bg-white p-10 rounded-lg shadow-sm">
          <p className="text-lg">{t('You_are_not_following_any_conferences_yet')}</p>
          <Link href="/conferences">
            <Button variant="link" className="mt-2 text-sm text-indigo-600 hover:text-indigo-800">
              {t('Explore_All_Conferences')}
            </Button>
          </Link>
        </div>
      )}

      {followedConferences.length > 0 && filteredConferences.length === 0 && (
        <div className="my-10 text-center text-gray-500 bg-white p-10 rounded-lg shadow-sm">
          <p className="text-lg">{t('No_conferences_match_your_search')}</p>
        </div>
      )}

      {filteredConferences.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredConferences.map(conference => (
            <FollowedConferenceCard key={conference.id} conference={conference} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowedTab;