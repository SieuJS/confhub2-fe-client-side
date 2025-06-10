// src/app/[locale]/dashboard/myconferences/FollowedConferenceCard.tsx
import React from 'react';
import { Calendar, MapPin, Hash, Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/navigation';
import Button from '../../utils/Button';
import { timeAgo } from '../timeFormat'; // Đảm bảo đúng đường dẫn
import { Location } from '@/src/models/response/conference.list.response'; // Import Location

// Định nghĩa hàm formatDateRange từ MyConferencesTab hoặc tạo mới nếu chưa có
// Nếu nó nằm trong timeFormat.ts, hãy import từ đó.
const formatDateRange = (from?: string, to?: string, language?: string) => {
  if (!from && !to) return "N/A";
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const fromDate = from ? new Date(from).toLocaleDateString(language, options) : '';
  const toDate = to ? new Date(to).toLocaleDateString(language, options) : '';

  if (fromDate === toDate) return fromDate;
  if (fromDate && toDate) return `${fromDate} - ${toDate}`;
  return fromDate || toDate;
};


interface FollowedConferenceResponseForCard {
  id: string;
  title: string;
  acronym: string;
  location: Location | null;
  dates?: { fromDate?: string; toDate?: string }[];
  followedAt: string;
}

interface FollowedConferenceCardProps {
  conference: FollowedConferenceResponseForCard;
}

const FollowedConferenceCard: React.FC<FollowedConferenceCardProps> = ({
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
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col"> {/* THÊM flex flex-col */}
      <div className="p-5 flex-grow"> {/* THÊM flex-grow */}
        {/* Header: Thời gian follow */}
        <div className="flex justify-between items-start mb-3">
          <p className="text-sm text-gray-500 text-left"> 
            {t('Followed_Time')}:{' '} {/* Sửa cú pháp nối chuỗi */}
            {timeAgo(conference.followedAt, language)}
          </p>
        </div>

        {/* Body: Thông tin chính */}
        {/* Đảm bảo tiêu đề có đủ không gian và không bị cắt */}
        <h3 className="text-lg font-bold text-indigo-700 hover:text-indigo-900 transition-colors leading-tight"> {/* THÊM leading-tight */}
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
      {/* Footer không cần flex-grow, nó sẽ tự động dính vào cuối do flex-col trên parent */}
      <div className="bg-gray-10 px-5 py-3 border-t border-gray-200 flex justify-end">
        <Link
          href={{
            pathname: '/conferences/detail',
            query: { id: conference.id }
          }}
        >
          {/* Đổi kích thước nút thành 'small' và văn bản thành 'View Details' để khớp với hình ảnh */}
          <Button variant="primary" size="small" rounded className="inline-flex items-center gap-2">
            {t('View_Details')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default FollowedConferenceCard;