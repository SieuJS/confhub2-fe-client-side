// src/components/conferences/searchAdvanceSection/PublisherInput.tsx
import React, { ChangeEvent } from 'react';

interface PublisherInputProps {
  selectedPublisher: string | null;
  onPublisherChange: (event: ChangeEvent<HTMLInputElement>) => void;
  t: (key: string) => string;
}

export const PublisherInput: React.FC<PublisherInputProps> = ({ selectedPublisher, onPublisherChange, t }) => (
  <div className="col-span-1">
    <label className="mb-1 flex items-center text-sm font-bold" htmlFor="publisher">{t('Publisher')}:</label>
    <input
      type="text"
      id="publisher"
      className="focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow placeholder:text-primary focus:outline-none"
      value={selectedPublisher || ''}
      onChange={onPublisherChange}
      placeholder={t('Enter_publisher_name') ?? 'Enter publisher name'}
    />
  </div>
);