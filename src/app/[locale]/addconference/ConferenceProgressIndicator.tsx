// src/app/[locale]/addconference/components/ConferenceProgressIndicator.tsx
import React from 'react'

interface ConferenceProgressIndicatorProps {
  currentStep: number
  t: (key: string) => string
}

const ConferenceProgressIndicator: React.FC<
  ConferenceProgressIndicatorProps
> = ({ currentStep, t }) => {
  return (
    <div className='mb-8 sm:mb-10'>
      <div className='flex items-center justify-center sm:justify-start'>
        {/* Step 1 */}
        <div
          className={`flex w-full items-center ${currentStep === 1 ? 'flex' : 'hidden lg:flex'} ${currentStep >= 1 ? 'text-button' : ''}`}
        >
          <span
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ring-2 ${currentStep >= 1 ? 'bg-background-secondary ring-button' : 'ring-primary'}`}
          >
            <svg
              className='h-3.5 w-3.5'
              aria-hidden='true'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 16 12'
            >
              <path
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M1 5.917 5.724 10.5 15 1.5'
              />
            </svg>
          </span>
          <div className='ml-2 w-full'>
            <h3 className='font-medium leading-tight'>
              {t('Add_Conference_Info')}
            </h3>
          </div>
          <div className='ml-2 hidden h-0.5 w-full bg-gray-300 lg:block'></div>
        </div>

        {/* Step 2 */}
        <div
          className={`flex w-full items-center ${currentStep === 2 ? 'flex' : 'hidden lg:flex'} ${currentStep >= 2 ? 'text-button' : ''}`}
        >
          <div className='mr-6 hidden h-0.5 w-full bg-gray-300 lg:block'></div>
          <span
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ring-2 ${currentStep >= 2 ? 'bg-background-secondary ring-button' : 'ring-primary'}`}
          >
            <svg
              className='h-3.5 w-3.5'
              aria-hidden='true'
              xmlns='http://www.w3.org/2000/svg'
              fill='currentColor'
              viewBox='0 0 18 20'
            >
              <path d='M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z' />
            </svg>
          </span>
          <div className='ml-2 w-full'>
            <h3 className='font-medium leading-tight'>{t('Review')}</h3>
          </div>
          <div className=' hidden h-0.5 w-full bg-gray-300 lg:block'></div>
        </div>

        {/* Step 3 */}
        <div
          className={`flex w-full items-center ${currentStep === 3 ? 'flex' : 'hidden lg:flex'} ${currentStep >= 3 ? 'text-button' : ''}`}
        >
          <div className='mr-6 hidden h-0.5 w-full bg-gray-300 lg:block'></div>
          <span
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ring-2 ${currentStep >= 3 ? 'bg-background-secondary ring-button' : 'ring-primary'}`}
          >
            <svg
              className='h-3.5 w-3.5'
              aria-hidden='true'
              xmlns='http://www.w3.org/2000/svg'
              fill='currentColor'
              viewBox='0 0 18 20'
            >
              <path d='M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2ZM7 2h4v3H7V2Zm5.7 8.289-3.975 3.857a1 1 0 0 1-1.393 0L5.3 12.182a1.002 1.002 0 1 1 1.4-1.436l1.328 1.289 3.28-3.181a1 1 0 1 1 1.392 1.435Z' />
            </svg>
          </span>
          <div className='ml-2 w-full'>
            <h3 className='font-medium leading-tight'>{t('Confirmation')}</h3>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConferenceProgressIndicator
