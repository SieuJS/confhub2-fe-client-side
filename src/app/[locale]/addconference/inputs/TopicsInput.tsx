// src/app/[locale]/addconference/components/inputs/TopicsInput.tsx
import React from 'react'

interface TopicsInputProps {
  topics: string[]
  setTopics: (topics: string[]) => void // topics will be managed by TopicsInput internally
  newTopic: string
  setNewTopic: (value: string) => void
  t: (key: string) => string
}

const TopicsInput: React.FC<TopicsInputProps> = ({
  topics,
  setTopics,
  newTopic,
  setNewTopic,
  t
}) => {
  const handleAddTopic = () => {
    if (newTopic.trim() !== '') {
      setTopics([...topics, newTopic.trim()])
      setNewTopic('')
    }
  }

  const handleRemoveTopic = (topicToRemove: string) => {
    setTopics(topics.filter(topic => topic !== topicToRemove))
  }

  return (
    <div className='sm:col-span-2'>
      <label htmlFor='newTopic' className='block text-sm  '>
        {t('Topics')}:
      </label>
      <div className='mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-3'>
        <input
          type='text'
          id='newTopic'
          value={newTopic}
          onChange={e => setNewTopic(e.target.value)}
          className='flex-grow rounded-md border border-button px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
          placeholder={t('Add_a_topic')}
        />
        <button
          type='button'
          onClick={handleAddTopic}
          className='mt-2 w-full rounded-md bg-button px-4 py-2 text-sm text-button-text hover:bg-button focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2 sm:mt-0 sm:w-auto'
        >
          {t('Add')}
        </button>
      </div>
      <div className='mt-3 flex flex-wrap gap-2'>
        {topics.map((topic, index) => (
          <span
            key={index}
            className='inline-flex items-center rounded-full bg-gray-20 px-3 py-1 text-sm font-semibold '
          >
            {topic}
            <button
              type='button'
              onClick={() => handleRemoveTopic(topic)}
              className='hover: ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full  hover:bg-gray-30 focus:bg-gray-40 focus:text-white focus:outline-none'
              aria-label={`Remove ${topic}`}
            >
              <svg
                className='h-2 w-2'
                stroke='currentColor'
                fill='none'
                viewBox='0 0 8 8'
              >
                <path
                  strokeLinecap='round'
                  strokeWidth='1.5'
                  d='M1 1l6 6m0-6L1 7'
                />
              </svg>
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

export default TopicsInput
