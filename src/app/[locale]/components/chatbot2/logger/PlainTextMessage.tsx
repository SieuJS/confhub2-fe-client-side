// PlainTextMessage.tsx
import React from "react";
import { StreamingLog } from "../multimodal-live-types";


type PlainTextMessageProps = {
    message: StreamingLog["message"];
  };

const PlainTextMessag: React.FC<PlainTextMessageProps> = ({
    message,
  }) => <span>{message as string}</span>;

export default PlainTextMessag;