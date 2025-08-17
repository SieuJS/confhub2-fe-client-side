// src/components/conferences/resultsSection/LoadingSpinner.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => (
  <div className="flex h-96 flex-col items-center justify-center text-gray-500">
    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
    <p className="mt-4 text-lg">{message}</p>
  </div>
);