import React from 'react';
import Map from '@/src/app/[locale]/conferences/detail/Map';
import MarkdownRenderer from './MarkdownRenderer';

interface MapMessageProps {
  text?: string;
  location: string;
}

/**
 * Renders a message containing a map, along with optional introductory text.
 */
const MapMessage: React.FC<MapMessageProps> = ({ text, location }) => {
  const shouldRenderText = text && text.toLowerCase() !== `showing map for: ${location.toLowerCase()}`;

  return (
    <div className='map-content-wrapper py-1'>
      {shouldRenderText && (
        <div className='mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 sm:mb-2'>
          {/* Sử dụng MarkdownRenderer để đảm bảo tính nhất quán */}
          <MarkdownRenderer content={text} className='[&_*]:text-inherit' />
        </div>
      )}
      <Map location={location} />
    </div>
  );
};

export default MapMessage;