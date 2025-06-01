// src/app/[locale]/chatbot/regularchat/MessageSourcesDisplay.tsx
import React from 'react';
import { SourceItem } from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import { LinkIcon, ExternalLinkIcon } from 'lucide-react'; // Sử dụng ExternalLinkIcon cho rõ ràng hơn

interface MessageSourcesDisplayProps {
  sources: SourceItem[];
}

const MessageSourcesDisplay: React.FC<MessageSourcesDisplayProps> = ({ sources }) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
      <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center">
        <LinkIcon size={14} className="mr-1.5 text-gray-500 dark:text-gray-400" />
        Sources
      </h4>
      <ul className="list-none pl-0 space-y-1">
        {sources.map((source, index) => (
          <li key={index} className="text-xs">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline group"
              title={source.url}
            >
              <span className="truncate max-w-[200px] sm:max-w-[250px] md:max-w-[300px]">
                {index + 1}. {source.name || new URL(source.url).hostname}
              </span>
              <ExternalLinkIcon size={12} className="ml-1 opacity-60 group-hover:opacity-100 transition-opacity" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MessageSourcesDisplay;