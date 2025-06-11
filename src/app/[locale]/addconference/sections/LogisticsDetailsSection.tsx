// src/app/[locale]/addconference/sections/LogisticsDetailsSection.tsx
'use client';

import React from 'react';
import clsx from 'clsx';
import { ConferenceDetailsStepProps } from '../steps/ConferenceDetailsStep';
import { FormSectionCard } from '../steps/ConferenceDetailsStep';
import LocationSelector from '../inputs/LocationSelector';
import ImportantDatesInput from '../inputs/ImportantDatesInput';

interface LogisticsDetailsSectionProps extends ConferenceDetailsStepProps {
  id: string;
}

const LogisticsDetailsSection: React.FC<LogisticsDetailsSectionProps> = (props) => {
  // Destructure các props cần thiết, bao gồm handlers và touchedFields
  const { id, formData, errors, touchedFields, handlers, t } = props;

  const typeOptions = [
    { id: 'Online', label: t('Online') },
    { id: 'Offline', label: t('Offline') },
    { id: 'Hybrid', label: t('Hybrid') },
  ];

  // Xác định xem Location có bắt buộc hay không dựa trên type
  const isLocationRequired = formData.type === 'Offline' || formData.type === 'Hybrid';
  
  // Xác định khi nào hiển thị lỗi cho trường 'type'
  const showTypeError = touchedFields.has('type') && !!errors.type;

  return (
    <div id={id}>
      <FormSectionCard
        title={t('Logistics_Details')}
        description={t('Define_when_and_where_the_conference_will_take_place')}
      >
        {/* --- Conference Type Selection --- */}
        <div className="sm:col-span-6">
          <label className="block text-sm font-medium text-gray-700">
            <span className="text-red-500">* </span>
            {t('Type')}
          </label>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {typeOptions.map(option => (
              <button
                key={option.id}
                type="button"
                // Khi click, vừa thay đổi giá trị, vừa "touch" trường này
                onClick={() => {
                  handlers.handleFieldChange('type', option.id as 'Online' | 'Offline' | 'Hybrid');
                  handlers.handleBlur('type'); // Coi như click là đã "touch" và "blur"
                }}
                className={clsx(
                  'rounded-md px-3 py-2 text-sm font-medium text-center transition-all duration-150',
                  formData.type === option.id
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-offset-2 ring-indigo-500'
                    : 'bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-10',
                  // Thêm viền đỏ nếu có lỗi và đã được touch
                  showTypeError && 'ring-red-500' 
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          {/* Hiển thị lỗi cho trường 'type' khi có lỗi và đã được touch */}
          {showTypeError && (
            <p className="mt-2 text-sm text-red-600">{errors.type}</p>
          )}
        </div>

        {/* --- Location Selector --- */}
        <div className="sm:col-span-6">
          {/* Truyền tất cả props xuống LocationSelector.
              Component này bên trong sẽ phải tự xử lý việc gọi handlers.handleBlur
              cho các trường con của nó (continent, country, etc.) */}
          <LocationSelector
            {...props}
            isRequired={isLocationRequired}
          />
        </div>

        {/* --- Important Dates Input --- */}
        <div className="sm:col-span-6">
          {/* Truyền tất cả props xuống ImportantDatesInput.
              Component này bên trong sẽ phải tự xử lý việc gọi handlers.handleBlur
              cho các trường ngày tháng con của nó. */}
          <ImportantDatesInput {...props} />
        </div>
      </FormSectionCard>
    </div>
  );
};

export default LogisticsDetailsSection;