// src/app/[locale]/chatbot/livechat/logger/PlainTextMessage.tsx
import React from "react";
// No need to import StreamingLog here if MessageRenderer guarantees 'message' is a string

type PlainTextMessageProps = {
  message: string; // Expecting a string directly
}

const PlainTextMessage: React.FC<PlainTextMessageProps> = ({ message }) => {
  return (
    <p className='text-sm text-inherit'>
      {message}
    </p>
  )
}

export default PlainTextMessage;