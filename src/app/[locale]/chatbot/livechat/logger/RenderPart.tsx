// src/app/[locale]/chatbot/livechat/logger/RenderPart.tsx
import React from "react"; // Ensure React is imported
import { Part } from "@google/genai"; // SDK's Part type
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 as dark } from "react-syntax-highlighter/dist/esm/styles/hljs";

type RenderPartProps = {
  part: Part; // Uses SDK Part type
};

function tryParseCodeExecutionResult(output: string | undefined): string { // output can be undefined
  if (output === undefined) return "Output not available";
  try {
    const json = JSON.parse(output);
    return JSON.stringify(json, null, "  ");
  } catch (e) {
    return output;
  }
}

const RenderPart: React.FC<RenderPartProps> = ({ part }) => {
  if (part.text && part.text.length) { // Check text first
    return <p className="part part-text whitespace-pre-wrap">{part.text}</p>; // Added whitespace-pre-wrap
  }
  if (part.executableCode) {
    return (
      <div className="part part-executableCode my-1 rounded bg-gray-800 p-2 text-xs text-gray-50">
        <h5 className="mb-1 font-semibold">Executable Code ({part.executableCode.language}):</h5>
        <SyntaxHighlighter
          language={part.executableCode.language?.toLowerCase() || 'plaintext'} // Handle undefined language
          style={dark}
          customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
        >
          {part.executableCode.code || ''}
        </SyntaxHighlighter>
      </div>
    );
  }
  if (part.codeExecutionResult) {
    return (
      <div className="part part-codeExecutionResult my-1 rounded bg-gray-800 p-2 text-xs text-gray-50">
        <h5 className="mb-1 font-semibold">Code Execution Result ({part.codeExecutionResult.outcome}):</h5>
        <SyntaxHighlighter
          language="json" // Assuming output is often JSON or plain text
          style={dark}
          customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
        >
          {tryParseCodeExecutionResult(part.codeExecutionResult.output)}
        </SyntaxHighlighter>
      </div>
    );
  }
  if (part.inlineData) {
    // Basic rendering for inlineData, could be enhanced for images etc.
    return (
      <div className="part part-inlinedata my-1 text-xs">
        <h5 className="font-semibold">Inline Data: {part.inlineData.mimeType}</h5>
        {part.inlineData.mimeType?.startsWith('image/') ? (
            <img src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`} alt="inline data" className="max-w-xs rounded border"/>
        ) : (
            <span className="italic">(Binary data not previewable)</span>
        )}
      </div>
    );
  }
  if (part.functionCall) {
    return (
        <div className="part part-functionCall my-1 rounded bg-gray-800 p-2 text-xs text-gray-50">
            <h5 className="mb-1 font-semibold">Function Call: {part.functionCall.name}</h5>
            <SyntaxHighlighter language="json" style={dark} customStyle={{ margin: 0, padding: 0, background: 'transparent' }}>
                {JSON.stringify(part.functionCall.args, null, 2)}
            </SyntaxHighlighter>
        </div>
    );
  }
  if (part.functionResponse) {
    return (
        <div className="part part-functionResponse my-1 rounded bg-gray-800 p-2 text-xs text-gray-50">
            <h5 className="mb-1 font-semibold">Function Response: {part.functionResponse.name} (ID: {part.functionResponse.id})</h5>
            <SyntaxHighlighter language="json" style={dark} customStyle={{ margin: 0, padding: 0, background: 'transparent' }}>
                {JSON.stringify(part.functionResponse.response, null, 2)}
            </SyntaxHighlighter>
        </div>
    );
  }
  // Fallback for any other part type or empty part
  return <div className="part part-unknown my-1 text-xs italic">(Unsupported or empty part)</div>;
};
export default RenderPart;