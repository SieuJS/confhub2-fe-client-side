// src/app/[locale]/chatbot/livechat/logger/InputTranscriptionLog.tsx
import React from 'react';
import { TranscriptionPayload } from '../../lib/live-chat.types'; // Or directly from SDK

interface InputTranscriptionLogProps {
  transcription: TranscriptionPayload;
}

const InputTranscriptionLog: React.FC<InputTranscriptionLogProps> = ({ transcription }) => {
  return (
    <div className="my-1 p-2 text-xs text-sky-700 bg-sky-50 border border-sky-200 rounded">
      {/* <strong className="font-semibold">[User Transcription]:</strong> */}
      <p className="whitespace-pre-wrap">{transcription.text}</p>
    </div>
  );
};

export default InputTranscriptionLog;
