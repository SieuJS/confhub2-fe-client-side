// ModelTurnLog.tsx
import React from "react";
import { ServerContentMessage, ModelTurn } from "../multimodal-live-types";
import RenderPart from "./RenderPart";

type ModelTurnLogProps = {
  message: ServerContentMessage;
};

const ModelTurnLog: React.FC<ModelTurnLogProps> = ({ message }): JSX.Element => {
  const serverContent = message.serverContent;
  console.log(serverContent);
  const { modelTurn } = serverContent as ModelTurn;
  const { parts } = modelTurn;

  return (
    <div className="bg-green-50 rounded-lg p-4 shadow-md">
      <h4 className="text-lg font-semibold text-green-700 mb-2">Model</h4>
      {parts
        .filter((part) => !(part.text && part.text === "\n"))
        .map((part, j) => (
          <RenderPart part={part} key={`model-turn-part-${j}`} />
        ))}
    </div>
  );
};

export default ModelTurnLog;