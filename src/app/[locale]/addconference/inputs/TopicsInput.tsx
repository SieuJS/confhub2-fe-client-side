// src/app/[locale]/addconference/inputs/TopicsInput.tsx
import React from 'react';
import clsx from 'clsx';
import { XMarkIcon } from '@heroicons/react/20/solid'; // Giữ lại XMarkIcon vì nó đã được sử dụng và phù hợp
import { Info, ListChecks } from 'lucide-react'; // Import icons từ Lucide

import { ConferenceDetailsStepProps } from '../steps/ConferenceDetailsStep';

interface TopicsInputProps extends ConferenceDetailsStepProps {
  topicError: string | null;
}

const TopicsInput: React.FC<TopicsInputProps> = ({
  formData,
  newTopic,
  setNewTopic,
  addTopic,
  removeTopic,
  topicError,
  t,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTopic();
    }
  };

  const topicsCount = formData.topics.length;

  return (
    <div className="sm:col-span-6">
      <div className="flex items-center gap-2 mb-1">
        <label htmlFor="newTopic" className="block text-sm font-medium text-gray-700">
          <div className="flex items-center"> {/* Flex container cho icon và label text */}
            <ListChecks className="h-4 w-4 mr-2 text-gray-500" /> {/* Icon chính cho Topics */}
            {<span className="text-red-500">* </span>} {/* Giả định topics là required, nếu không thì bỏ * */}
            {t('Topics')} ({topicsCount} / 100)
          </div>
        </label>
        <div title={t('Topics_Tooltip')}>
          <Info className="h-5 w-5 text-gray-400 cursor-pointer" /> {/* Thay thế InformationCircleIcon */}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
        <div className="flex-grow">
          <input
            type="text"
            id="newTopic"
            value={newTopic}
            onChange={e => setNewTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            className={clsx(
              'p-2 w-full rounded-md shadow-sm sm:text-sm',
              topicError
                ? 'border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            )}
            placeholder={t('Add_a_topic_and_press_Enter')}
            aria-invalid={!!topicError}
            aria-describedby={topicError ? 'topic-error' : undefined}
          />
          {topicError && (
            <p id="topic-error" className="mt-2 text-sm text-red-600">{topicError}</p>
          )}
        </div>
        <button
          type="button"
          onClick={addTopic}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:w-auto"
        >
          {t('Add')}
        </button>
      </div>

      {formData.topics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2" aria-label={t('Added_topics')}>
          {formData.topics.map((topic, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-1 text-sm font-medium text-indigo-800"
            >
              {topic}
              <button
                type="button"
                onClick={() => removeTopic(topic)}
                className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none"
                aria-label={`${t('Remove')} ${topic}`}
              >
                <span className="sr-only">{t('Remove')}</span>
                <XMarkIcon className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}
      {formData.topics.length < 1 && (
        <p className="mt-2 text-sm text-red-600">{t('Please_add_at_least_one_topic')}</p>
      )}
    </div>
  );
};

export default TopicsInput;