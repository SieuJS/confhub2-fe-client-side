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

import { useConferenceEditStore } from '@/src/stores/conferenceEditStore'; // IMPORT STORE
import { ConferenceResponse } from '@/src/models/response/conference.response'; // IMPORT TYPE

import {
  fieldValidationSchema,
  validateField,
  validateDatesArray,
  DateError,
} from '@/src/utils/validation';

import {
  isBasicInfoComplete,
  isLogisticsComplete,
  isContentComplete,
} from '@/src/utils/validation/addConferenceValidation'; // Import các hàm validator

// Định nghĩa kiểu cho hàm translation
type TranslationFunction = (key: string, values?: Record<string, any>) => string;

interface UseConferenceFormProps {
  t: TranslationFunction;
}


// *** BƯỚC 1: ĐỊNH NGHĨA STATE CHO MODAL ***
interface ModalState {
  isOpen: boolean;
  status: 'success' | 'error' | null;
  title: string;
  message: string;
}


// Định nghĩa kiểu cho các giá trị hợp lệ của 'type'
export type ConferenceType = 'Offline' | 'Online' | 'Hybrid';

/**
 * Helper function để xác thực và ép kiểu cho accessType.
 * Nó nhận một chuỗi và trả về một ConferenceType hợp lệ hoặc 'Offline' làm giá trị mặc định.
 * @param accessType - Chuỗi accessType từ API.
 * @returns Một giá trị ConferenceType hợp lệ.
 */
const toConferenceType = (accessType: string | undefined | null): ConferenceType => {
  // Chuẩn hóa chuỗi đầu vào: loại bỏ khoảng trắng và chuyển thành chữ hoa
  const normalizedType = (accessType || '').trim().toUpperCase();

  switch (normalizedType) {
    case 'OFFLINE':
      return 'Offline';
    case 'ONLINE':
      return 'Online';
    case 'HYBRID':
      return 'Hybrid';
    default:
      // Nếu giá trị không khớp, trả về một giá trị mặc định an toàn.
      // 'Offline' thường là một lựa chọn tốt.
      console.warn(`Unknown conference type "${accessType}". Defaulting to "Offline".`);
      return 'Offline';
  }
};


/**
 * Helper function để chuyển đổi chuỗi ngày ISO sang định dạng 'yyyy-MM-dd'.
 * @param isoDateString - Chuỗi ngày tháng ở định dạng ISO.
 * @returns Chuỗi ngày tháng ở định dạng 'yyyy-MM-dd' hoặc chuỗi rỗng nếu đầu vào không hợp lệ.
 */
const toYyyyMmDd = (isoDateString: string | undefined | null): string => {
  if (!isoDateString) return '';
  try {
    // Tạo đối tượng Date từ chuỗi ISO
    const date = new Date(isoDateString);
    // Lấy các thành phần của ngày
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0, nên +1
    const day = date.getDate().toString().padStart(2, '0');
    // Trả về chuỗi đã định dạng
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error(`Invalid date string for conversion: ${isoDateString}`, error);
    return '';
  }
};

const mapResponseToFormData = (response: ConferenceResponse): Partial<ConferenceFormData> => {
  const org = response.organizations?.[0];
  if (!org) return {};

  // *** SỬA LỖI TẠI ĐÂY: Chuyển đổi định dạng ngày trong mảng dates ***
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
    // imageUrl: org.imageUrl || '',
    location: org.locations?.[0] || { address: '', cityStateProvince: '', country: '', continent: '' },
    // Sử dụng mảng ngày đã được định dạng lại
    dates: formattedDates,
    topics: org.topics || [],
    // id: response.id,
  };
};


export const useConferenceForm = ({ t }: UseConferenceFormProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const initialFormData: ConferenceFormData = {
    title: '',
    acronym: '',
    link: '',
    type: 'Offline',
    location: { address: '', cityStateProvince: '', country: '', continent: '' },
    dates: [{ type: 'conferenceDates', name: 'Conference Dates', fromDate: '', toDate: '' }],
    topics: [],
    imageUrl: '',
    description: '',
  };

  // --- STATE DỮ LIỆU CỦA FORM ---
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ConferenceFormData>(initialFormData);
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


  // *** BƯỚC 2: THÊM STATE MỚI CHO MODAL VÀ TRẠNG THÁI SUBMITTING ***
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    status: null,
    title: '',
    message: '',
  });

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


  // Lấy conference data và hàm clear từ store
  const { conferenceToEdit, setConferenceToEdit } = useConferenceEditStore();

  // *** LOGIC MỚI: TỰ ĐỘNG ĐIỀN FORM KHI CÓ DỮ LIỆU EDIT ***
  useEffect(() => {
    if (conferenceToEdit) {
      console.log("Editing conference:", conferenceToEdit);
      const mappedData = mapResponseToFormData(conferenceToEdit);

      // Cập nhật formData với dữ liệu đã map
      setFormData(prev => ({ ...prev, ...mappedData }));

      // Sau khi load xong, xóa dữ liệu khỏi store để không bị load lại khi refresh
      setConferenceToEdit(null);

      // Có thể chuyển người dùng đến bước đầu tiên
      setCurrentStep(1);
    }
  }, [conferenceToEdit, setConferenceToEdit]);



  // *** BƯỚC 3: TẠO HÀM ĐỂ RESET FORM ***
  const resetForm = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setErrors({});
    setDateErrors([]);
    setGlobalDateError(null);
    setTopicError(null);
    setNewTopic('');
    setAgreedToTerms(false);
    setModalState({ isOpen: false, status: null, title: '', message: '' }); // Đóng modal
  };




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

      Object.keys(fieldValidationSchema).forEach(fieldName => {
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

  // *** BƯỚC 4: CẬP NHẬT LOGIC `handleSubmit` ***
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== 3 || !agreedToTerms) return;

    // Validate lần cuối
    // (Logic validation đã có trong goToNextStep, có thể giữ hoặc lược bỏ nếu tin tưởng)

    const userData = localStorage.getItem('user');
    if (!userData) {
      setModalState({
        isOpen: true,
        status: 'error',
        title: t('Submission_Failed'),
        message: t('Please_log_in_to_add_new_Conference'),
      });
      return;
    }
    const userId = JSON.parse(userData).id;
    const token = localStorage.getItem('token');

    setIsSubmitting(true); // Bắt đầu quá trình submit

    try {
      await addConference(formData, userId, token);
      // **THAY ĐỔI LỚN Ở ĐÂY**
      // Không chuyển hướng tự động, thay vào đó mở modal thành công
      setModalState({
        isOpen: true,
        status: 'success',
        title: t('Submission_Success'),
        message: t('Conference_Submitted_Message'),
      });
    } catch (error: any) {
      console.error('Error adding conference:', error.message);
      // Mở modal thất bại
      setModalState({
        isOpen: true,
        status: 'error',
        title: t('Submission_Failed'),
        message: `${t('Error_Submitting_Conference_Message')}: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false); // Kết thúc quá trình submit
    }
  };

  // Đóng modal
  const closeModal = () => {
    // Nếu submit thành công, việc đóng modal sẽ reset form
    if (modalState.status === 'success') {
      resetForm();
    } else {
      // Nếu thất bại, chỉ cần đóng modal
      setModalState({ isOpen: false, status: null, title: '', message: '' });
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
    isStep1Complete,
    isSubmitting, // TRẢ VỀ TRẠNG THÁI SUBMITTING
    modalState,   // TRẢ VỀ STATE CỦA MODAL
    resetForm,    // TRẢ VỀ HÀM RESET
    closeModal,   // TRẢ VỀ HÀM ĐÓNG MODAL

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