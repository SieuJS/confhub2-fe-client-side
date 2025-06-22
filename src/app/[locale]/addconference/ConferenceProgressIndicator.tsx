// src/app/[locale]/addconference/components/ConferenceProgressIndicator.tsx
import React from 'react'
import { Check, FileText, CheckCircle } from 'lucide-react' // Import các icon cần thiết

interface ConferenceProgressIndicatorProps {
  currentStep: number
  t: (key: string) => string
}

const ConferenceProgressIndicator: React.FC<
  ConferenceProgressIndicatorProps
> = ({ currentStep, t }) => {
  // Hàm trợ giúp để xác định class cho trạng thái của step
  const getStepClasses = (stepNumber: number) => {
    const isCurrent = currentStep === stepNumber
    const isCompleted = currentStep >= stepNumber
    const baseClasses = 'flex w-full items-center'
    const visibilityClasses = isCurrent ? 'flex' : 'hidden lg:flex'
    const colorClasses = isCompleted ? 'text-button' : ''

    return `${baseClasses} ${visibilityClasses} ${colorClasses}`
  }

  // Hàm trợ giúp để xác định class cho vòng tròn icon
  const getIconRingClasses = (stepNumber: number) => {
    const isCompleted = currentStep >= stepNumber
    return `flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ring-2 ${
      isCompleted ? 'bg-background-secondary ring-button' : 'ring-primary'
    }`
  }

  // Component phụ trợ cho từng bước để tránh lặp code
  const StepItem: React.FC<{
    stepNumber: number
    titleKey: string
    IconComponent: React.ElementType
    hasLineBefore?: boolean
    hasLineAfter?: boolean
  }> = ({
    stepNumber,
    titleKey,
    IconComponent,
    hasLineBefore,
    hasLineAfter
  }) => (
    <div className={getStepClasses(stepNumber)}>
      {hasLineBefore && (
        <div className='mr-6 hidden h-0.5 w-full bg-gray-30 lg:block'></div>
      )}
      <span className={getIconRingClasses(stepNumber)}>
        {/* Sử dụng IconComponent đã import */}
        <IconComponent className='h-3.5 w-3.5' />
      </span>
      <div className='ml-2 w-full'>
        <h3 className='font-medium leading-tight'>{t(titleKey)}</h3>
      </div>
      {hasLineAfter && (
        <div className='ml-2 hidden h-0.5 w-full bg-gray-30 lg:block'></div>
      )}
    </div>
  )

  return (
    <div className='mb-8 sm:mb-10'>
      <div className='flex items-center justify-center sm:justify-start'>
        {/* Step 1: Add Conference Info */}
        <StepItem
          stepNumber={1}
          titleKey='Add_Conference_Info'
          IconComponent={Check} // Icon cho bước hoàn thành hoặc đang ở bước này
          hasLineAfter={true}
        />

        {/* Step 2: Review */}
        <StepItem
          stepNumber={2}
          titleKey='Review'
          IconComponent={FileText} // Icon cho bước review
          hasLineBefore={true}
          hasLineAfter={true}
        />

        {/* Step 3: Confirmation */}
        <StepItem
          stepNumber={3}
          titleKey='Confirmation'
          IconComponent={CheckCircle} // Icon cho bước xác nhận cuối cùng
          hasLineBefore={true}
          hasLineAfter={false} // Bước cuối cùng không cần đường sau
        />
      </div>
    </div>
  )
}

export default ConferenceProgressIndicator
