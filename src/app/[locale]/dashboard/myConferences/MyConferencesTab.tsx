'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/src/navigation';
import { Loader2 } from 'lucide-react';

// Hooks & Stores
import { useAuth } from '@/src/contexts/AuthContext';
import useMyConferences from '@/src/hooks/dashboard/myConferences/useMyConferences';
import { useConferenceEditStore } from '@/src/stores/conferenceEditStore';

// Components
import MyConferenceCard from './MyConferenceCard';
import ConferenceReviewStep from '../../addconference/steps/ConferenceReviewStep';
import Modal from '../../chatbot/Modal';
import Button from '../../utils/Button';
import SearchInput from '../../utils/SearchInput'; 

// Types
import { ConferenceResponse } from '@/src/models/response/conference.response';
import { ConferenceType } from '@/src/hooks/addConference/useConferenceForm';

// Enum for conference status
const ConferenceStatus = {
  Approve: 'APPROVED',
  Pending: 'PENDING',
  Rejected: 'REJECTED',
} as const;

type StatusFilter = typeof ConferenceStatus[keyof typeof ConferenceStatus] | 'All';

const MyConferencesTab: React.FC = () => {
  const t = useTranslations('');
  const router = useRouter();
  const { user, getToken, isInitializing: isAuthInitializing, isLoggedIn, logout } = useAuth();
  const { conferences, isLoading, error, refetch } = useMyConferences(user?.id || null, getToken);

  const [displayStatus, setDisplayStatus] = useState<StatusFilter>('PENDING');
  const [modalContent, setModalContent] = useState<{ type: 'reason' | 'review'; data: any } | null>(null);

  const [searchTerm, setSearchTerm] = useState('');

  const setConferenceToEdit = useConferenceEditStore((state) => state.setConferenceToEdit);

  // --- Action Handlers ---
  const handleViewReason = (message: string) => {
    setModalContent({ type: 'reason', data: message });
  };

  const handleViewSubmitted = (conferenceData: ConferenceResponse) => {
    const organization = conferenceData.organizations?.[0];
    const location = organization?.locations?.[0];

    const toConferenceType = (accessType: string | undefined): ConferenceType => {
      const upperType = (accessType || '').toUpperCase();
      if (upperType === 'ONLINE' || upperType === 'OFFLINE' || upperType === 'HYBRID') {
        return accessType as ConferenceType;
      }
      return 'Offline';
    };

    const reviewProps = {
      title: conferenceData.title,
      acronym: conferenceData.acronym,
      link: organization?.link || '',
      type: toConferenceType(organization?.accessType),
      location: location || { address: '', cityStateProvince: '', country: '', continent: '' },
      dates: organization?.conferenceDates || [],
      topics: organization?.topics || [],
      // imageUrl: organization?.imageUrl || '',
      description: organization?.summary || '',
      t: (key: string) => t(`AddConference.${key}`),
      statesForReview: [],
      citiesForReview: [],
    };
    setModalContent({ type: 'review', data: reviewProps });
  };

  const handleEdit = (conferenceData: ConferenceResponse) => {
    setConferenceToEdit(conferenceData);
    router.push('/addconference');
  };

  const closeModal = () => setModalContent(null);

  // --- Data Filtering ---
  const filteredConferences = useMemo(() => {
    if (!conferences) return [];
    const sorted = [...conferences].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    let tempFiltered = sorted;

    // Lọc theo trạng thái
    if (displayStatus !== 'All') {
      tempFiltered = tempFiltered.filter(conf => conf.status.toUpperCase() === displayStatus);
    }

    // LỌC THEO SEARCH TERM
    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      tempFiltered = tempFiltered.filter(conf =>
        conf.title.toLowerCase().includes(lowercasedSearchTerm) ||
        conf.acronym.toLowerCase().includes(lowercasedSearchTerm)
      );
    }

    return tempFiltered;
  }, [conferences, displayStatus, searchTerm]);

  // --- Render Logic ---

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-80 text-gray-500">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      <p className="mt-4 text-lg">{t('MyConferences.Loading_your_conferences')}</p>
    </div>
  );

  const renderError = () => {
    if (error === 'User is banned') {
      if (isLoggedIn) logout({ callApi: true, preventRedirect: true });
      return (
        <div className="container mx-auto p-4 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">{t('MyConferences.Account_Banned_Title')}</h2>
          <p className="mb-4">{t('MyConferences.Account_Banned_Message')}</p>
          <Link href="/auth/login">
            <Button variant="primary">{t('Sign_In')}</Button>
          </Link>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-80 text-red-500">
        <p className="mb-4 text-lg">{t('Error_loading_conferences')}: {error}</p>
        <Button onClick={refetch} variant="secondary">{t('Try_Again')}</Button>
      </div>
    );
  };

  const renderNotLoggedIn = () => (
    <div className="container mx-auto p-4 text-center">
      <h2 className="text-xl font-semibold mb-2">{t('MyConferences.Login_Required_Title')}</h2>
      <p className="mb-4">{t('MyConferences.Login_Required_Message')}</p>
      <Link href="/auth/login">
        <Button variant="primary">{t('Sign_In')}</Button>
      </Link>
    </div>
  );

  if (isAuthInitializing) return renderLoading();
  if (!isLoggedIn) return renderNotLoggedIn();
  if (error) return renderError();
  if (isLoading) return renderLoading();

  const getStatusTitle = (status: StatusFilter) => {
    const count = filteredConferences.length;
    const key = `MyConferences.Title_${status}`;
    return t.rich(key, {
      count: count,
      b: (chunks) => <strong>{chunks}</strong>
    });
  };

  const filterButtons = [
    { label: t('All'), status: 'All' as StatusFilter },
    { label: t('Pending'), status: ConferenceStatus.Pending as StatusFilter },
    { label: t('Approved'), status: ConferenceStatus.Approve as StatusFilter },
    { label: t('Rejected'), status: ConferenceStatus.Rejected as StatusFilter },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-10 min-h-screen">
      {/* Thanh Search trên đầu */}
      {conferences && conferences.length > 0 && (
        <div className="mb-6">
          <SearchInput
            initialValue={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder={t('Search_my_conferences') || 'Search by title or acronym...'}
          />
        </div>
      )}

      {/* Các nút actions: filter bên trái, Add Conference bên phải */}
      <div className="bg-white p-3 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4"> {/* Đặt flex-col cho mobile, flex-row cho desktop */}
          {/* Các nút filter ở bên trái */}
          <div className="flex flex-wrap gap-2 order-2 md:order-1 w-full md:w-auto justify-center md:justify-start"> {/* Điều chỉnh thứ tự và căn chỉnh */}
            {filterButtons.map(btn => (
              <Button
                key={btn.status}
                variant={displayStatus === btn.status ? 'primary' : 'secondary'}
                size="small"
                onClick={() => setDisplayStatus(btn.status)}
              >
                {btn.label}
              </Button>
            ))}
          </div>

          {/* Nút Add Conference ở bên phải */}
          <Link href="/addconference" className="order-1 md:order-2"> {/* Điều chỉnh thứ tự */}
            <Button variant="primary" size="medium" rounded>{t('Add_Conference')}</Button>
          </Link>
        </div>
      </div>

      <h1 className="my-4 text-xl font-semibold text-gray-800 md:text-2xl">
        {getStatusTitle(displayStatus)}
      </h1>

      {filteredConferences.length === 0 ? (
        <div className="my-10 text-center text-gray-500 bg-white p-10 rounded-lg shadow-sm">
          <p className="text-lg">
            {searchTerm && conferences && conferences.length > 0
              ? t('No_conferences_match_your_search')
              : t('MyConferences.You_have_no_conference_in_this_category')}
          </p>
          {(displayStatus !== 'All' || (searchTerm && conferences && conferences.length > 0)) && (
            <Button
              variant="link"
              onClick={() => {
                setDisplayStatus('All');
                setSearchTerm('');
              }}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
            >
              {t('MyConferences.View_all_conferences')}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredConferences.map(conference => (
            <MyConferenceCard
              key={conference.id}
              conference={conference}
              onViewReason={handleViewReason}
              onViewSubmitted={handleViewSubmitted}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={!!modalContent}
        onClose={closeModal}
        title={
          modalContent?.type === 'reason'
            ? t('MyConferences.Modal_Title_Reason')
            : t('MyConferences.Modal_Title_Review')
        }
        size={modalContent?.type === 'review' ? '4xl' : 'lg'}
        footer={
          <Button onClick={closeModal} variant="secondary">{t('Close')}</Button>
        }
      >
        {modalContent?.type === 'reason' && (
          <div className="p-4 text-gray-700 whitespace-pre-wrap bg-gray-10 rounded-md">
            {modalContent.data}
          </div>
        )}
        {modalContent?.type === 'review' && (
          <div className="p-1 max-h-[70vh] overflow-y-auto">
            <ConferenceReviewStep {...modalContent.data} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyConferencesTab;