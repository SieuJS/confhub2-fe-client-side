// src/hooks/addConference/useConferenceForm.ts

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LocationInput,
  ImportantDateInput,
  City,
  State,
  ConferenceFormData,
} from '@/src/models/send/addConference.send';
import { addConference } from '@/src/app/apis/conference/addConference';
import { useConferenceEditStore } from '@/src/stores/conferenceEditStore';
import { ConferenceResponse } from '@/src/models/response/conference.response';
import {
  fieldValidationSchema,
  validateField,
  validateDatesArray,
  DateError,
} from '@/src/utils/validation';
import countriesData from '@/src/app/[locale]/addconference/countries.json'; // Đảm bảo đường dẫn này đúng


// Định nghĩa kiểu cho hàm translation
type TranslationFunction = (key: string, values?: Record<string, any>) => string;

// *** THÊM 1: ĐỊNH NGHĨA STATE CHO VIỆC KIỂM TRA TỒN TẠI ***
interface ExistenceCheckState {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string | null;
}

interface UseConferenceFormProps {
  t: TranslationFunction;
}

interface ModalState {
  isOpen: boolean;
  status: 'success' | 'error' | null;
  title: string;
  message: string;
}

export type ConferenceType = 'Offline' | 'Online' | 'Hybrid';

// --- Helper Functions (giữ nguyên) ---
const toConferenceType = (accessType: string | undefined | null): ConferenceType => {
  const normalizedType = (accessType || '').trim().toUpperCase();
  switch (normalizedType) {
    case 'OFFLINE': return 'Offline';
    case 'ONLINE': return 'Online';
    case 'HYBRID': return 'Hybrid';
    default:
      console.warn(`Unknown conference type "${accessType}". Defaulting to "Offline".`);
      return 'Offline';
  }
};

const toYyyyMmDd = (isoDateString: string | undefined | null): string => {
  if (!isoDateString) return '';
  try {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error(`Invalid date string for conversion: ${isoDateString}`, error);
    return '';
  }
};

const mapResponseToFormData = (response: ConferenceResponse): Partial<ConferenceFormData> => {
  const org = response.organizations?.[0];
  if (!org) return {};
  const formattedDates = (org.conferenceDates || []).map((date: ImportantDateInput) => ({
    ...date,
    fromDate: toYyyyMmDd(date.fromDate),
    toDate: toYyyyMmDd(date.toDate),
  }));
  return {
    title: response.title,
    acronym: response.acronym,
    link: org.link,
    type: toConferenceType(org.accessType),
    description: org.summary,
    location: org.locations?.[0] || { address: '', cityStateProvince: '', country: '', continent: '' },
    dates: formattedDates.length > 0 ? formattedDates : [{ type: 'conferenceDates', name: 'Conference Dates', fromDate: '', toDate: '' }],
    topics: org.topics || [],
  };
};

