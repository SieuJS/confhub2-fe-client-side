// src/app/[locale]/dashoard/myconferences/MyConferenceCard.tsx
import React from 'react';
import { Calendar, MapPin, Hash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ConferenceResponse } from '@/src/models/response/conference.response';
import StatusBadge from './StatusBadge';
import ConferenceActionButtons from './ConferenceActionButtons';
import { timeAgo, formatDateRange } from '../timeFormat'; // Đảm bảo đúng đường dẫn

interface MyConferenceCardProps {
  conference: ConferenceResponse;
  onViewReason: (message: string) => void;
  onViewSubmitted: (conference: ConferenceResponse) => void;
  onEdit: (conference: ConferenceResponse) => void;
}

const MyConferenceCard: React.FC<MyConferenceCardProps> = ({
  conference,
  ...actionHandlers
}) => {
  const t = useTranslations('');
  const language = t('language');
  const organization = conference.organizations?.[0];
  const location = organization?.locations?.[0];
  const conferenceDate = organization?.conferenceDates?.find(d => d.type === 'conferenceDates');

  const locationString = location
    ? `${location.cityStateProvince || ''}, ${location.country || ''}`.replace(/^, |^ |,$| $/, '')
    : t('MyConferences.Location_Not_Available');

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col"> {/* THÊM flex flex-col */}
      <div className="p-5 flex-grow"> {/* THÊM flex-grow */}
        {/* Header: Status và Thời gian tạo */}
        <div className="flex justify-between items-start mb-3">
          <StatusBadge status={conference.status} />
          <p className="text-sm text-gray-500 text-right">
            {t('MyConferences.Created')}<br />
            {timeAgo(conference.createdAt, language)}
          </p>
        </div>

        {/* Body: Thông tin chính */}
        {/* THÊM leading-tight để xử lý tiêu đề nhiều dòng */}
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
      {/* Footer không cần flex-grow, nó sẽ tự động dính vào cuối do flex-col trên parent */}
      <div className="bg-gray-10 px-5 py-3 border-t border-gray-200">
        <ConferenceActionButtons conference={conference} {...actionHandlers} />
      </div>
    </div>
  );
};

export default MyConferenceCard;