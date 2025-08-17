// src/components/conferences/eventCard/BlacklistOverlay.tsx
import React from 'react';

interface BlacklistOverlayProps {
  t: (key: string) => string;
}

export const BlacklistOverlay: React.FC<BlacklistOverlayProps> = ({ t }) => (
  <>
    <div className="pointer-events-none absolute inset-0 z-10 bg-gray-200 opacity-70 grayscale"></div>
    <div className="absolute left-2 top-2 z-20 rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white">
      {t('Blacklisted')}
    </div>
  </>
);