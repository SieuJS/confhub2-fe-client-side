// src/app/[locale]/addconference/steps/ConferenceTermsStep.tsx
import React from 'react';
import { FileText, CheckCircle, Lightbulb } from 'lucide-react'; // Import các biểu tượng

interface ConferenceTermsStepProps {
  agreedToTerms: boolean;
  setAgreedToTerms: (agreed: boolean) => void;
  t: (key: string) => string;
}

const ConferenceTermsStep: React.FC<ConferenceTermsStepProps> = ({
  agreedToTerms,
  setAgreedToTerms,
  t
}) => {
  return (
    <div className='bg-slate-50 p-3 sm:p-6 rounded-lg min-h-screen flex flex-col items-center justify-start'>
      {/* Header Section */}
      <header className='w-full max-w-2xl mb-8 pb-4 text-center border-b border-indigo-200'>
        <h2 className='text-3xl sm:text-4xl font-extrabold text-indigo-700 flex items-center justify-center gap-3 mb-2'>
          <CheckCircle className='w-9 h-9 text-indigo-500 flex-shrink-0' />
          {t('Review_and_Confirm')}
        </h2>
        <p className='text-md text-slate-600 mt-2 max-w-prose mx-auto'>
          {t('Please_read_and_agree_to_our_terms_and_conditions_before_submitting_your_conference_details')}
        </p>
      </header>

      {/* Main Content Area */}
      <div className='w-full max-w-2xl bg-white shadow-xl rounded-xl p-6 sm:p-8 border border-slate-200'>
        {/* Terms and Conditions Title */}
        <div className='flex items-center text-xl sm:text-2xl font-bold text-slate-800 mb-5 pb-3 border-b border-slate-100'>
          <FileText className='w-6 h-6 mr-3 text-slate-500' />
          {t('Terms_and_Conditions')}
        </div>

        {/* Terms and Conditions Content Box */}
        <div className='mb-6 p-5 sm:p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg shadow-inner border border-slate-200 max-h-80 overflow-y-auto text-slate-700 leading-relaxed text-sm sm:text-base custom-scrollbar'>
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
            <br/><br/>
            {t('Terms_and_Conditions_Description_Part2')}
            <br/><br/>
            {t('Terms_and_Conditions_Description_Part3')}
          </p>
          <ul className='list-disc list-inside text-sm sm:text-base space-y-2 mb-4'>
            <li><strong>{t('Accuracy_of_Information')}:</strong> {t('Accuracy_of_Information_Desc')}</li>
            <li><strong>{t('Content_Guidelines')}:</strong> {t('Content_Guidelines_Desc')}</li>
            <li><strong>{t('Intellectual_Property')}:</strong> {t('Intellectual_Property_Desc')}</li>
            <li><strong>{t('Privacy_Policy')}:</strong> {t('Privacy_Policy_Desc')}</li>
            <li><strong>{t('Disclaimer')}:</strong> {t('Disclaimer_Desc')}</li>
            <li><strong>{t('Governing_Law')}:</strong> {t('Governing_Law_Desc')}</li>
          </ul>
          <p className='text-xs text-slate-500 mt-6 italic'>
            {t('By_checking_this_box_you_acknowledge_that_you_have_read_understood_and_agree_to_be_bound_by_these_terms_and_conditions')}.
          </p>
        </div>

        {/* Checkbox for Agreement */}
        <div className='flex items-start mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-200'>
          <input
            id='agree-terms'
            type='checkbox'
            checked={agreedToTerms}
            onChange={e => setAgreedToTerms(e.target.checked)}
            className='h-5 w-5 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500 cursor-pointer flex-shrink-0 mt-0.5'
          />
          <label htmlFor='agree-terms' className='ml-3 text-base text-slate-800 font-medium cursor-pointer select-none'>
            {t('I_agree_to_the_terms_and_conditions')}
            <p className='text-sm text-slate-500 font-normal mt-0.5'>
              {t('You_must_agree_to_the_terms_to_proceed')}
            </p>
          </label>
        </div>

        {/* Important Note (Optional, but good for UX) */}
        <div className='mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start text-yellow-800'>
          <Lightbulb className='w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5 mr-3' />
          <div>
            <strong className='block text-sm'>{t('Important_Note')}:</strong>
            <p className='text-sm mt-1'>{t('Your_conference_information_will_be_reviewed_before_publication')}.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConferenceTermsStep;