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
      <div className="rich-log client-content user">
        <h4 className="roler-user">User</h4>
        {turns.map((turn, i) => (
          <div key={`message-turn-${i}`}>
            {turn.parts
              .filter((part) => !(part.text && part.text === "\n"))
              .map((part, j) => (
                <RenderPart part={part} key={`message-turh-${i}-part-${j}`} />
              ))}
          </div>
        ))}
        {!turnComplete ? <span>turnComplete: false</span> : ""}
      </div>
    );
  };

export default ClientContentLog;