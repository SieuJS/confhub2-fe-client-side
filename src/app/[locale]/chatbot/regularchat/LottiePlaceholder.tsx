// src/components/LottiePlaceholder.tsx (or a suitable location)
import React from 'react';
import Lottie from 'lottie-react';
// Import your Lottie JSON animation file
import loadingAnimationData from '@/public/ChatbotPlaceholder.json'; // ADJUST PATH

interface LottiePlaceholderProps {
  className?: string;
}

const LottiePlaceholder: React.FC<LottiePlaceholderProps> = ({ className }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Lottie
        animationData={loadingAnimationData}
        loop={true}
        autoplay={true}
        style={{ width: 60, height: 60 }} // Adjust size as needed
      />
    </div>
  );
};

export default LottiePlaceholder;