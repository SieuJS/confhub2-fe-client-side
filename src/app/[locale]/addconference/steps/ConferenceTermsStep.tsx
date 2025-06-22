// src/app/[locale]/addconference/steps/ConferenceTermsStep.tsx
import React from 'react'
import { FileText, CheckCircle, Lightbulb } from 'lucide-react' // Import các biểu tượng

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
    <div className='flex min-h-screen flex-col items-center justify-start rounded-lg bg-gray-5 p-3 sm:p-6'>
      {/* Header Section */}
      <header className='mb-8 w-full max-w-2xl border-b border-indigo-200 pb-4 text-center'>
        <h2 className='mb-2 flex items-center justify-center gap-3 text-3xl font-extrabold text-indigo-700 sm:text-4xl'>
          <CheckCircle className='h-9 w-9 flex-shrink-0 text-indigo-500' />
          {t('Review_and_Confirm')}
        </h2>
        <p className='text-md mx-auto mt-2 max-w-prose '>
          {t(
            'Please_read_and_agree_to_our_terms_and_conditions_before_submitting_your_conference_details'
          )}
        </p>
      </header>

      {/* Main Content Area */}
      <div className='w-full max-w-2xl rounded-xl border border-slate-200 bg-white-pure p-6 shadow-xl sm:p-8'>
        {/* Terms and Conditions Title */}
        <div className='mb-5 flex items-center border-b border-slate-100 pb-3 text-xl font-bold  sm:text-2xl'>
          <FileText className='mr-3 h-6 w-6 ' />
          {t('Terms_and_Conditions')}
        </div>

        {/* Terms and Conditions Content Box */}
        <div className='custom-scrollbar mb-6 max-h-80 overflow-y-auto rounded-lg border border-slate-200 bg-gradient-to-br from-gray-5 to-gray-10 p-5 text-sm leading-relaxed  shadow-inner sm:p-6 sm:text-base'>
          {/* Custom Scrollbar CSS (add this to your global CSS or a style tag) */}
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #cbd5e1; /* slate-300 */
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #94a3b8; /* slate-400 */
            }
          `}</style>
          {/* Placeholder for actual terms and conditions */}
          <p className='mb-4'>
            {t('Terms_and_Conditions_Description_Part1')}
            <br />
            <br />
            {t('Terms_and_Conditions_Description_Part2')}
            <br />
            <br />
            {t('Terms_and_Conditions_Description_Part3')}
          </p>
          <ul className='mb-4 list-inside list-disc space-y-2 text-sm sm:text-base'>
            <li>
              <strong>{t('Accuracy_of_Information')}:</strong>{' '}
              {t('Accuracy_of_Information_Desc')}
            </li>
            <li>
              <strong>{t('Content_Guidelines')}:</strong>{' '}
              {t('Content_Guidelines_Desc')}
            </li>
            <li>
              <strong>{t('Intellectual_Property')}:</strong>{' '}
              {t('Intellectual_Property_Desc')}
            </li>
            <li>
              <strong>{t('Privacy_Policy')}:</strong> {t('Privacy_Policy_Desc')}
            </li>
            <li>
              <strong>{t('Disclaimer')}:</strong> {t('Disclaimer_Desc')}
            </li>
            <li>
              <strong>{t('Governing_Law')}:</strong> {t('Governing_Law_Desc')}
            </li>
          </ul>
          <p className='mt-6 text-xs italic '>
            {t(
              'By_checking_this_box_you_acknowledge_that_you_have_read_understood_and_agree_to_be_bound_by_these_terms_and_conditions'
            )}
            .
          </p>
        </div>

        {/* Checkbox for Agreement */}
        <div className='mt-8 flex items-start rounded-lg border border-indigo-200 bg-gray-5 p-4'>
          <input
            id='agree-terms'
            type='checkbox'
            checked={agreedToTerms}
            onChange={e => setAgreedToTerms(e.target.checked)}
            className='mt-0.5 h-5 w-5 flex-shrink-0 cursor-pointer rounded border-slate-300 bg-white-pure text-indigo-600 focus:ring-indigo-500'
          />
          <label
            htmlFor='agree-terms'
            className='ml-3 cursor-pointer select-none text-base font-medium '
          >
            {t('I_agree_to_the_terms_and_conditions')}
            <p className='mt-0.5 text-sm font-normal '>
              {t('You_must_agree_to_the_terms_to_proceed')}
            </p>
          </label>
        </div>

        {/* Important Note (Optional, but good for UX) */}
        <div className='mt-6 flex items-start rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800'>
          <Lightbulb className='mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600' />
          <div>
            <strong className='block text-sm'>{t('Important_Note')}:</strong>
            <p className='mt-1 text-sm'>
              {t(
                'Your_conference_information_will_be_reviewed_before_publication'
              )}
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConferenceTermsStep
