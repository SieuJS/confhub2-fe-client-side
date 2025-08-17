// src/components/conferences/searchAdvanceSection/RankSelector.tsx
import React, { ChangeEvent } from 'react';

interface RankSelectorProps {
  selectedRank: string | null;
  onRankChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  t: (key: string) => string;
}

export const RankSelector: React.FC<RankSelectorProps> = ({ selectedRank, onRankChange, t }) => (
  <div className="col-span-1">
    <label className="mb-1 flex items-center text-sm font-bold" htmlFor="rank">{t('Rank')}:</label>
    <select
      id="rank"
      className="focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow focus:outline-none"
      value={selectedRank || ''}
      onChange={onRankChange}
    >
      <option value="">{t('All_Ranks')}</option>
      <option value="A*">A*</option>
      <option value="A">A</option>
      <option value="B">B</option>
      <option value="C">C</option>
      <option value="Unranked">Unranked</option>
      <option value="other">Other</option>
    </select>
  </div>
);