import { useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LocationInput,
  ImportantDateInput,
  City,
  State,
  ConferenceFormData,
} from '@/src/models/send/addConference.send';
import { addConference } from '@/src/app/apis/conference/addConference';
// IMPORT CÁC HÀM VALIDATION MỚI
import {
  validationSchema,
  validateField,
  validateDatesArray,
  DateError,
} from '@/src/utils/conferenceValidationSchema';

import {
  isBasicInfoComplete,
  isLogisticsComplete,
  isContentComplete,
} from '@/src/utils/addConferenceValidation'; // Import các hàm validator

// Định nghĩa kiểu cho hàm translation
type TranslationFunction = (key: string, values?: Record<string, any>) => string;

interface UseConferenceFormProps {
  t: TranslationFunction;
}

export const useConferenceForm = ({ t }: UseConferenceFormProps) => {
  const router = useRouter();
  const pathname = usePathname();

  // --- STATE DỮ LIỆU CỦA FORM ---
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ConferenceFormData>({
    title: '',
    acronym: '',
    link: '',
    type: 'Offline',
    location: {
      address: '',
      cityStateProvince: '',
      country: '',
      continent: '',
    },
    dates: [{ type: 'conferenceDates', name: 'Conference Dates', fromDate: '', toDate: '' }],
    topics: [],
    imageUrl: '',
    description: '',
  });
  const [newTopic, setNewTopic] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // --- STATE LỖI CỦA FORM ---
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [dateErrors, setDateErrors] = useState<DateError[]>([]);
  // THÊM STATE MỚI CHO LỖI TOÀN CỤC CỦA DATE
  const [globalDateError, setGlobalDateError] = useState<string | null>(null);
  const [topicError, setTopicError] = useState<string | null>(null); // THÊM STATE LỖI CHO TOPIC



  // --- STATE PHỤ TRỢ CHO UI ---
  const [statesForReview, setStatesForReview] = useState<State[]>([]);
  const [citiesForReview, setCitiesForReview] = useState<City[]>([]);


  // *** THÊM LOGIC TÍNH TOÁN TRẠNG THÁI HOÀN THÀNH CỦA STEP 1 ***
  const isStep1Complete = useMemo(() => {
    // Tạo một đối tượng props giả để truyền vào các hàm validator
    const validationProps = {
      formData,
      errors,
      dateErrors,
      globalDateError,
      topicError,
      t,
      // Các props khác không cần thiết cho validation nhưng có thể thêm vào nếu cần
      newTopic: '',
      setNewTopic: () => { },
      onFieldChange: () => { },
      onLocationChange: () => { },
      onDateChange: () => { },
      addDate: () => { },
      removeDate: () => { },
      addTopic: () => { },
      removeTopic: () => { },
      dateTypeOptions: [],
      cscApiKey: '',
      setStatesForReview: () => { },
      setCitiesForReview: () => { },
    };

    return (
      isBasicInfoComplete(validationProps) &&
      isLogisticsComplete(validationProps) &&
      isContentComplete(validationProps)
    );
  }, [formData, errors, dateErrors, globalDateError, topicError, t]);


  /**
   * Hàm validation đa năng.
   * Chạy validation cho một trường cụ thể và các trường liên quan.
   */
  const runValidation = useCallback((fieldName: string, updatedFormData: ConferenceFormData) => {
    const errorMessage = validateField(fieldName, updatedFormData, t);
    setErrors(prev => ({ ...prev, [fieldName]: errorMessage }));

    if (fieldName === 'title' || fieldName === 'acronym') {
      const otherField = fieldName === 'title' ? 'acronym' : 'title';
      const otherError = validateField(otherField, updatedFormData, t);
      setErrors(prev => ({ ...prev, [otherField]: otherError }));
    }
    if (fieldName === 'type') {
      ['location.address', 'location.continent', 'location.country', 'location.cityStateProvince'].forEach(locField => {
        const locError = validateField(locField, updatedFormData, t);
        setErrors(prev => ({ ...prev, [locField]: locError }));
      });
    }
    if (fieldName === 'location.continent') {
      const countryError = validateField('location.country', updatedFormData, t);
      const cityStateError = validateField('location.cityStateProvince', updatedFormData, t);
      setErrors(prev => ({
        ...prev,
        'location.country': countryError,
        'location.cityStateProvince': cityStateError,
      }));
    }
    if (fieldName === 'location.country') {
      const cityStateError = validateField('location.cityStateProvince', updatedFormData, t);
      setErrors(prev => ({
        ...prev,
        'location.cityStateProvince': cityStateError,
      }));
    }
  },
    [t]
  );

  const handleFieldChange = (field: keyof ConferenceFormData, value: any) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);
    runValidation(field, updatedFormData);
  };

  const handleLocationChange = (field: keyof LocationInput, value: any) => {
    setFormData(prevFormData => {
      const newLocation = { ...prevFormData.location, [field]: value };

      if (field === 'continent') {
        newLocation.country = '';
        newLocation.cityStateProvince = '';
      }
      else if (field === 'country') {
        newLocation.cityStateProvince = '';
      }

      const updatedFormData = { ...prevFormData, location: newLocation };
      runValidation(`location.${field}`, updatedFormData);
      return updatedFormData;
    });
  };

  // --- HANDLERS CỤ THỂ CHO TỪNG PHẦN CỦA FORM ---



  // --- HANDLERS CỤ THỂ CHO TỪNG PHẦN CỦA FORM ---

  const handleAddTopic = () => {
    setTopicError(null); // Xóa lỗi cũ
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
    if (topicError) {
      setTopicError(null); // Xóa lỗi khi người dùng bắt đầu gõ
    }
  }


  const handleRemoveTopic = (topicToRemove: string) => {
    setFormData(prev => ({ ...prev, topics: prev.topics.filter(topic => topic !== topicToRemove) }));
  };

  const handleDateChange = (index: number, field: keyof ImportantDateInput, value: string) => {
    const newDates = [...formData.dates];
    (newDates[index] as any)[field] = value;
    const updatedFormData = { ...formData, dates: newDates };
    setFormData(updatedFormData);

    // Chạy validation cho toàn bộ mảng dates và cập nhật cả hai loại lỗi
    const { dateErrors: newDateErrors, globalDateError: newGlobalError } = validateDatesArray(newDates, t);
    setDateErrors(newDateErrors);
    setGlobalDateError(newGlobalError);
  };

  const addDate = () => {
    const newDates = [...formData.dates, { type: '', name: '', fromDate: '', toDate: '' }];
    setFormData(prev => ({ ...prev, dates: newDates }));
    // Validate lại mảng dates sau khi thêm
    const { dateErrors: newDateErrors, globalDateError: newGlobalError } = validateDatesArray(newDates, t);
    setDateErrors(newDateErrors);
    setGlobalDateError(newGlobalError);
  };

  const removeDate = (index: number) => {
    if (index !== 0) {
      const newDates = formData.dates.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, dates: newDates }));
      // Validate lại mảng dates sau khi xóa
      const { dateErrors: newDateErrors, globalDateError: newGlobalError } = validateDatesArray(newDates, t);
      setDateErrors(newDateErrors);
      setGlobalDateError(newGlobalError);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToNextStep = () => {
    if (currentStep === 1) {
      const newErrors: Record<string, string | null> = {};
      let isFormValid = true;

      Object.keys(validationSchema).forEach(fieldName => {
        if (fieldName.startsWith('location.')) {
          const errorMessage = validateField(fieldName, formData, t);
          newErrors[fieldName] = errorMessage;
          if (errorMessage) isFormValid = false;
        } else {
          const errorMessage = validateField(fieldName, formData, t);
          newErrors[fieldName] = errorMessage;
          if (errorMessage) isFormValid = false;
        }
      });
      setErrors(newErrors);

      // Cập nhật logic validation cho dates để xử lý cả lỗi toàn cục
      const { dateErrors: newDateErrors, globalDateError: newGlobalError } = validateDatesArray(formData.dates, t);
      setDateErrors(newDateErrors);
      setGlobalDateError(newGlobalError);

      // Kiểm tra cả lỗi từng dòng và lỗi toàn cục
      if (newDateErrors.some(err => Object.values(err).some(msg => !!msg)) || newGlobalError) {
        isFormValid = false;
      }

      if (!isFormValid) {
        console.error("Validation failed", { newErrors, newDateErrors, newGlobalError });
        return;
      }
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 3 && !agreedToTerms) {
      alert(t('Please_agree_to_the_terms_and_conditions'));
      return;
    }

    // Đảm bảo form đã valid trước khi submit
    goToNextStep();
    if (currentStep !== 3) return;

    const userData = localStorage.getItem('user');
    if (!userData) {
      alert(t('Please_log_in_to_add_new_Conference'));
      return;
    }
    const userId = JSON.parse(userData).id;
    const token = localStorage.getItem('token');

    try {
      await addConference(formData, userId, token);
      const localePrefix = pathname.split('/')[1];
      router.push(`/${localePrefix}/dashboard?tab=myconferences`);
    } catch (error: any) {
      console.error('Error adding conference:', error.message);
      alert(`${t('Error_adding_conference')}: ${error.message}`);
    }
  };

  // --- RETURN OBJECT ---
  return {
    currentStep,
    // Dữ liệu form
    formData,
    newTopic,
    agreedToTerms,
    // State lỗi
    errors,
    dateErrors,
    globalDateError, // TRẢ VỀ LỖI TOÀN CỤC
    topicError, // Trả về topicError
    isStep1Complete, // TRẢ VỀ TRẠNG THÁI HOÀN THÀNH


    // State UI phụ trợ
    statesForReview,
    citiesForReview,
    // Handlers đã được bọc logic validation
    setNewTopic: handleSetNewTopic, // Trả về handler mới
    setAgreedToTerms,
    setStatesForReview,
    setCitiesForReview,
    handlers: {
      handleFieldChange,
      handleLocationChange,
      handleAddTopic,
      handleRemoveTopic,
      handleDateChange,
      addDate,
      removeDate,
      goToNextStep,
      goToPreviousStep,
      handleSubmit,
    },
  };
};