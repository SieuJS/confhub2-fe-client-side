// src/app/[locale]/addconference/sections/ContentBrandingSection.tsx
'use client';

import React from 'react';
import { ConferenceDetailsStepProps } from '../steps/ConferenceDetailsStep';
import { FormSectionCard } from '../steps/ConferenceDetailsStep';
import TopicsInput from '../inputs/TopicsInput';
import ImageUploader from '../steps/ImageUploader';
import CallForPapersInput from '../inputs/CallForPapersInput'; // Import component mới

interface ContentBrandingSectionProps extends ConferenceDetailsStepProps {
  id: string;
}

const ContentBrandingSection: React.FC<ContentBrandingSectionProps> = (props) => {
  const { id, formData, errors, onFieldChange, t } = props;

  return (
    <div id={id}>
      <FormSectionCard
        title={t('Content_and_Branding')}
        description={t('Describe_your_conference_and_add_visuals_to_attract_attendees')}
      >
        {/* --- Topics Input --- */}
        <div className="sm:col-span-6">
          <TopicsInput {...props} />
        </div>

        {/* --- Call for Papers Input (thay thế textarea cũ) --- */}
        <CallForPapersInput
            value={formData.description}
            onChange={(value) => onFieldChange('description', value)}
            maxLength={10000}
            t={t}
            error={errors.description}
        />

        {/* --- Image Uploader --- */}
        <div className="sm:col-span-6">
          <ImageUploader
            imageUrl={formData.imageUrl}
            setImageUrl={(url) => onFieldChange('imageUrl', url)}
            t={t}
          />
        </div>
      </FormSectionCard>
    </div>
  );
};

export default ContentBrandingSection;