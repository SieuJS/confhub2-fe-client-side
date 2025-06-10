// src/app/[locale]/dashboard/blacklist/BlacklistConferenceCard.tsx
import React from 'react';
import { Calendar, MapPin, Hash, Eye, Ban } from 'lucide-react'; // Thêm icon Ban
import { useTranslations } from 'next-intl';
import { Link } from '@/src/navigation';
import Button from '../../utils/Button';
import { timeAgo, formatDateRange } from '../timeFormat'; // Đảm bảo đúng đường dẫn
import { Location } from '@/src/models/response/conference.list.response'; // Import Location

// Định nghĩa lại interface cho dữ liệu card Blacklist
interface BlacklistConferenceResponseForCard {
  id: string; // Đây là conferenceId từ API của bạn
  title: string;
  acronym: string;
  location: Location | null; // Sử dụng Location từ models
  dates?: { fromDate?: string; toDate?: string }[]; // API của bạn có vẻ không có type, nên bỏ nó đi
  createdAt: string; // Đây là thời gian blacklisted
}

interface BlacklistConferenceCardProps {
  conference: BlacklistConferenceResponseForCard;
}

const BlacklistConferenceCard: React.FC<BlacklistConferenceCardProps> = ({
  conference,
}) => {
  const t = useTranslations('');
  const language = t('language');

  const conferenceDate = conference.dates?.[0]; // Lấy phần tử đầu tiên của mảng dates

  const locationString = (() => {
    if (!conference.location) {
      return t('Location_not_available') || 'Location not available';
    }
    const parts: string[] = [];
    if (conference.location.cityStateProvince) {
      parts.push(conference.location.cityStateProvince);
    }
    if (conference.location.country) {
      parts.push(conference.location.country);
    }
    if (parts.length === 0) {
      return t('Location_not_available') || 'Location not available';
    }
    return parts.join(', ');
  })();

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
      <div className="p-5 flex-grow">
        {/* Header: Thời gian Blacklisted */}
        <div className="flex justify-between items-start mb-3">
          <p className="text-sm text-gray-500 text-left">
            {t('Blacklisted_Time')}:{' '}
            {timeAgo(conference.createdAt, language)}
          </p>
          {/* Có thể thêm một badge "Blacklisted" ở đây nếu muốn */}
          <Ban className="w-5 h-5 text-red-500 flex-shrink-0" /> {/* Icon cảnh báo */}
        </div>

        {/* Body: Thông tin chính */}
        <h3 className="text-lg font-bold text-indigo-700 hover:text-indigo-900 transition-colors leading-tight">
          {conference.title}
        </h3>
        <div className="mt-2 space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>{conference.acronym}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>
              {conferenceDate
                ? formatDateRange(conferenceDate.fromDate, conferenceDate.toDate, language)
                : t('MyConferences.Date_Not_Available')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>{locationString}</span>
          </div>
        </div>
      </div>

      {/* Footer: Các nút hành động */}
      <div className="bg-gray-10 px-5 py-3 border-t border-gray-200 flex justify-end">
        <Link
          href={{
            pathname: '/conferences/detail',
            query: { id: conference.id }
          }}
        >
          <Button variant="primary" size="small" rounded className="inline-flex items-center gap-2">
            {t('View_Details')}
          </Button>
        </Link>
        {/* Có thể thêm nút "Unblacklist" ở đây nếu có API */}
      </div>
    </div>
  );
};

export default BlacklistConferenceCard;