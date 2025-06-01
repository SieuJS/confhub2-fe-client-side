// src/app/[locale]/chatbot/stores/messageStore/messageMappers.ts
import {
    HistoryItem, // Từ backend, có thể có sources, thoughts, action
    ChatMessageType,
    ThoughtStep,
    ResultUpdate, // Từ backend, có thể có sources, thoughts, action
    FrontendAction,
    ItemFollowStatusUpdatePayload,
    UserFile,
    BotFile, // Thêm BotFile
    SourceItem, 
    MessageType, // Thêm MessageType
    AppPart, // Thêm AppPart
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; // Sử dụng type từ lib
import { generateMessageId } from '@/src/app/[locale]/chatbot/utils/chatUtils';
import { Part as GooglePart } from '@google/genai'; // Đảm bảo import đúng

// Helper function to map backend SourceItem to frontend SourceItem
// Giả sử SourceItem từ backend và SourceItem từ frontend có cấu trúc tương tự
function mapBackendSourceToFrontendSource(backendSources?: HistoryItem['sources']): SourceItem[] | undefined {
    if (!backendSources || backendSources.length === 0) {
        return undefined;
    }
    return backendSources.map(bs => ({
        name: bs.name,
        url: bs.url,
        type: bs.type,
    }));
}

export function mapBackendHistoryItemToFrontendChatMessage(backendItem: HistoryItem): ChatMessageType | null {
    // console.log("[MAPPER DEBUG] Processing backendItem:", JSON.parse(JSON.stringify(backendItem)));

    let textContent = "";
    const userFilesForDisplay: UserFile[] = [];
    const botFilesForDisplay: BotFile[] = []; // Sử dụng BotFile type
    let messageType: MessageType = 'text';
    let hasDisplayablePartContent = false;

    if (backendItem.parts && backendItem.parts.length > 0) {
        backendItem.parts.forEach(part => {
            if ('text' in part && typeof part.text === 'string') {
                textContent += (textContent ? "\n" : "") + part.text;
                hasDisplayablePartContent = true;
            } else if (backendItem.role === 'model') {
                if ('fileData' in part && part.fileData) {
                    const mimeType = part.fileData.mimeType || 'application/octet-stream';
                    if (part.fileData.fileUri) {
                        botFilesForDisplay.push({ uri: part.fileData.fileUri, mimeType: mimeType, name: part.fileData.fileUri.split('/').pop() || 'file' });
                        hasDisplayablePartContent = true;
                    }
                } else if ('inlineData' in part && part.inlineData?.data && part.inlineData.mimeType) {
                    botFilesForDisplay.push({
                        mimeType: part.inlineData.mimeType,
                        inlineData: { data: part.inlineData.data, mimeType: part.inlineData.mimeType },
                        name: `inline_data.${part.inlineData.mimeType.split('/')[1] || 'bin'}`
                    });
                    hasDisplayablePartContent = true;
                }
            } else if (backendItem.role === 'user') {
                // userFileInfo sẽ được ưu tiên hơn
                if (('fileData' in part && part.fileData?.fileUri) || ('inlineData' in part && part.inlineData?.data)) {
                    hasDisplayablePartContent = true; // Đánh dấu có nội dung file từ parts
                }
            }
        });
    }

    let hasUserFiles = false;
    if (backendItem.role === 'user' && backendItem.userFileInfo && backendItem.userFileInfo.length > 0) {
        backendItem.userFileInfo.forEach(info => {
            userFilesForDisplay.push({
                name: info.name,
                type: info.type,
                size: info.size,
                // dataUrl không có từ backend history
            });
        });
        if (userFilesForDisplay.length > 0) {
            hasUserFiles = true;
        }
    }
    // Fallback nếu userFileInfo không có nhưng parts có file (ít xảy ra nếu backend chuẩn)
    else if (backendItem.role === 'user' && !hasUserFiles && backendItem.parts?.some(p => ('fileData' in p && p.fileData?.fileUri) || ('inlineData' in p && p.inlineData?.data))) {
        backendItem.parts.forEach(part => {
            if ('fileData' in part && part.fileData?.fileUri) {
                userFilesForDisplay.push({
                    name: part.fileData.fileUri.split('/').pop() || 'file_from_part_user',
                    type: part.fileData.mimeType || 'application/octet-stream',
                    size: 0, // Không có size từ part.fileData
                });
                hasUserFiles = true;
            } else if ('inlineData' in part && part.inlineData?.data && part.inlineData.mimeType) {
                 userFilesForDisplay.push({
                    name: `inline_from_part_user.${part.inlineData.mimeType.split('/')[1] || 'bin'}`,
                    type: part.inlineData.mimeType,
                    size: Math.round((part.inlineData.data.length * 3) / 4),
                });
                hasUserFiles = true;
            }
        });
    }


    const hasAnyFileContent = botFilesForDisplay.length > 0 || hasUserFiles;

    if (hasAnyFileContent) {
        messageType = 'multimodal';
    } else if (textContent) {
        messageType = 'text';
    }
    // Nếu không có text và không có file, messageType vẫn là 'text' (sẽ hiển thị rỗng hoặc theo action)

    let isActionDisplayable = false;
    if (backendItem.action) {
        switch (backendItem.action.type) {
            case 'openMap':
                messageType = 'map';
                isActionDisplayable = true;
                break;
            case 'itemFollowStatusUpdated':
                messageType = 'follow_update';
                isActionDisplayable = true;
                break;
            case 'displayConferenceSources': // Và các action khác có thể tự hiển thị
                isActionDisplayable = true;
                break;
        }
    }

    if (!textContent && !hasAnyFileContent && !hasDisplayablePartContent && !isActionDisplayable) {
        // console.log(`[mapBackendHistoryItemToFrontendChatMessage] ID: ${backendItem.uuid}, Role: ${backendItem.role}. No displayable content. Returning null.`);
        return null;
    }

    // console.log(`[mapBackendHistoryItemToFrontendChatMessage] ID: ${backendItem.uuid}, Role: ${backendItem.role}, Type: ${messageType}`);

    return {
        id: backendItem.uuid || generateMessageId(), // Nên luôn có uuid từ backend
        role: backendItem.role,
        parts: backendItem.parts, // Giữ parts gốc
        text: textContent,
        isUser: backendItem.role === 'user',
        type: messageType,
        timestamp: backendItem.timestamp || new Date().toISOString(),
        thoughts: backendItem.thoughts,
        files: userFilesForDisplay.length > 0 ? userFilesForDisplay : undefined,
        botFiles: botFilesForDisplay.length > 0 ? botFilesForDisplay : undefined,
        action: backendItem.action,
        sources: mapBackendSourceToFrontendSource(backendItem.sources), // <<< MAP SOURCES
        // errorCode: backendItem.errorCode, // Nếu có
        location: backendItem.action?.type === 'openMap' ? backendItem.action.location : undefined,
    };
}


export const createMessagePayloadFromResult = (
    result: ResultUpdate,
    currentThoughts?: ThoughtStep[]
): Omit<ChatMessageType, 'id' | 'isUser' | 'role' | 'timestamp'> => { // Bỏ timestamp vì sẽ được thêm khi tạo ChatMessageType
    let messageTextContent = "";
    let messageParts: AppPart[] = result.parts || []; // Sử dụng AppPart
    let messageType: MessageType = 'text';
    const botFilesForDisplay: BotFile[] = [];
    let locationData: string | undefined = undefined;
    const actionData: FrontendAction | undefined = result.action;

    if (result.message) {
        messageTextContent = result.message;
        // Nếu có result.message, ưu tiên nó làm text chính, parts có thể chứa nội dung phức tạp hơn
        if (messageParts.length === 0 || !messageParts.some(p => 'text' in p && p.text === result.message)) {
             // Nếu parts rỗng hoặc không chứa chính xác result.message, tạo text part từ result.message
            messageParts = [{ text: result.message } as GooglePart, ...messageParts.filter(p => !('text' in p))];
        }
    } else if (messageParts.length > 0) {
        messageTextContent = messageParts
            .filter(p => 'text' in p && typeof p.text === 'string')
            .map(p => (p as GooglePart).text)
            .join('\n');
    }

    let hasNonTextPartContent = false;
    messageParts.forEach(part => {
        if ('fileData' in part && part.fileData?.fileUri) {
            botFilesForDisplay.push({
                uri: part.fileData.fileUri,
                mimeType: part.fileData.mimeType || 'application/octet-stream',
                name: part.fileData.fileUri.split('/').pop() || 'file'
            });
            hasNonTextPartContent = true;
        } else if ('inlineData' in part && part.inlineData?.data && part.inlineData.mimeType) {
            botFilesForDisplay.push({
                mimeType: part.inlineData.mimeType,
                inlineData: { data: part.inlineData.data, mimeType: part.inlineData.mimeType },
                name: `inline_data.${part.inlineData.mimeType.split('/')[1] || 'bin'}`
            });
            hasNonTextPartContent = true;
        }
    });

    if (hasNonTextPartContent) {
        messageType = 'multimodal';
    } else if (messageTextContent) { // Chỉ cần có text là 'text'
        messageType = 'text';
    }
    // Nếu không có text và không có file, messageType vẫn là 'text' (sẽ hiển thị rỗng hoặc theo action)


    if (actionData) {
        switch (actionData.type) {
            case 'openMap':
                messageType = 'map';
                locationData = actionData.location;
                if (!messageTextContent) { // Chỉ thêm text mặc định nếu chưa có
                    messageTextContent = `Hiển thị bản đồ cho: ${actionData.location}`;
                    if (!messageParts.some(p => 'text' in p)) messageParts.push({ text: messageTextContent } as GooglePart);
                }
                break;
            case 'itemFollowStatusUpdated':
                messageType = 'follow_update';
                if (!messageTextContent && actionData.payload) {
                    const followPayload = actionData.payload as ItemFollowStatusUpdatePayload;
                    messageTextContent = followPayload.followed ? "Đã theo dõi mục." : "Đã bỏ theo dõi mục.";
                    if (!messageParts.some(p => 'text' in p)) messageParts.push({ text: messageTextContent } as GooglePart);
                }
                break;
            // Các action khác có thể không cần thay đổi text mặc định
            case 'confirmEmailSend':
            case 'navigate':
                if (!messageTextContent && !hasNonTextPartContent) {
                     messageTextContent = actionData.type === 'confirmEmailSend' ? 'Vui lòng xác nhận hành động.' : 'Đang điều hướng...';
                     if (!messageParts.some(p => 'text' in p)) messageParts.push({ text: messageTextContent } as GooglePart);
                }
                break;
        }
    }

    // Fallback text nếu mọi thứ đều rỗng
    if (!messageTextContent && messageParts.length === 0 && botFilesForDisplay.length === 0 && !actionData) {
        messageTextContent = "Đã nhận kết quả."; // Hoặc một tin nhắn chung chung hơn
        messageParts = [{ text: messageTextContent } as GooglePart];
    }


    const finalThoughts = (result.thoughts && result.thoughts.length > 0)
        ? result.thoughts
        : currentThoughts;

    return {
        text: messageTextContent,
        parts: messageParts, // Luôn trả về parts, có thể rỗng nếu không có gì
        thoughts: finalThoughts,
        type: messageType,
        location: locationData,
        action: actionData,
        botFiles: botFilesForDisplay.length > 0 ? botFilesForDisplay : undefined,
        sources: mapBackendSourceToFrontendSource(result.sources), // <<< MAP SOURCES
        // errorCode sẽ được xử lý riêng nếu là tin nhắn lỗi
    };
};