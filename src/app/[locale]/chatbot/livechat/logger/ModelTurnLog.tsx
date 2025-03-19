// ModelTurnLog.tsx
// import React from "react";
import { ServerContentMessage, ModelTurn } from "../multimodal-live-types";
import RenderPart from "./RenderPart";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type ModelTurnLogProps = {
  message: ServerContentMessage;
};

const ModelTurnLog: React.FC<ModelTurnLogProps> = ({ message }): JSX.Element => {
  const serverContent = message.serverContent;
  const { modelTurn } = serverContent as ModelTurn;
  const { parts } = modelTurn;

  // Combine text parts into a single string, handling potential undefined values
  const combinedText = parts
    .filter((part) => part.text !== undefined && part.text !== null && part.text !== "\n")
    .map((part) => part.text)
    .join("");

  return (
    <div className="m-4 bg-green-100 rounded-lg p-4 shadow-md">
      <h4 className="text-lg font-semibold text-green-700 mb-2">Model</h4>
      {/* Render combined text using ReactMarkdown */}
      {combinedText && (
        <ReactMarkdown components={{
          p: ({ node, ...props }) => <p className="part part-text" {...props} />
        }}
          remarkPlugins={[remarkGfm]} >


          {combinedText}
        </ReactMarkdown>
      )}
      {/* Render other parts (code, etc.) */}
      {parts
        .filter((part) => !part.text || part.text === "\n") // filter only part is not text
        .map((part, j) => (
          <RenderPart part={part} key={`model-turn-part-${j}`} />
        ))}
    </div>
  );
};

export default ModelTurnLog;
