// src/app/[locale]/dashboard/notifications/NotificationBulkActions.tsx

import React from 'react';
import { useTranslations } from 'next-intl';
import { Mail, MailOpen, Star, Trash2 } from 'lucide-react';

interface NotificationBulkActionsProps {
  checkedCount: number;
  selectAllChecked: boolean;
  onSelectAllChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  allSelectedAreRead: boolean;
  onMarkSelectedAsReadUnread: () => void;
  allSelectedAreImportant: boolean;
  onMarkSelectedAsImportantUnimportant: () => void;
  onDeleteSelected: () => void;
  isListEmpty: boolean;
  isSubmitting: boolean; // <-- Prop mới
}

const NotificationBulkActions: React.FC<NotificationBulkActionsProps> = ({
  checkedCount,
  selectAllChecked,
  onSelectAllChange,
  allSelectedAreRead,
  onMarkSelectedAsReadUnread,
  allSelectedAreImportant,
  onMarkSelectedAsImportantUnimportant,
  onDeleteSelected,
  isListEmpty,
  isSubmitting, // <-- Nhận prop mới

}) => {
  const t = useTranslations('');

  return (
    <div className='ml-0.5 mb-2 flex flex-wrap items-center gap-2'>
      <div className='flex items-center'>
        <input
          type='checkbox'
          id='select-all'
          className='ml-4 mr-2 h-4 w-4 cursor-pointer rounded border-gray-30 text-blue-600 focus:ring-button'
          checked={selectAllChecked}
          onChange={onSelectAllChange}
          aria-label='Select all notifications'
          disabled={isListEmpty || isSubmitting} // <-- Vô hiệu hóa khi đang submit

        />


        {/* === THAY ĐỔI BẮT ĐẦU TỪ ĐÂY === */}
        <label htmlFor='select-all' className='mr-4 flex cursor-pointer items-center gap-2 text-sm'>
          <span>{t('Select_All')}</span>
          {checkedCount > 0 && (
            <span className='rounded-full bg-indigo-100 px-2.5 py-0.5 text-sm font-semibold text-indigo-800'>
              {t('Selected_Count', { count: checkedCount })}
            </span>
          )}
        </label>
        {/* === KẾT THÚC THAY ĐỔI === */}
      </div>
      {checkedCount > 0 && (
        <>
          <button
            onClick={onMarkSelectedAsReadUnread}
            disabled={isSubmitting} // <-- Vô hiệu hóa
            className='flex min-w-[110px] items-center justify-center rounded bg-button px-2 py-1 text-sm font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 md:min-w-[140px] md:px-3 md:text-base'
            aria-label={
              allSelectedAreRead
                ? t('Mark_Selected_as_Unread')
                : t('Mark_Selected_as_Read')
            }
          >
            {allSelectedAreRead ? (
              <>
                <MailOpen className='mr-1 h-4 w-4 md:mr-2' />
                <span className='truncate'>{t('Mark_As_Unread')}</span>
              </>
            ) : (
              <>
                <Mail className='mr-1 h-4 w-4 md:mr-2' />
                <span className='truncate'>{t('Mark_As_Read')}</span>
              </>
            )}
          </button>
          <button
            onClick={onMarkSelectedAsImportantUnimportant}
            disabled={isSubmitting} // <-- Vô hiệu hóa
            className='flex min-w-[110px] items-center justify-center rounded bg-yellow-500 px-2 py-1 text-sm font-bold text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 md:min-w-[140px] md:px-3 md:text-base'
            aria-label={
              allSelectedAreImportant
                ? t('Mark_Selected_as_Unimportant')
                : t('Mark_Selected_as_Important')
            }
          >
            {allSelectedAreImportant ? (
              <>
                <Star
                  className='mr-1 h-4 w-4 md:mr-2'
                  stroke='currentColor'
                  fill='none'
                />
                <span className='truncate'>{t('Mark_As_Unimportant')}</span>
              </>
            ) : (
              <>
                <Star className='mr-1 h-4 w-4 md:mr-2' fill='currentColor' />
                <span className='truncate'>{t('Mark_As_Important')}</span>
              </>
            )}
          </button>
          <button
            onClick={onDeleteSelected}
            disabled={isSubmitting} // <-- Vô hiệu hóa
            className='flex min-w-[110px] items-center justify-center rounded bg-red-500 px-2 py-1 text-sm font-bold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 md:min-w-[140px] md:px-3 md:text-base'
            aria-label={t('Delete_Selected')}
          >
            <Trash2 className='mr-1 h-4 w-4 md:mr-2' />
            <span className='truncate'>{t('Delete_Selected')}</span>
          </button>
        </>
      )}
    </div>
  );
};

export default NotificationBulkActions;