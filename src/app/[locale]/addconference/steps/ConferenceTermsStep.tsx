// src/app/[locale]/addconference/components/steps/ConferenceTermsStep.tsx
import React from 'react'

interface ConferenceTermsStepProps {
  agreedToTerms: boolean
  setAgreedToTerms: (agreed: boolean) => void
  t: (key: string) => string
}

const ConferenceTermsStep: React.FC<ConferenceTermsStepProps> = ({
  agreedToTerms,
  setAgreedToTerms,
  t
}) => {
  return (
    <div className='sm:col-span-2'>
      <h2 className='mb-4 text-lg font-semibold sm:text-xl'>
        {t('Terms_and_Conditions')}
      </h2>
      <div className='mb-4 max-h-60 overflow-y-auto rounded border p-4'>
        <p>{t('Terms_and_Conditions_Description')}</p>
      </div>
      <label className='flex items-center'>
        <input
          type='checkbox'
          checked={agreedToTerms}
          onChange={e => setAgreedToTerms(e.target.checked)}
          className='mr-2 h-4 w-4 rounded border-gray-300 text-button focus:ring-button'
        />
        <span className='text-sm'>
          {t('I_agree_to_the_terms_and_conditions')}
        </span>
      </label>
    </div>
  )
}

export default ConferenceTermsStep
