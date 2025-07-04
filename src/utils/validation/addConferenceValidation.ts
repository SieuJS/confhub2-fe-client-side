import { ConferenceDetailsStepProps } from '@/src/app/[locale]/addconference/steps/ConferenceDetailsStep';

// Validator cho Basic Info (Không thay đổi)
export const isBasicInfoComplete = (props: ConferenceDetailsStepProps): boolean => {
  const { formData, errors } = props;
  const { title, acronym, link } = formData;

  // Sửa lỗi chính tả tên trường đã có
  const hasData = !!(title.trim() && acronym.trim() && link.trim());
  const noErrors = !errors.title && !errors.acronym && !errors.link && !errors.cfpLink && !errors.impLink;

  return hasData && noErrors;
};

// Validator cho Logistics (Không thay đổi)
export const isLogisticsComplete = (props: ConferenceDetailsStepProps): boolean => {
  const { formData, errors, dateErrors, globalDateError } = props;
  const { type, location, dates } = formData;

  let isLocationValid = true;
  if (type === 'Offline' || type === 'Hybrid') {
    const hasLocationData = !!(
      location.address.trim() &&
      location.continent &&
      location.country
    );

    const noLocationErrors =
      !errors['location.address'] &&
      !errors['location.continent'] &&
      !errors['location.country'];

    isLocationValid = hasLocationData && noLocationErrors;
  }

  const hasTypeData = !!type;
  const noTypeError = !errors.type;
  
  const areDatesValid = dates.length > 0 &&
    !dateErrors.some(err => Object.values(err).some(msg => !!msg)) &&
    !globalDateError;

  return isLocationValid && hasTypeData && noTypeError && areDatesValid;
};

// Validator cho Content (CẬP NHẬT)
export const isContentComplete = (props: ConferenceDetailsStepProps): boolean => {
  const { formData, errors, topicError } = props;

  const topicsValid = formData.topics.length >= 1 && !topicError;
  
  // --- BẮT ĐẦU THAY ĐỔI ---
  const summaryValid =
    formData.summary.trim().length >= 50 && !errors.summary;

  const callForPaperValid = 
    formData.callForPaper.trim().length >= 100 && !errors.callForPaper;

  return topicsValid && summaryValid && callForPaperValid;
  // --- KẾT THÚC THAY ĐỔI ---
};