// src/app/[locale]/addconference/steps/ConferenceDetailsStep.tsx
'use client';

import React from 'react';
import {
  ConferenceFormData,
  LocationInput,
  ImportantDateInput,
  City,
  State,
} from '@/src/models/send/addConference.send';
import clsx from 'clsx';

// Import các thành phần đã được tách
import VerticalProgressStepper from './VerticalProgressStepper';
import BasicInfoSection from '../sections/BasicInfoSection';
import LogisticsDetailsSection from '../sections/LogisticsDetailsSection';
import ContentBrandingSection from '../sections/ContentBrandingSection';

// Import các hooks và validators
import { useFormSectionObserver } from '@/src/hooks/addConference/useFormSectionObserver';
import { useFormCompletion } from '@/src/hooks/addConference/useFormCompletion';
import {
  isBasicInfoComplete,
  isLogisticsComplete,
  isContentComplete,
} from '@/src/utils/validation/addConferenceValidation'; // Đảm bảo import các hàm validator
import { DateError } from '@/src/utils/validation';

// --- CÁC COMPONENT UI CHUNG (Giữ nguyên) ---
export const FormSectionCard: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-md ring-1 ring-gray-200/50">
    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    <p className="mt-1 text-sm text-gray-600">{description}</p>
    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
      {children}
    </div>
  </div>
);

export const TextInput: React.FC<{
  id: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; helperText?: string; required?: boolean; type?: string; className?: string;
  icon?: React.ReactNode; t: (key: string) => string; error?: string | null;
}> = ({ id, label, value, onChange, placeholder, helperText, required, type = 'text', className = 'sm:col-span-6', icon, t, error }) => (
  <div className={className}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {required && <span className="text-red-500">* </span>}{t(label)}
    </label>
    <div className="relative mt-1 rounded-md shadow-sm">
      {icon && <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">{icon}</div>}
      <input
        type={type} id={id}
        className={clsx(
          'block w-full rounded-md py-2 focus:ring-indigo-500 sm:text-sm',
          icon ? 'pl-10' : 'pl-3', 'pr-3',
          error ? 'border-red-500 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500'
        )}
        value={value} onChange={onChange} placeholder={placeholder || ''}
        required={required} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}
      />
    </div>
    {error ? (
      <p id={`${id}-error`} className="mt-2 text-sm text-red-600">{error}</p>
    ) : helperText ? (
      <p className="mt-2 text-xs text-gray-500">{t(helperText)}</p>
    ) : null}
  </div>
);
// -----------------------------


// *** THAY ĐỔI TẠI ĐÂY: THÊM `topicError` VÀO INTERFACE ***
export interface ConferenceDetailsStepProps {
  formData: ConferenceFormData;
  errors: Record<string, string | null>;
  dateErrors: DateError[];
  globalDateError: string | null;
  topicError: string | null; // THÊM PROP MỚI
  newTopic: string;
  setNewTopic: (value: string) => void;
  onFieldChange: (field: keyof ConferenceFormData, value: any) => void;
  onLocationChange: (field: keyof LocationInput, value: any) => void;
  onDateChange: (index: number, field: keyof ImportantDateInput, value: string) => void;
  addDate: () => void;
  removeDate: (index: number) => void;
  addTopic: () => void;
  removeTopic: (topic: string) => void;
  dateTypeOptions: { value: string; name: string }[];
  t: (key: string) => string;
  cscApiKey: string;
  setStatesForReview: React.Dispatch<React.SetStateAction<State[]>>;
  setCitiesForReview: React.Dispatch<React.SetStateAction<City[]>>;
}

const formSections = [
  { id: 'basic-info-section', name: 'Basic_Information', validator: isBasicInfoComplete },
  { id: 'logistics-section', name: 'Logistics_Details', validator: isLogisticsComplete },
  { id: 'content-section', name: 'Content_and_Branding', validator: isContentComplete },
];


const ConferenceDetailsStep: React.FC<ConferenceDetailsStepProps> = (props) => {
  const { t } = props;

  const activeSection = useFormSectionObserver(formSections);
  const completedSections = useFormCompletion(formSections, props);

  const isSectionLocked = (sectionId: string, currentIndex: number) => {
    if (currentIndex === 0) return false;
    const prevSectionId = formSections[currentIndex - 1]?.id;
    return prevSectionId && !completedSections.has(prevSectionId);
  };

  const handleStepperClick = (stepId: string) => {
    const element = document.getElementById(stepId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 md:gap-x-8 lg:gap-x-12">
      {/* CỘT TRÁI: STEPPER */}
      <aside className="hidden md:block md:col-span-1">
        <div className="sticky top-24">
          <VerticalProgressStepper
            steps={formSections}
            currentStepId={activeSection}
            completedStepIds={completedSections}
            t={t}
            onStepClick={handleStepperClick}
          />
        </div>
      </aside>

      {/* CỘT PHẢI: NỘI DUNG FORM */}
      <div className="md:col-span-3 space-y-8">
        {formSections.map((section, index) => {
          const isLocked = isSectionLocked(section.id, index);
          const SectionComponent =
            section.id === 'basic-info-section'
              ? BasicInfoSection
              : section.id === 'logistics-section'
                ? LogisticsDetailsSection
                : ContentBrandingSection;

          return (
            <div key={section.id} id={section.id} className="relative">
              {/* Truyền toàn bộ props xuống các component section con */}
              <SectionComponent {...props} id={section.id} />
              {isLocked && (
                <div className={clsx(
                  "absolute inset-0 bg-white/40 backdrop-blur-sm z-10 flex items-center justify-center p-4 rounded-xl",
                  "transition-opacity duration-300",
                  { 'opacity-100 visible': isLocked, 'opacity-0 invisible': !isLocked }
                )}>
                  <p className="text-lg font-semibold text-gray-700 text-center">
                    {t('Please_complete_the_previous_section_to_continue')}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConferenceDetailsStep;