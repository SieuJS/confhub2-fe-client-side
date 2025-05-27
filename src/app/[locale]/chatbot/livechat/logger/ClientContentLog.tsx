// src/app/[locale]/chatbot/livechat/logger/ClientContentLog.tsx
import React from 'react'
import { ClientContentPayload } from '@/src/app/[locale]/chatbot/lib/live-chat.types';
import RenderPart from './RenderPart'

type ClientContentLogProps = {
  message: ClientContentPayload
}

const ClientContentLog: React.FC<ClientContentLogProps> = ({ message }) => {
  const { turns, turnComplete } = message

  return (
    <div className='text-sm text-inherit'>
      {turns?.map((turn, i) => (
        <div key={`message-turn-${i}`} className='mb-2 last:mb-0'>
          {/* Add optional chaining here: turn.parts?.filter(...) */}
          {turn.parts
            ?.filter(part => !(part.text && part.text === '\n'))
            .map((part, j) =>
              part.text ? (
                <p
                  key={`message-turn-${i}-part-${j}`}
                  className='part part-text whitespace-pre-wrap text-inherit'
                >
                  {part.text}
                </p>
              ) : (
                <RenderPart part={part} key={`message-turn-${i}-part-${j}`} />
              )
            )}
        </div>
      ))}
      {!turnComplete && (
        <span className='mt-2 block text-xs font-medium text-red-500 dark:text-red-400'>
          turnComplete: false
        </span>
      )}
    </div>
  )
}

export default ClientContentLog