// src/utils/addConferenceValidation.ts

import { ConferenceDetailsStepProps } from '@/src/app/[locale]/addconference/steps/ConferenceDetailsStep';

// Validator cho Basic Info (Không thay đổi)
export const isBasicInfoComplete = (props: ConferenceDetailsStepProps): boolean => {
  const { formData, errors } = props;
  const { title, acronym, link } = formData;

  const hasData = !!(title.trim() && acronym.trim() && link.trim());
  const noErrors = !errors.title && !errors.acronym && !errors.link;

  return hasData && noErrors;
};

// Validator cho Logistics (CẬP NHẬT TẠI ĐÂY)
export const isLogisticsComplete = (props: ConferenceDetailsStepProps): boolean => {
  const { formData, errors, dateErrors, globalDateError } = props; // Thêm globalDateError
  const { type, location, dates } = formData;

  let isLocationValid = true;
  if (type === 'Offline' || type === 'Hybrid') {
    const hasLocationData = !!(
      location.address.trim() &&
      location.continent &&
      location.country
      // location.cityStateProvince
    );

    const noLocationErrors =
      !errors['location.address'] &&
      !errors['location.continent'] &&
      !errors['location.country']
      // !errors['location.cityStateProvince']
      ;

    isLocationValid = hasLocationData && noLocationErrors;
  }

  const hasTypeData = !!type;
  const noTypeError = !errors.type;

  // Logic kiểm tra ngày tháng giờ đây phải bao gồm cả globalDateError
  const areDatesValid = dates.length > 0 &&
    !dateErrors.some(err => Object.values(err).some(msg => !!msg)) &&
    !globalDateError; // Kiểm tra lỗi toàn cục

  return isLocationValid && hasTypeData && noTypeError && areDatesValid;
};

// Validator cho Content (CẬP NHẬT)
export const isContentComplete = (props: ConferenceDetailsStepProps): boolean => {
  const { formData, errors, topicError } = props;

  // Topics phải hợp lệ (tối thiểu 1 và không có lỗi)
  const topicsValid = formData.topics.length >= 1 && !topicError;
  
  // Description phải hợp lệ (đủ 100 ký tự VÀ không có lỗi validation nào)
  const descriptionValid = 
    formData.description.trim().length >= 100 && !errors.description;

  return topicsValid && descriptionValid;
};