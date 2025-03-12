// ClientContentLog.tsx
import React from "react";
import { ClientContentMessage } from "../multimodal-live-types";
import RenderPart from "./RenderPart";

type ClientContentLogProps = {
  message: ClientContentMessage;
};

const ClientContentLog: React.FC<ClientContentLogProps> = ({ message }) => {
  const { turns, turnComplete } = message.clientContent;

  return (
    <div className="bg-gray-50 rounded-lg p-4 shadow-md">
      <h4 className="text-lg font-semibold text-blue-600 mb-2">User</h4>
      {turns.map((turn, i) => (
        <div key={`message-turn-${i}`} className="mb-4 last:mb-0">
          {turn.parts
            .filter((part) => !(part.text && part.text === "\n"))
            .map((part, j) => (
              <RenderPart part={part} key={`message-turn-${i}-part-${j}`} />
            ))}
        </div>
      ))}
      {!turnComplete && (
        <span className="text-sm text-red-500 font-medium">
          turnComplete: false
        </span>
      )}
    </div>
  );
};

export default ClientContentLog;