'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

// Import hooks, constants and components
import { useConferenceForm } from '@/src/hooks/addConference/useConferenceForm';
import { getDateTypeOptions, CSC_API_KEY } from '@/src/hooks/addConference/constants';
import { useRouter, usePathname } from 'next/navigation'; // Import thêm
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'; // Import icons

import ConferenceProgressIndicator from './ConferenceProgressIndicator';
import ConferenceDetailsStep from './steps/ConferenceDetailsStep';
import ConferenceReviewStep from './steps/ConferenceReviewStep';
import ConferenceTermsStep from './steps/ConferenceTermsStep';
import clsx from 'clsx';
import Modal from '../chatbot/Modal';

const ConferenceForm: React.FC = () => {
  const t = useTranslations('');

  const router = useRouter(); // Khởi tạo router
  const pathname = usePathname(); // Lấy pathname


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
    isStep1Complete,
    isSubmitting,   // Lấy state isSubmitting
    modalState,     // Lấy state của modal
    resetForm,      // Lấy hàm resetForm
    closeModal,     // Lấy hàm closeModal
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
              className="relative w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto flex items-center justify-center"
              disabled={!agreedToTerms || isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? t('Submitting') : t('Add_Conference_Submit')}
            </button>
          )}
        </div>
      </form>

      {/* *** BƯỚC 5: RENDER MODAL *** */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        size="md"
        footer={
          <>
            {modalState.status === 'success' ? (
              <>
                <button
                  onClick={resetForm}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {t('Add_Another_Conference')}
                </button>
                <button
                  onClick={() => {
                    const localePrefix = pathname.split('/')[1];
                    router.push(`/${localePrefix}/dashboard?tab=myconferences`);
                  }}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  {t('Go_To_My_Conferences')}
                </button>
              </>
            ) : (
              <button
                onClick={closeModal}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                {t('Close')}
              </button>
            )}
          </>
        }
      >
        <div className="flex flex-col items-center text-center">
          {modalState.status === 'success' && (
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          )}
          {modalState.status === 'error' && (
            <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
          )}
          <p className="text-gray-600">{modalState.message}</p>
        </div>
      </Modal>
    </div>
  );
};

export default ConferenceForm;