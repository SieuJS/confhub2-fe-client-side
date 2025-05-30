// src/app/[locale]/chatbot/regularchat/FilePartDisplay.tsx
import React from 'react';
import { Part as GeminiPart } from '@google/genai'; // SDK Part
import { ChatMessageType } from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; // For our custom file types
import { Download, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react'; // Icons

// Define a union type for the props to make it flexible
type UserFile = NonNullable<ChatMessageType['files']>[number];
type BotFile = NonNullable<ChatMessageType['botFiles']>[number];

interface FilePartDisplayProps {
  item: GeminiPart | UserFile | BotFile;
  // isUserUploaded?: boolean; // Could be useful if styling differs significantly
  // isBotSent?: boolean;      // Could be useful
  index?: number; // For unique keys if needed, though parent usually handles this
}

const FilePartDisplay: React.FC<FilePartDisplayProps> = ({ item }) => {
  const renderGeminiPart = (part: GeminiPart) => {
    if (part.inlineData) {
      if (part.inlineData.mimeType.startsWith('image/')) {
        return (
          <img
            src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`}
            alt="Inline content"
            className="mt-1 max-w-full rounded-lg border dark:border-gray-600 sm:max-w-sm md:max-w-md object-contain"
          />
        );
      } else {
        return (
          <a
            href={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`}
            download={`inline_file.${part.inlineData.mimeType.split('/')[1] || 'bin'}`}
            className="mt-1 flex items-center space-x-2 text-blue-600 hover:underline dark:text-blue-400"
            title={`Download ${part.inlineData.mimeType}`}
          >
            <Download size={18} className="flex-shrink-0" />
            <span>Download {part.inlineData.mimeType}</span>
          </a>
        );
      }
    } else if (part.fileData) {
      const mimeType = part.fileData.mimeType || 'application/octet-stream';
      if (mimeType.startsWith('image/')) {
        return (
          <img
            src={part.fileData.fileUri}
            alt="File content"
            className="mt-1 max-w-full rounded-lg border dark:border-gray-600 sm:max-w-sm md:max-w-md object-contain"
          />
        );
      } else {
        return (
          <a
            href={part.fileData.fileUri}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-center space-x-2 text-blue-600 hover:underline dark:text-blue-400"
            title={`View/Download ${mimeType}`}
          >
            {mimeType.startsWith('application/pdf') ? <FileText size={18} className="flex-shrink-0" /> : <Download size={18} className="flex-shrink-0" />}
            <span>View/Download File ({mimeType})</span>
          </a>
        );
      }
    }
    return null; // Or some fallback for other Gemini Part types if not text
  };

  const renderUserFile = (file: UserFile) => {
    return (
      <div className="user-file-attachment text-sm">
        {file.dataUrl && file.type.startsWith('image/') ? (
          <img
            src={file.dataUrl}
            alt={file.name}
            className="mt-1 max-w-[200px] rounded-md border dark:border-gray-600 md:max-w-[250px] object-contain"
          />
        ) : (
          <a
            href={file.dataUrl} // This is likely a blob URL created client-side
            download={file.name}
            className="flex items-center space-x-2 text-blue-600 hover:underline dark:text-blue-400"
            title={`Download ${file.name}`}
          >
            {file.type.startsWith('image/') ? <ImageIcon size={18} className="flex-shrink-0" /> :
             file.type.startsWith('application/pdf') ? <FileText size={18} className="flex-shrink-0" /> :
             <Download size={18} className="flex-shrink-0" />}
            <span>{file.name} ({Math.round(file.size / 1024)} KB)</span>
          </a>
        )}
      </div>
    );
  };

  const renderBotFile = (botFile: BotFile) => {
    const mimeType = botFile.mimeType || 'application/octet-stream';
    if (botFile.inlineData && botFile.inlineData.mimeType.startsWith('image/')) {
      return (
        <img
          src={`data:${botFile.inlineData.mimeType};base64,${botFile.inlineData.data}`}
          alt="Bot inline content"
          className="mt-1 max-w-full rounded-lg border dark:border-gray-600 sm:max-w-sm md:max-w-md object-contain"
        />
      );
    } else if (botFile.uri && mimeType.startsWith('image/')) {
      return (
        <img
          src={botFile.uri}
          alt="Bot file content"
          className="mt-1 max-w-full rounded-lg border dark:border-gray-600 sm:max-w-sm md:max-w-md object-contain"
        />
      );
    } else if (botFile.uri) {
      return (
        <a
          href={botFile.uri}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-blue-600 hover:underline dark:text-blue-400"
          title={`View/Download ${mimeType}`}
        >
          {mimeType.startsWith('application/pdf') ? <FileText size={18} className="flex-shrink-0" /> : <Download size={18} className="flex-shrink-0" />}
          <span>View/Download Attachment ({mimeType})</span>
        </a>
      );
    }
    return (
        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <AlertCircle size={18} />
            <span>Unsupported bot file</span>
        </div>
    );
  };

  // Type guard to check if item is a GeminiPart
  // This is a basic check; more robust checks might look for specific properties like fileData or inlineData.
  const isGeminiPart = (item: any): item is GeminiPart => {
    return ('fileData' in item || 'inlineData' in item || 'text' in item) && !('size' in item) && !('uri' in item && 'mimeType' in item && Object.keys(item).length <=3 );
  };

  // Type guard for UserFile
  const isUserFile = (item: any): item is UserFile => {
    return 'name' in item && 'size' in item && 'type' in item;
  };

  // Type guard for BotFile (can be a bit tricky if it only has uri and mimeType)
  const isBotFile = (item: any): item is BotFile => {
    return ('uri' in item || 'inlineData' in item) && 'mimeType' in item && !('size' in item);
  };


  if (isGeminiPart(item)) {
    // We only want to render non-text Gemini parts here, as text is handled separately.
    if (item.text) return null; // Text parts are rendered by MessageContentRenderer's markdown logic
    return <div className="gemini-part-display my-1">{renderGeminiPart(item)}</div>;
  } else if (isUserFile(item)) {
    return <div className="user-file-display my-1">{renderUserFile(item)}</div>;
  } else if (isBotFile(item)) {
    return <div className="bot-file-display my-1">{renderBotFile(item)}</div>;
  }

  console.warn("FilePartDisplay: Unknown item type", item);
  return (
    <div className="flex items-center space-x-2 text-red-500 dark:text-red-400 my-1">
        <AlertCircle size={18} />
        <span>Cannot display this content</span>
    </div>
  );
};

export default FilePartDisplay;