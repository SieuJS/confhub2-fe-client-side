// ModelTurnLog.tsx
import React from "react";
import {  ServerContentMessage, ModelTurn } from "../multimodal-live-types";
import RenderPart from "./RenderPart";

type ModelTurnLogProps = {
  message: ServerContentMessage;
};
const ModelTurnLog: React.FC<ModelTurnLogProps> = ({ message }): JSX.Element => {
    const serverContent = message.serverContent;
    const { modelTurn } = serverContent as ModelTurn;
    const { parts } = modelTurn;
  
    return (
      <div className="rich-log model-turn model">
        <h4 className="role-model">Model</h4>
        {parts
          .filter((part) => !(part.text && part.text === "\n"))
          .map((part, j) => (
            <RenderPart part={part} key={`model-turn-part-${j}`} />
          ))}
      </div>
    );
  };

export default ModelTurnLog;