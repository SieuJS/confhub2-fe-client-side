// src/app/[locale]/addconference/sections/ContentBrandingSection.tsx
'use client';

import React from 'react';
import { ConferenceDetailsStepProps } from '../steps/ConferenceDetailsStep';
import { FormSectionCard } from '../steps/ConferenceDetailsStep';
import TopicsInput from '../inputs/TopicsInput';
import ImageUploader from '../steps/ImageUploader';
import CallForPapersInput from '../inputs/CallForPapersInput';

interface ContentBrandingSectionProps extends ConferenceDetailsStepProps {
  id: string;
}

const ContentBrandingSection: React.FC<ContentBrandingSectionProps> = (props) => {
  // Destructure các props cần thiết, bao gồm cả handlers và touchedFields
  const { id, formData, errors, touchedFields, handlers, t } = props;

  return (
    <div id={id}>
      <FormSectionCard
        title={t('Content_and_Branding')}
        description={t('Describe_your_conference_and_add_visuals_to_attract_attendees')}
      >
        {/* --- Topics Input --- */}
        {/* Truyền toàn bộ props xuống vì TopicsInput cần nhiều thứ:
            - formData.topics
            - newTopic, setNewTopic
            - topicError
            - handlers (handleAddTopic, handleRemoveTopic, handleBlur)
        */}
        <div className="sm:col-span-6">
          <TopicsInput {...props} />
        </div>

        {/* --- Call for Papers Input --- */}
        {/* Component này hoạt động tương tự TextInput */}
        <CallForPapersInput
            value={formData.description}
            onChange={(value) => handlers.handleFieldChange('description', value)}
            onBlur={() => handlers.handleBlur('description')} // Thêm onBlur
            isTouched={touchedFields.has('description')}   // Thêm isTouched
            error={errors.description}
            maxLength={10000}
            t={t}
        />

        {/* --- Image Uploader --- */}
        {/* ImageUploader không có validation bắt buộc hoặc onBlur theo cách thông thường,
            chỉ cần cập nhật handler thay đổi giá trị. */}
        <div className="sm:col-span-6">
          <ImageUploader
            imageUrl={formData.imageUrl}
            setImageUrl={(url) => handlers.handleFieldChange('imageUrl', url)}
            t={t}
          />
        </div>
      </FormSectionCard>
    </div>
  );
};

export default ContentBrandingSection;