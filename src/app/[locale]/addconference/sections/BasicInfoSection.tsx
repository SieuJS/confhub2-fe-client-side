// src/app/[locale]/addconference/sections/BasicInfoSection.tsx
'use client';

import React from 'react';
import { ConferenceDetailsStepProps } from '../steps/ConferenceDetailsStep';
import { LinkIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { FormSectionCard, TextInput } from '../steps/ConferenceDetailsStep';

// Interface props giờ đây chỉ kế thừa từ ConferenceDetailsStepProps
interface BasicInfoSectionProps extends ConferenceDetailsStepProps {
    id: string;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
    id,
    formData,
    errors,
    onFieldChange,
    t,
}) => {
    return (
        <div id={id}>
            <FormSectionCard
                title={t('Basic_Information')}
                description={t('Provide_the_core_details_of_your_conference')}
            >
                <TextInput
                    id="title"
                    label="Conference_Name"
                    value={formData.title}
                    onChange={e => onFieldChange('title', e.target.value)}
                    placeholder="e.g., International Conference on Machine Learning"
                    required
                    className="sm:col-span-6"
                    icon={<AcademicCapIcon className="h-5 w-5 text-gray-400" />}
                    t={t}
                    error={errors.title} // Truyền lỗi tương ứng
                />
                <TextInput
                    id="acronym"
                    label="Acronym"
                    value={formData.acronym}
                    onChange={e => onFieldChange('acronym', e.target.value)}
                    placeholder="e.g., ICML 2024"
                    helperText="The_conference_title_and_acronym_pair_must_be_unique"
                    required
                    className="sm:col-span-3"
                    t={t}
                    error={errors.acronym} // Truyền lỗi tương ứng
                />
                <TextInput
                    id="link"
                    label="Official_Website"
                    value={formData.link}
                    onChange={e => onFieldChange('link', e.target.value)}
                    placeholder="https://example.com"
                    required
                    type="url"
                    className="sm:col-span-3"
                    icon={<LinkIcon className="h-5 w-5 text-gray-400" />}
                    t={t}
                    error={errors.link} // Truyền lỗi tương ứng
                />
            </FormSectionCard>
        </div>
    );
};

export default BasicInfoSection;