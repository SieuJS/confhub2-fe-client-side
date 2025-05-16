import React from 'react'
import { ClientContentMessage } from '../multimodal-live-types'
import RenderPart from './RenderPart'

type ClientContentLogProps = {
  message: ClientContentMessage['clientContent']
}

const ClientContentLog: React.FC<ClientContentLogProps> = ({ message }) => {
  const { turns, turnComplete } = message

  // Removed outer div styling (m-4, rounded-lg, bg-blue-100, p-4, shadow-md, dark:bg-gray-900)
  // LogEntry now handles the bubble styling.
  return (
    <div className='text-sm text-inherit'> {/* Ensure consistent text size and color inheritance */}
      {turns.map((turn, i) => (
        <div key={`message-turn-${i}`} className='mb-2 last:mb-0'> {/* Reduced margin for multi-part consistency */}
          {turn.parts
            .filter(part => !(part.text && part.text === '\n'))
            .map((part, j) =>
              part.text ? (
                <p
                  key={`message-turn-${i}-part-${j}`}
                  // Using Tailwind for whitespace, added text-sm for consistency
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
        <span className='mt-2 block text-xs font-medium text-red-500 dark:text-red-400'> {/* Adjusted styling and added dark mode */}
          turnComplete: false
        </span>
      )}
    </div>
  )
}

export default ClientContentLog