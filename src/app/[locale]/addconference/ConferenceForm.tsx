'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

// Import hooks, constants and components
import { useConferenceForm } from '@/src/hooks/addConference/useConferenceForm';
import { getDateTypeOptions, CSC_API_KEY } from '@/src/hooks/addConference/constants';
import ConferenceProgressIndicator from './ConferenceProgressIndicator';
import ConferenceDetailsStep from './steps/ConferenceDetailsStep';
import ConferenceReviewStep from './steps/ConferenceReviewStep';
import ConferenceTermsStep from './steps/ConferenceTermsStep';
import clsx from 'clsx';

const ConferenceForm: React.FC = () => {
  const t = useTranslations('');

  // Lấy toàn bộ state và logic từ custom hook.
  // Component này không cần biết chi tiết về cách state được quản lý.
  const {
    currentStep,
    formData,
    newTopic,
    agreedToTerms,
    errors,
    dateErrors,
    globalDateError,
    topicError, // Lấy topicError để truyền xuống
    isStep1Complete, // LẤY BIẾN MỚI TỪ HOOK
    statesForReview,
    citiesForReview,
    setNewTopic,
    setAgreedToTerms,
    setStatesForReview,
    setCitiesForReview,
    handlers,
  } = useConferenceForm({ t });

  // Component giờ đây rất gọn gàng, chỉ tập trung vào việc render.
  return (
    <div className="mx-auto max-w-10xl py-8">
      <ConferenceProgressIndicator currentStep={currentStep} t={t} />

      {/* Thẻ form sẽ gọi handler.handleSubmit khi được submit */}
      <form onSubmit={handlers.handleSubmit} className="mt-8" noValidate>
        {/* `noValidate` ngăn trình duyệt thực hiện validation mặc định */}

        {/* --- STEP 1: CHI TIẾT HỘI NGHỊ --- */}
        {currentStep === 1 && (
          <ConferenceDetailsStep
            // Truyền toàn bộ dữ liệu, lỗi và handlers cần thiết
            formData={formData}
            errors={errors}
            dateErrors={dateErrors}
            globalDateError={globalDateError} // Truyền xuống component con
            topicError={topicError} // Truyền topicError xuống
            newTopic={newTopic}
            setNewTopic={setNewTopic}
            onFieldChange={handlers.handleFieldChange}
            onLocationChange={handlers.handleLocationChange}
            onDateChange={handlers.handleDateChange}
            addDate={handlers.addDate}
            removeDate={handlers.removeDate}
            addTopic={handlers.handleAddTopic}
            removeTopic={handlers.handleRemoveTopic}
            dateTypeOptions={getDateTypeOptions(t)}
            t={t}
            cscApiKey={CSC_API_KEY || ''}
            setStatesForReview={setStatesForReview}
            setCitiesForReview={setCitiesForReview}
          />
        )}

        {/* --- STEP 2: XEM LẠI THÔNG TIN --- */}
        {currentStep === 2 && (
          <ConferenceReviewStep
            // Truyền dữ liệu từ formData để hiển thị
            title={formData.title}
            acronym={formData.acronym}
            link={formData.link}
            type={formData.type}
            location={formData.location}
            dates={formData.dates}
            topics={formData.topics}
            imageUrl={formData.imageUrl}
            description={formData.description}
            t={t}
            statesForReview={statesForReview}
            citiesForReview={citiesForReview}
          />
        )}

        {/* --- STEP 3: ĐIỀU KHOẢN --- */}
        {currentStep === 3 && (
          <ConferenceTermsStep
            agreedToTerms={agreedToTerms}
            setAgreedToTerms={setAgreedToTerms}
            t={t}
          />
        )}

         {/* --- CÁC NÚT ĐIỀU HƯỚNG (CẬP NHẬT NÚT NEXT) --- */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlers.goToPreviousStep}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-10 focus:outline-none sm:w-auto"
            >
              {t('Back')}
            </button>
          )}

          {currentStep < 3 && (
            <button
              type="button"
              onClick={handlers.goToNextStep}
              disabled={!isStep1Complete} // VÔ HIỆU HÓA NÚT KHI STEP 1 CHƯA HOÀN THÀNH
              className={clsx(
                'w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:w-auto',
                // Thêm class cho trạng thái disabled
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              {t('Next')}
            </button>
          )}

          {currentStep === 3 && (
            <button
              type="submit"
              className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              disabled={!agreedToTerms}
            >
              {t('Add_Conference_Submit')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ConferenceForm;