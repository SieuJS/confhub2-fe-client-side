// src/app/[locale]/addconference/ConferenceForm.tsx

'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

// Import hooks, constants and components
import { useConferenceForm } from '@/src/hooks/addConference/useConferenceForm'
import {
  getDateTypeOptions,
  CSC_API_KEY
} from '@/src/hooks/addConference/constants'
import { useRouter, usePathname } from 'next/navigation'
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'

import ConferenceProgressIndicator from './ConferenceProgressIndicator'
import ConferenceDetailsStep from './steps/ConferenceDetailsStep'
import ConferenceReviewStep from './steps/ConferenceReviewStep'
import ConferenceTermsStep from './steps/ConferenceTermsStep'
import clsx from 'clsx'
import Modal from '../chatbot/Modal'

const ConferenceForm: React.FC = () => {
  const t = useTranslations('')
  const router = useRouter()
  const pathname = usePathname()

  const {
    currentStep,
    formData,
    newTopic,
    agreedToTerms,
    errors,
    dateErrors,
    globalDateError,
    topicError,
    isStep1Complete,
    isSubmitting,
    modalState,
    resetForm,
    closeModal,
    statesForReview,
    citiesForReview,
    touchedFields,
    existenceCheck, // *** THAY ĐỔI 1: LẤY STATE MỚI TỪ HOOK ***
    setNewTopic,
    setAgreedToTerms,
    setStatesForReview,
    setCitiesForReview,
    handlers
  } = useConferenceForm({ t })

  return (
    <div className='max-w-10xl mx-auto py-8'>
      <ConferenceProgressIndicator currentStep={currentStep} t={t} />

      <form onSubmit={handlers.handleSubmit} className='mt-8' noValidate>
        {currentStep === 1 && (
          <ConferenceDetailsStep
            // Các props dữ liệu và lỗi giữ nguyên
            formData={formData}
            errors={errors}
            dateErrors={dateErrors}
            globalDateError={globalDateError}
            topicError={topicError}
            newTopic={newTopic}
            touchedFields={touchedFields}
            setNewTopic={setNewTopic}
            // Truyền toàn bộ object handlers
            handlers={handlers}
            // *** THAY ĐỔI 2: TRUYỀN STATE MỚI XUỐNG COMPONENT CON ***
            existenceCheck={existenceCheck}
            // Các props còn lại giữ nguyên
            dateTypeOptions={getDateTypeOptions(t)}
            t={t}
            cscApiKey={CSC_API_KEY || ''}
            setStatesForReview={setStatesForReview}
            setCitiesForReview={setCitiesForReview}
          />
        )}

        {/* --- Các Step 2 và 3 không thay đổi --- */}
        {currentStep === 2 && (
          <ConferenceReviewStep
            title={formData.title}
            acronym={formData.acronym}
            link={formData.link}
            cfpLink={formData.cfpLink}
            impLink={formData.impLink}
            type={formData.type}
            location={formData.location}
            dates={formData.dates}
            topics={formData.topics}
            // imageUrl={formData.imageUrl}
            summary={formData.summary}
            callForPaper={formData.callForPaper}
            t={t}
            statesForReview={statesForReview}
            citiesForReview={citiesForReview}
          />
        )}

        {currentStep === 3 && (
          <ConferenceTermsStep
            agreedToTerms={agreedToTerms}
            setAgreedToTerms={setAgreedToTerms}
            t={t}
          />
        )}

        {/* --- Các nút điều hướng không thay đổi --- */}
        <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end'>
          {currentStep > 1 && (
            <button
              type='button'
              onClick={handlers.goToPreviousStep}
              className='w-full rounded-md border border-gray-300 bg-white-pure px-4 py-2 text-sm font-semibold  shadow-sm hover:bg-gray-10 focus:outline-none sm:w-auto'
            >
              {t('Back')}
            </button>
          )}

          {currentStep < 3 && (
            <button
              type='button'
              onClick={handlers.goToNextStep}
              disabled={!isStep1Complete}
              className={clsx(
                'w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:w-auto',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              {t('Next')}
            </button>
          )}

          {currentStep === 3 && (
            <button
              type='submit'
              className='relative flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto'
              disabled={!agreedToTerms || isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              {isSubmitting ? t('Submitting') : t('Add_Conference_Submit')}
            </button>
          )}
        </div>
      </form>

       {/* Modal cho thông báo thành công/lỗi */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        size='md' // Giữ size md hoặc thay đổi nếu muốn nhỏ hơn
        // THAY ĐỔI QUAN TRỌNG Ở ĐÂY: Bọc các nút trong div với flexbox
        footer={
          <div className='flex justify-end space-x-2'> {/* justify-end và space-x-2 */}
            {modalState.status === 'success' ? (
              <>
                <button
                  onClick={resetForm}
                  className='rounded-md border border-gray-300 bg-white-pure px-3 py-1.5 text-sm font-medium  hover:bg-gray-20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600' // Điều chỉnh padding/font-size và thêm dark mode
                >
                  {t('Add_Another_Conference')}
                </button>
                <button
                  onClick={() => {
                    const localePrefix = pathname.split('/')[1]
                    router.push(`/${localePrefix}/dashboard?tab=myconferences`)
                  }}
                  className='rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' // Điều chỉnh padding/font-size
                >
                  {t('Go_To_My_Conferences')}
                </button>
              </>
            ) : (
              <button
                onClick={closeModal}
                className='rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' // Điều chỉnh padding/font-size
              >
                {t('Close')}
              </button>
            )}
          </div>
        }
      >
        <div className='flex flex-col items-center text-center'>
          {modalState.status === 'success' && (
            <CheckCircle className='mb-4 h-16 w-16 text-green-500' />
          )}
          {modalState.status === 'error' && (
            <AlertTriangle className='mb-4 h-16 w-16 text-red-500' />
          )}
          <p className='text-gray-700 dark:text-gray-300'>{modalState.message}</p> {/* Thêm màu chữ */}
        </div>
      </Modal>
    </div>
  )
}

export default ConferenceForm