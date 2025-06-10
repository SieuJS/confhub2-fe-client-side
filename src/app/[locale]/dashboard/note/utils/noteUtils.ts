// src/app/[locale]/dashboard/note/utils/noteUtils.ts
// KHÔNG CẦN IMPORT TFunction NỮA

export type NoteType =
  | 'conferenceDates'
  | 'submissionDate'
  | 'notificationDate'
  | 'cameraReadyDate'
  | 'registrationDate'
  | 'yourNote'
  | 'other';

export const typeColors: Record<NoteType, string> = {
  conferenceDates: 'bg-teal-200',
  submissionDate: 'bg-red-200',
  notificationDate: 'bg-blue-200',
  cameraReadyDate: 'bg-orange-200',
  registrationDate: 'bg-cyan-200',
  yourNote: 'bg-yellow-200',
  other: 'bg-gray-200'
};

export const getEventTypeColor = (type: NoteType): string => {
  return typeColors[type] || typeColors['other'];
};

// SỬA Ở ĐÂY: Thay TFunction<any, any> bằng (key: string) => string
export const getTypeText = (type: NoteType, t: (key: string) => string): string => {
  switch (type) {
    case 'conferenceDates':
      return t('Conference_Dates');
    case 'submissionDate':
      return t('Submission_Dates');
    case 'notificationDate':
      return t('Notification_Dates');
    case 'cameraReadyDate':
      return t('Camera_Ready_Dates');
    case 'registrationDate':
      return t('Registration_Dates');
    case 'yourNote':
      return t('Your_Notes');
    default:
      return t('Other');
  }
};

export const areDatesContiguous = (date1: Date, date2: Date): boolean => {
  const diffInTime = Math.abs(date2.getTime() - date1.getTime());
  const diffInDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24));
  return diffInDays === 1;
};