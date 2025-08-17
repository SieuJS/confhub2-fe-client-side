// src/components/conferences/eventCard/EventCardInfoRow.tsx
import React from 'react';

interface EventCardInfoRowProps {
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const EventCardInfoRow: React.FC<EventCardInfoRowProps> = ({ icon, children }) => (
  <div className="mb-3 flex items-center text-xs transition duration-300">
    {icon}
    {children}
  </div>
);