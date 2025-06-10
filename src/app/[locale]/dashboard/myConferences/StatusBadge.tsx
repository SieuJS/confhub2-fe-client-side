// src/app/[locale]/dashoard/myconferences/StatusBadge.tsx
import React from 'react';
import { CheckCircle, Clock, XCircle, HelpCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

type ConferenceStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | string;

interface StatusBadgeProps {
  status: ConferenceStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const t = useTranslations('MyConferences');

  const statusConfig = {
    APPROVED: {
      text: t('Status_Approved'),
      icon: <CheckCircle className="w-4 h-4" />,
      className: 'bg-green-100 text-green-800',
    },
    PENDING: {
      text: t('Status_Pending'),
      icon: <Clock className="w-4 h-4" />,
      className: 'bg-yellow-100 text-yellow-800',
    },
    REJECTED: {
      text: t('Status_Rejected'),
      icon: <XCircle className="w-4 h-4" />,
      className: 'bg-red-100 text-red-800',
    },
  };

  // Chuẩn hóa status (ví dụ: 'pending' -> 'PENDING')
  const normalizedStatus = status.toUpperCase() as keyof typeof statusConfig;
  const config = statusConfig[normalizedStatus] || {
    text: t('Status_Unknown'),
    icon: <HelpCircle className="w-4 h-4" />,
    className: 'bg-gray-100 text-gray-800',
  };

  return (
    <span
      className={`inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.icon}
      {config.text}
    </span>
  );
};

export default StatusBadge;