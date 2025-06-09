// src/hooks/addConference/useFormCompletion.ts
'use client';

import { useState, useEffect } from 'react';
import { ConferenceDetailsStepProps } from '@/src/app/[locale]/addconference/steps/ConferenceDetailsStep';

interface Section {
  id: string;
  name: string;
  // Validator giờ đây sẽ nhận toàn bộ props
  validator: (props: ConferenceDetailsStepProps) => boolean;
}

export const useFormCompletion = (sections: Section[], props: ConferenceDetailsStepProps) => {
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  // useEffect sẽ phụ thuộc vào formData và errors
  useEffect(() => {
    const newCompleted = new Set<string>();
    sections.forEach(section => {
      // Gọi validator với toàn bộ props
      if (section.validator(props)) {
        newCompleted.add(section.id);
      }
    });
    setCompletedSections(newCompleted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.formData, props.errors, props.dateErrors, sections]); // Phụ thuộc vào các đối tượng chính

  return completedSections;
};