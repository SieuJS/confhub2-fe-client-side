'use client';

import React from 'react';
import { ConferenceDetailsStepProps } from '../steps/ConferenceDetailsStep';
import { FormSectionCard } from '../steps/ConferenceDetailsStep';
import TopicsInput from '../inputs/TopicsInput';
// import ImageUploader from '../steps/ImageUploader';
import CallForPaperInput from '../inputs/CallForPaperInput';
import SummaryInput from '../inputs/SummaryInput'; // --- THÊM IMPORT ---

interface ContentBrandingSectionProps extends ConferenceDetailsStepProps {
  id: string;
}

const ContentBrandingSection: React.FC<ContentBrandingSectionProps> = (props) => {
  const { id, formData, errors, touchedFields, handlers, t } = props;

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

        {/* --- BẮT ĐẦU THAY ĐỔI: Thêm Summary Input --- */}
        <SummaryInput
          value={formData.summary || ''} // Giả sử formData có trường 'summary'
          onChange={(value) => handlers.handleFieldChange('summary', value)}
          onBlur={() => handlers.handleBlur('summary')}
          isTouched={touchedFields.has('summary')}
          error={errors.summary}
          maxLength={2000} // Giới hạn ký tự ngắn hơn
          t={t}
          required={true}
        />
        {/* --- KẾT THÚC THAY ĐỔI --- */}

        {/* --- Call for Papers Input --- */}
        <CallForPaperInput
          value={formData.callForPaper}
          onChange={(value) => handlers.handleFieldChange('callForPaper', value)}
          onBlur={() => handlers.handleBlur('callForPaper')}
          isTouched={touchedFields.has('callForPaper')}
          error={errors.callForPaper}
          maxLength={10000}
          t={t}
          required={true}

        />

        {/* --- Image Uploader --- */}
        {/* <div className="sm:col-span-6">
          <ImageUploader
            imageUrl={formData.imageUrl}
            setImageUrl={(url) => handlers.handleFieldChange('imageUrl', url)}
            t={t}
          />
        </div> */}
      </FormSectionCard>
    </div>
  );
};

export default ContentBrandingSection;