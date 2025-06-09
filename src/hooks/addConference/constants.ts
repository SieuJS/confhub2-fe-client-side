// src/constants/conference.ts

// ĐỊNH NGHĨA KIỂU MỚI, KHÔNG GÂY LỖI IMPORT
type TranslationFunction = (key: string, values?: Record<string, any>) => string;

/**
 * Generates the date type options for the dropdown.
 * @param t The translation function.
 * @returns An array of date type options.
 */
// SỬ DỤNG KIỂU MỚI
export const getDateTypeOptions = (t: TranslationFunction) => [
    { value: 'submissionDate', name: t('Submission_Date') },
    { value: 'conferenceDates', name: t('Conference_Dates') },
    { value: 'registrationDate', name: t('Registration_Date') },
    { value: 'notificationDate', name: t('Notification_Date') },
    { value: 'cameraReadyDate', name: t('Camera_Ready_Date') },
    { value: 'otherDate', name: t('Other_Date') }
];

export const CSC_API_KEY = process.env.NEXT_PUBLIC_CSC_API_KEY;