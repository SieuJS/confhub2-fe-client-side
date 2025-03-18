// PlainTextMessage.tsx
// import React from "react";
import { StreamingLog } from "../multimodal-live-types";

type PlainTextMessageProps = {
  message: StreamingLog["message"];
};

const PlainTextMessage: React.FC<PlainTextMessageProps> = ({ message }) => {
  return (
    <div className="m-4 bg-gray-300 p-2 rounded-md inline-block">
      <span className="text-gray-800 text-xl">{message as string}</span>
    </div>
  );
};

export default PlainTextMessage;