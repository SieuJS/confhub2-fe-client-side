// src/components/conferences/searchAdvanceSection/SourceSelector.tsx
import React, { ChangeEvent } from 'react';

interface SourceSelectorProps {
  selectedSource: string | null;
  availableSources: string[];
  isLoading: boolean;
  onSourceChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  t: (key: string) => string;
}

export const SourceSelector: React.FC<SourceSelectorProps> = ({ selectedSource, availableSources, isLoading, onSourceChange, t }) => (
  <div className="col-span-1">
    <label className="mb-1 flex items-center text-sm font-bold" htmlFor="source">{t('Source')}:</label>
    <select
      id="source"
      className="focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow focus:outline-none"
      value={selectedSource || ''}
      onChange={onSourceChange}
      disabled={isLoading}
    >
      <option value="">{isLoading ? t('Loading_sources') : t('All_Sources')}</option>
      {availableSources.map(source => (
        <option key={source} value={source}>{source}</option>
      ))}
    </select>
  </div>
);