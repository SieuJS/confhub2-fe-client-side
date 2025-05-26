// src/app/[locale]/chatbot/livechat/components/FeatureComingSoonOverlay.tsx
import React from 'react';

interface FeatureComingSoonOverlayProps {
  isVisible: boolean;
  featureName: string;
}

const FeatureComingSoonOverlay: React.FC<FeatureComingSoonOverlayProps> = ({ isVisible, featureName }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-80 backdrop-blur-xs">
      <div className="rounded-lg bg-white p-6 text-center shadow-xl">
        <h2 className="mb-3 text-2xl font-bold text-gray-800">Tính năng sắp ra mắt!</h2>
        <p className="mb-4 text-gray-700">
          Chúng tôi đang tích cực phát triển tính năng <strong className="text-blue-600">{featureName}</strong> này.
          Vui lòng quay lại sau để trải nghiệm nhé!
        </p>
        <p className="text-sm text-gray-500">Cảm ơn sự kiên nhẫn của bạn.</p>
      </div>
    </div>
  );
};

export default FeatureComingSoonOverlay;