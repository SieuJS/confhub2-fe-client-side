// src/app/[locale]/chatbot/regularchat/FilePartDisplay.tsx
import React from 'react';
import { Part as GeminiPartSDK } from '@google/genai'; // Đổi tên để tránh nhầm lẫn với Part type nội bộ nếu có
import { ChatMessageType } from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import { FileText, ImageIcon, AlertCircle, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';

// Định nghĩa lại các type nội bộ cho rõ ràng
type UserFileDisplayItem = NonNullable<ChatMessageType['files']>[number];
type BotFileDisplayItem = NonNullable<ChatMessageType['botFiles']>[number];
// GeminiPartSDK đã được import

interface FilePartDisplayProps {
  item: GeminiPartSDK | UserFileDisplayItem | BotFileDisplayItem;
  isUserMessage?: boolean;
}

const FileDisplayCard: React.FC<{
  icon: React.ReactNode;
  fileName: string;
  fileSize?: number; // in bytes
  fileType?: string;
  fileUri?: string; // Dùng cho link ngoài hoặc src của ảnh nếu là URI
  isImage?: boolean;
  imageDataUrl?: string; // Dùng cho src của ảnh nếu là data URL (base64)
  altText?: string;
  isUserMessage?: boolean;
}> = ({ icon, fileName, fileSize, fileType, fileUri, isImage, imageDataUrl, altText, isUserMessage }) => {
  const t = useTranslations('Chat');
  const formattedSize = fileSize && fileSize > 0 ? `${(fileSize / 1024).toFixed(1)} KB` : '';

  return (
    <div className={`file-display-card flex items-start p-2.5 border rounded-lg shadow-sm bg-white dark:bg-gray-700 dark:border-gray-600 w-full max-w-xs sm:max-w-sm my-1 ${isUserMessage ? 'ml-auto' : 'mr-auto'}`}>
      <div className="flex-shrink-0 mr-3 pt-0.5">{icon}</div>
      <div className="flex-grow overflow-hidden">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate" title={fileName}>
          {fileName}
        </p>
        {fileType && <p className="text-xs text-gray-500 dark:text-gray-400">{fileType}</p>}
        {formattedSize && <p className="text-xs text-gray-500 dark:text-gray-400">{formattedSize}</p>}
        {isImage && (imageDataUrl || fileUri) && ( // Hiển thị ảnh nếu có imageDataUrl (cho base64) hoặc fileUri (cho link)
          <img
            src={imageDataUrl || fileUri} // Ưu tiên imageDataUrl
            alt={altText || fileName}
            className="mt-2 max-h-40 w-auto rounded-md border dark:border-gray-500 object-contain"
          />
        )}
      </div>
      {/* Chỉ hiển thị link ngoài nếu là fileUri và không phải là ảnh đang được preview bằng thẻ img */}
      {fileUri && (!isImage || (isImage && !imageDataUrl)) && (
        <a
          href={fileUri}
          target="_blank"
          rel="noopener noreferrer"
          title={t('ViewOrDownloadFile', { fileName })}
          className="ml-2 flex-shrink-0 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <ExternalLink size={18} />
        </a>
      )}
    </div>
  );
};


const FilePartDisplay: React.FC<FilePartDisplayProps> = ({ item, isUserMessage }) => {
  const t = useTranslations('Chat');

  // Type Guards (giữ nguyên như bạn đã cung cấp, chúng có vẻ ổn)
  const isGeminiPart = (obj: any): obj is GeminiPartSDK => {
    return typeof obj === 'object' && obj !== null &&
      (('text' in obj) || ('fileData' in obj) || ('inlineData' in obj) || ('functionCall' in obj) || ('functionResponse' in obj)) &&
      !('size' in obj && 'name' in obj && 'type' in obj);
  };
  const isUserFile = (obj: any): obj is UserFileDisplayItem => {
    return typeof obj === 'object' && obj !== null &&
      'name' in obj &&
      typeof obj.name === 'string' && // Thêm kiểm tra type
      'size' in obj &&
      typeof obj.size === 'number' && // Thêm kiểm tra type
      'type' in obj &&
      typeof obj.type === 'string'; // Thêm kiểm tra type
  };
  const isBotFile = (obj: any): obj is BotFileDisplayItem => {
    return typeof obj === 'object' && obj !== null &&
      'mimeType' in obj &&
      typeof obj.mimeType === 'string' && // Thêm kiểm tra type
      (('uri' in obj && typeof obj.uri === 'string') || ('inlineData' in obj && typeof obj.inlineData === 'object')) && // Kiểm tra sâu hơn cho inlineData
      !('size' in obj && 'name' in obj && 'type' in obj);
  };


  // --- Render Functions ---

  const renderUserFile = (file: UserFileDisplayItem) => {
    const fileType = file.type; // Luôn là string
    const isImage = fileType.startsWith('image/');
    const icon = isImage ? <ImageIcon size={28} className="text-purple-500" /> :
      fileType === 'application/pdf' ? <FileText size={28} className="text-red-500" /> :
        <FileText size={28} className="text-gray-500" />;
    return (
      <FileDisplayCard
        icon={icon}
        fileName={file.name} // Luôn là string
        fileSize={file.size} // Luôn là number
        fileType={fileType}
        isImage={isImage}
        imageDataUrl={file.dataUrl} // Có thể undefined, FileDisplayCard sẽ xử lý
        altText={file.name}
        isUserMessage={isUserMessage}
      // fileUri không áp dụng trực tiếp cho UserFile vì dataUrl dùng cho preview,
      // và UserFile không nhất thiết phải có URI trỏ ra ngoài.
      />
    );
  };

  const renderBotOrGeminiFile = (fileSource: BotFileDisplayItem | GeminiPartSDK) => {
    let fileName = "attachment";
    let fileSize: number | undefined;
    let fileType: string = "application/octet-stream"; // Default
    let fileUri: string | undefined;
    let isImage = false;
    let imageDataUrl: string | undefined; // Cho base64 preview
    let icon: React.ReactNode = <FileText size={28} className="text-gray-500" />;

    let sourceMimeType: string | undefined;
    let sourceData: string | undefined; // For inlineData
    let sourceUri: string | undefined; // For fileData

    if ('inlineData' in fileSource && fileSource.inlineData) { // Ưu tiên inlineData nếu có
      // Đối với BotFileDisplayItem, inlineData.mimeType và inlineData.data là string
      // Đối với GeminiPartSDK, chúng có thể undefined
      sourceMimeType = typeof fileSource.inlineData.mimeType === 'string' ? fileSource.inlineData.mimeType : undefined;
      sourceData = typeof fileSource.inlineData.data === 'string' ? fileSource.inlineData.data : undefined;

      if (sourceMimeType && sourceData) {
        fileType = sourceMimeType;
        fileName = `inline_data.${fileType.split('/')[1] || 'bin'}`;
        fileSize = Math.round((sourceData.length * 3) / 4);
        if (fileType.startsWith('image/')) {
          isImage = true;
          imageDataUrl = `data:${fileType};base64,${sourceData}`;
          icon = <ImageIcon size={28} className="text-purple-500" />;
        } else if (fileType === 'application/pdf') {
          icon = <FileText size={28} className="text-red-500" />;
        }
        // fileUri có thể là data URI để cho phép "mở" (dù chỉ là hiển thị lại)
        fileUri = imageDataUrl; // Hoặc để undefined nếu không muốn link cho inline data
      } else {
        //  console.warn("FilePartDisplay: Item has inlineData but mimeType or data is invalid.", fileSource.inlineData);
        return null; // Không thể render nếu inlineData không hợp lệ
      }
    } else if ('fileData' in fileSource && fileSource.fileData) { // Xử lý fileData từ GeminiPartSDK
      sourceMimeType = typeof fileSource.fileData.mimeType === 'string' ? fileSource.fileData.mimeType : undefined;
      sourceUri = typeof fileSource.fileData.fileUri === 'string' ? fileSource.fileData.fileUri : undefined;

      if (!sourceUri) { // Nếu GeminiPart.fileData không có fileUri, không render
        // console.warn("FilePartDisplay: GeminiPart.fileData is missing fileUri. Not rendering.", fileSource.fileData);
        return null;
      }
      fileUri = sourceUri;
      fileType = sourceMimeType || 'application/octet-stream'; // Fallback nếu mimeType từ part.fileData là undefined
      fileName = fileUri.split('/').pop() || "uploaded_file";

      if (fileType.startsWith('image/')) {
        isImage = true;
        // imageDataUrl sẽ không được set, để FileDisplayCard dùng fileUri cho src của img
        icon = <ImageIcon size={28} className="text-purple-500" />;
      } else if (fileType === 'application/pdf') {
        icon = <FileText size={28} className="text-red-500" />;
      }
      // fileSize không có từ GeminiPart.fileData
    } else if ('uri' in fileSource && typeof fileSource.uri === 'string') { // Xử lý BotFileDisplayItem có uri (không có inlineData)
      sourceUri = fileSource.uri;
      sourceMimeType = ('mimeType' in fileSource && typeof fileSource.mimeType === 'string') ? fileSource.mimeType : undefined;

      fileUri = sourceUri;
      fileType = sourceMimeType || 'application/octet-stream';
      fileName = fileUri.split('/').pop() || "bot_uploaded_file";

      if (fileType.startsWith('image/')) {
        isImage = true;
        icon = <ImageIcon size={28} className="text-purple-500" />;
      } else if (fileType === 'application/pdf') {
        icon = <FileText size={28} className="text-red-500" />;
      }
      // fileSize không có từ BotFileDisplayItem (trừ khi bạn thêm vào type)
    } else {
      // Không phải inlineData, fileData (của GeminiPart), hoặc BotFile có uri.
      // Hoặc là một GeminiPart chỉ có text, functionCall, functionResponse.
      if ('text' in fileSource && fileSource.text && !('fileData' in fileSource) && !('inlineData' in fileSource)) return null; // Bỏ qua text part
      if ('functionCall' in fileSource || 'functionResponse' in fileSource) return null; // Bỏ qua function parts

      // console.warn("FilePartDisplay: Bot/Gemini file item is not renderable with current logic.", fileSource);
      return null; // Không render nếu không xác định được
    }

    return (
      <FileDisplayCard
        icon={icon}
        fileName={fileName}
        fileSize={fileSize}
        fileType={fileType}
        fileUri={fileUri}
        isImage={isImage}
        imageDataUrl={imageDataUrl}
        altText={fileName}
        isUserMessage={isUserMessage}
      />
    );
  };


  // --- Logic chính để quyết định hàm render nào sẽ được gọi ---
  if (isUserFile(item)) {
    return renderUserFile(item);
  } else if (isBotFile(item)) {
    // isBotFile guard đã kiểm tra sự tồn tại của mimeType và (uri hoặc inlineData)
    return renderBotOrGeminiFile(item);
  } else if (isGeminiPart(item)) {
    // isGeminiPart guard kiểm tra sự tồn tại của một trong các trường oneof
    // renderBotOrGeminiFile sẽ xử lý các trường hợp fileData, inlineData
    // và trả về null cho text, functionCall, functionResponse parts.
    return renderBotOrGeminiFile(item);
  }

  // Fallback cuối cùng
  // console.warn("FilePartDisplay: Item did not match any known file/part type or was not renderable.", item);
  return (
    <div className="flex items-center space-x-2 text-orange-500 dark:text-orange-400 my-1 p-2 border border-dashed border-orange-500 rounded-md">
      <AlertCircle size={18} />
      <span>{t('CannotDisplayContent')} (Dev: Type unmatched)</span>
    </div>
  );
};

export default FilePartDisplay;