// --- Custom Hook ---
export const useConferenceForm = ({ t }: UseConferenceFormProps) => {
  const router = useRouter();
  const pathname = usePathname();


  // *** THÊM 2: KHỞI TẠO STATE MỚI ***
  const [existenceCheck, setExistenceCheck] = useState<ExistenceCheckState>({
    status: 'idle',
    message: null,
  });

  const initialFormData: ConferenceFormData = {
    title: '', acronym: '', link: '', type: 'Offline',
    location: { address: '', cityStateProvince: '', country: '', continent: '' },
    dates: [{ type: 'conferenceDates', name: 'Conference Dates', fromDate: '', toDate: '' }],
    topics: [], imageUrl: '', description: '',
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ConferenceFormData>(initialFormData);
  const [newTopic, setNewTopic] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [dateErrors, setDateErrors] = useState<DateError[]>([]);
  const [globalDateError, setGlobalDateError] = useState<string | null>(null);
  const [topicError, setTopicError] = useState<string | null>(null);
  const [statesForReview, setStatesForReview] = useState<State[]>([]);
  const [citiesForReview, setCitiesForReview] = useState<City[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false, status: null, title: '', message: '',
  });

  const validateEntireForm = useCallback((dataToValidate: ConferenceFormData) => {
    const newFieldErrors: Record<string, string | null> = {};
    Object.keys(fieldValidationSchema).forEach(fieldName => {
      newFieldErrors[fieldName] = validateField(fieldName, dataToValidate, t);
    });
    setErrors(newFieldErrors);

    const { dateErrors: newDateErrors, globalDateError: newGlobalError } = validateDatesArray(dataToValidate.dates, t);
    setDateErrors(newDateErrors);
    setGlobalDateError(newGlobalError);
  }, [t]);

  useEffect(() => {
    validateEntireForm(formData);
  }, [formData, validateEntireForm]);


  // *** THÊM 3: useEffect ĐỂ KIỂM TRA TỒN TẠI VỚI DEBOUNCING ***
  useEffect(() => {
    const title = formData.title.trim();
    const acronym = formData.acronym.trim();

    // Điều kiện để không chạy kiểm tra:
    // 1. Dữ liệu chưa được "touch" (tránh chạy khi form mới load).
    // 2. Một trong hai trường rỗng.
    // 3. Hai trường giống nhau (lỗi client-side).
    if (!touchedFields.has('title') && !touchedFields.has('acronym')) {
      return;
    }

    if (!title || !acronym || title.toLowerCase() === acronym.toLowerCase()) {
      // Nếu không hợp lệ, reset trạng thái kiểm tra
      setExistenceCheck({ status: 'idle', message: null });
      return;
    }

    // Bắt đầu debouncing
    const handler = setTimeout(() => {
      const performCheck = async () => {
        setExistenceCheck({ status: 'loading', message: null });
        try {
          const params = new URLSearchParams({ title, acronym });
          const apiUrl = `${process.env.NEXT_PUBLIC_DATABASE_URL}/api/v1/conference/check-exists?${params.toString()}`;

          const response = await fetch(apiUrl);

          if (!response.ok) {
            throw new Error('API request failed');
          }

          const data: { exists: boolean; message: string } = await response.json();

          if (data.exists) {
            setExistenceCheck({ status: 'error', message: t('Conference_with_this_Title_and_Acronym_already_exists') });
          } else {
            setExistenceCheck({ status: 'success', message: t('This_combination_is_available') });
          }
        } catch (err) {
          console.error("Failed to check conference existence:", err);
          setExistenceCheck({ status: 'error', message: t('Failed_to_check_conference_existence') });
        }
      };

      performCheck();
    }, 500); // Đợi 500ms sau khi người dùng ngừng gõ

    // Cleanup function: Hủy bỏ timeout nếu user gõ tiếp
    return () => {
      clearTimeout(handler);
    };
  }, [formData.title, formData.acronym, t, touchedFields]);


  const isStep1Complete = useMemo(() => {
    const noFieldErrors = Object.values(errors).every(error => error === null);
    const noDateEntryErrors = dateErrors.every(errorObj => Object.values(errorObj).every(msg => !msg));
    const noGlobalDateErr = globalDateError === null;
    const noTopicErr = topicError === null;
    const requiredFieldsFilled =
      !!formData.title.trim() && !!formData.acronym.trim() && !!formData.link.trim() &&
      !!formData.type && formData.topics.length > 0 && !!formData.description.trim();

    // Điều kiện mới: Việc kiểm tra tồn tại phải thành công
    const existenceCheckPassed = existenceCheck.status === 'success';

    return noFieldErrors && noDateEntryErrors && noGlobalDateErr && noTopicErr && requiredFieldsFilled && existenceCheckPassed;
  }, [errors, dateErrors, globalDateError, topicError, formData, existenceCheck.status]); // Thêm dependency

  const { conferenceToEdit, setConferenceToEdit } = useConferenceEditStore();
  useEffect(() => {
    if (conferenceToEdit) {
      const mappedData = mapResponseToFormData(conferenceToEdit);
      setFormData(prev => ({ ...prev, ...mappedData }));
      setConferenceToEdit(null);
      setCurrentStep(1);
      // Khi edit, coi như tất cả các trường đã được touch để hiển thị lỗi ngay
      setTouchedFields(new Set(Object.keys(fieldValidationSchema)));
    }
  }, [conferenceToEdit, setConferenceToEdit]);


  // *** THÊM 5: CẬP NHẬT `useEffect` ĐỂ TÍCH HỢP LỖI TỒN TẠI ***
  // useEffect này sẽ chạy sau useEffect validation chính
  useEffect(() => {
    if (existenceCheck.status === 'error') {
      // Ghi đè lỗi của trường 'title' bằng thông báo từ server
      setErrors(prev => ({ ...prev, title: existenceCheck.message }));
    }
  }, [existenceCheck.status, existenceCheck.message]);

  const resetForm = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setNewTopic('');
    setAgreedToTerms(false);
    setTopicError(null);
    setModalState({ isOpen: false, status: null, title: '', message: '' });
    setTouchedFields(new Set());
    setExistenceCheck({ status: 'idle', message: null }); // Reset trạng thái kiểm tra

  };

  const handleBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  };

  const handleFieldChange = (field: keyof ConferenceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (field: keyof LocationInput, value: any) => {
    setFormData(prev => {
      const newLocation = { ...prev.location, [field]: value };
      if (field === 'continent') {
        newLocation.country = '';
        newLocation.cityStateProvince = '';
      } else if (field === 'country') {
        newLocation.cityStateProvince = '';
      }
      return { ...prev, location: newLocation };
    });
  };

  const handleAddTopic = () => {
    setTopicError(null);
    const trimmedTopic = newTopic.trim();
    if (!trimmedTopic) return;
    if (formData.topics.length >= 100) {
      setTopicError(t('You_can_add_a_maximum_of_100_topics'));
      return;
    }
    if (formData.topics.some(topic => topic.toLowerCase() === trimmedTopic.toLowerCase())) {
      setTopicError(t('This_topic_already_exists'));
      return;
    }
    setFormData(prev => ({ ...prev, topics: [...prev.topics, trimmedTopic] }));
    setNewTopic('');
  };

  const handleSetNewTopic = (value: string) => {
    setNewTopic(value);
    if (topicError) setTopicError(null);
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setFormData(prev => ({ ...prev, topics: prev.topics.filter(topic => topic !== topicToRemove) }));
  };

  const handleDateChange = (index: number, field: keyof ImportantDateInput, value: string) => {
    setFormData(prev => {
      const newDates = [...prev.dates];
      (newDates[index] as any)[field] = value;
      return { ...prev, dates: newDates };
    });
  };

  const addDate = () => {
    setFormData(prev => ({
      ...prev,
      dates: [...prev.dates, { type: '', name: '', fromDate: '', toDate: '' }],
    }));
  };

  const removeDate = (index: number) => {
    if (index !== 0) {
      setFormData(prev => ({
        ...prev,
        dates: prev.dates.filter((_, i) => i !== index),
      }));
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const goToNextStep = () => {
    if (currentStep === 1 && !isStep1Complete) {
      const allFieldKeys = new Set(Object.keys(fieldValidationSchema));
      setTouchedFields(prev => new Set([...prev, ...allFieldKeys]));
      console.error("Validation failed: Cannot proceed. Displaying all errors.");
      return;
    }
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  // --- HANDLER SUBMIT FORM ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== 3 || !agreedToTerms || isSubmitting) return;

    const userData = localStorage.getItem('user');
    if (!userData) {
      setModalState({ isOpen: true, status: 'error', title: t('Submission_Failed'), message: t('Please_log_in_to_add_new_Conference') });
      return;
    }
    const userId = JSON.parse(userData).id;
    const token = localStorage.getItem('token');

    setIsSubmitting(true);

    // *** BẮT ĐẦU LOGIC MỚI TẠI ĐÂY ***

    // 1. Tạo một bản sao của formData để sửa đổi mà không ảnh hưởng đến UI
    const payload = JSON.parse(JSON.stringify(formData));

    // 2. Chuẩn bị các phần của địa chỉ
    const addressParts: string[] = [];
    const { location } = payload;

    // Thêm địa chỉ cụ thể (số nhà, đường) nếu có
    if (location.address?.trim()) {
      addressParts.push(location.address.trim());
    }

    // Tìm tên City/State và thêm vào
    if (location.cityStateProvince) {
      // Ưu tiên tìm trong danh sách state trước
      const selectedState = statesForReview.find(s => s.iso2 === location.cityStateProvince);
      if (selectedState) {
        addressParts.push(selectedState.name);
      } else {
        // Nếu không phải state, nó có thể là city
        const selectedCity = citiesForReview.find(c => c.name === location.cityStateProvince);
        if (selectedCity) {
          addressParts.push(selectedCity.name);
        } else {
          // Nếu không tìm thấy, vẫn dùng giá trị gốc
          addressParts.push(location.cityStateProvince);
        }
      }
    }

    // Tìm tên Country và thêm vào
    if (location.country) {
      const selectedCountry = countriesData.find(c => c.iso2 === location.country);
      if (selectedCountry) {
        addressParts.push(selectedCountry.name);
      }
    }

    // Thêm Continent
    if (location.continent) {
      addressParts.push(location.continent);
    }

    // 3. Ghép các phần lại và cập nhật vào payload
    if (addressParts.length > 0) {
      payload.location.address = addressParts.join(', ');
    }

    // *** KẾT THÚC LOGIC MỚI ***

    try {
      // 4. Gửi payload đã được sửa đổi lên API
      await addConference(payload, userId, token);

      setModalState({ isOpen: true, status: 'success', title: t('Submission_Success'), message: t('Conference_Submitted_Message') });
    } catch (error: any) {
      setModalState({ isOpen: true, status: 'error', title: t('Submission_Failed'), message: `${t('Error_Submitting_Conference_Message')}: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    if (modalState.status === 'success') {
      resetForm();
    } else {
      setModalState({ isOpen: false, status: null, title: '', message: '' });
    }
  };

  return {
    currentStep, formData, newTopic, agreedToTerms, errors, dateErrors,
    globalDateError, topicError, isStep1Complete, isSubmitting, modalState,
    resetForm, closeModal, statesForReview, citiesForReview,
    touchedFields, // TRẢ VỀ
    setNewTopic: handleSetNewTopic, setAgreedToTerms, setStatesForReview, setCitiesForReview,
    handlers: {
      handleFieldChange, handleLocationChange, handleAddTopic, handleRemoveTopic,
      handleDateChange, addDate, removeDate, goToNextStep, goToPreviousStep,
      handleSubmit, handleBlur, // TRẢ VỀ
    },
    existenceCheck, // Trả về state mới

  };
};