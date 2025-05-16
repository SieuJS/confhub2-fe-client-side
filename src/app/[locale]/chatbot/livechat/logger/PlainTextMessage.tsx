import React from "react"; // Added React import
import { StreamingLog } from '../multimodal-live-types'

type PlainTextMessageProps = {
  message: StreamingLog['message']
  // type?: string; // No longer needed here unless PlainTextMessage itself needs to vary significantly
}

const PlainTextMessage: React.FC<PlainTextMessageProps> = ({ message }) => {
  // Removed outer div styling (m-4, rounded-md, bg-gray-300, p-2, dark:bg-gray-900)
  // LogEntry now handles the bubble styling.
  // Changed text-xl to text-sm for better chat message appearance.
  // Removed inline-block as the LogEntry bubble handles block layout.
  // Using <p> for semantic correctness of a message block.
  return (
    <p className='text-sm text-inherit'> {/* text-inherit will take color from parent bubble */}
      {message as string}
    </p>
  )
}

export default PlainTextMessage