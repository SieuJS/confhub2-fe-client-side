'use client';

import { useState } from 'react';
import { guideData } from '../data/announcementData';
import { ChevronRight } from 'lucide-react';

export const GuideTab = () => {
  // State để theo dõi mục nào đang được mở. `string | null` để lưu key duy nhất.
  const [openItemKey, setOpenItemKey] = useState<string | null>(null);

  const handleToggle = (key: string) => {
    // Nếu bấm vào mục đang mở, đóng nó lại. Ngược lại, mở mục mới.
    setOpenItemKey(openItemKey === key ? null : key);
  };

  return (
    <div className="space-y-6">
      {guideData.map((category, categoryIndex) => (
        <div key={categoryIndex}>
          <h3 className="text-lg font-bold text-text-primary mb-3 pb-2 border-b border-border">
            {category.category}
          </h3>
          <ul className="space-y-2">
            {category.features.map((feature, featureIndex) => {
              const itemKey = `${categoryIndex}-${featureIndex}`;
              const isOpen = openItemKey === itemKey;

              return (
                <li key={itemKey} className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleToggle(itemKey)}
                    className="w-full flex justify-between items-center p-3 text-left font-medium text-text-primary hover:bg-background-secondary transition-colors"
                  >
                    <span>{feature.title}</span>
                    <ChevronRight
                      className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
                    />
                  </button>
                  {/* Nội dung có thể mở rộng */}
                  <div
                    className={`transition-all duration-300 ease-in-out grid ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                       <p className="p-3 pt-0 text-sm text-text-secondary">
                        {feature.guideContent}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
};