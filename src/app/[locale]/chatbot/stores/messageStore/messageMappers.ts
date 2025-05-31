// src/app/[locale]/chatbot/stores/messageStore/messageMappers.ts
import {
    HistoryItem,
    ChatMessageType,
    ThoughtStep,
    ResultUpdate,
    FrontendAction,
    ItemFollowStatusUpdatePayload,
    UserFile,
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; 
import { generateMessageId } from '@/src/app/[locale]/chatbot/utils/chatUtils';

export function mapBackendHistoryItemToFrontendChatMessage(backendItem: HistoryItem): ChatMessageType | null { // << MODIFIED: Can return null
    console.log("[MAPPER DEBUG] Processing backendItem:", JSON.parse(JSON.stringify(backendItem)));

    let textContent = "";
    let primaryTextFromParts = "";
    const userFilesForDisplay: UserFile[] = [];
    const botFilesForDisplay: ChatMessageType['botFiles'] = [];
    let messageType: ChatMessageType['type'] = 'text'; // Default
    let hasDisplayablePartContent = false; // New flag

    if (backendItem.parts && backendItem.parts.length > 0) {
        backendItem.parts.forEach(part => {
            if (part.text) {
                primaryTextFromParts += (primaryTextFromParts ? "\n" : "") + part.text;
                hasDisplayablePartContent = true;
            } else if (backendItem.role === 'model') {
                if (part.fileData) {
                    const mimeType = part.fileData.mimeType || 'application/octet-stream';
                    if (part.fileData.fileUri) {
                        botFilesForDisplay.push({ uri: part.fileData.fileUri, mimeType: mimeType });
                        hasDisplayablePartContent = true;
                    } else {
                        console.warn(`[mapBackendHistoryItemToFrontendChatMessage] Bot message part has fileData but no fileUri. Part:`, part);
                    }
                } else if (part.inlineData && part.inlineData.data && part.inlineData.mimeType) {
                    botFilesForDisplay.push({
                        mimeType: part.inlineData.mimeType,
                        inlineData: { data: part.inlineData.data, mimeType: part.inlineData.mimeType }
                    });
                    hasDisplayablePartContent = true;
                }
                // IMPORTANT: Do not set hasDisplayablePartContent = true for functionCall or functionResponse
            } else if (backendItem.role === 'user') { // User parts can also have files
                 if (part.fileData) {
                    const uri = part.fileData.fileUri;
                    const type = part.fileData.mimeType || 'application/octet-stream';
                    if (uri) {
                        // userFilesForDisplay.push(...) // This logic is handled below with userFileInfo
                        hasDisplayablePartContent = true;
                    }
                } else if (part.inlineData) {
                    const type = part.inlineData.mimeType;
                    const data = part.inlineData.data;
                    if (type && data) {
                        // userFilesForDisplay.push(...) // This logic is handled below with userFileInfo
                        hasDisplayablePartContent = true;
                    }
                }
            }
        });
    }
    textContent = primaryTextFromParts;

    let hasUserFiles = false;
    if (backendItem.role === 'user' && backendItem.userFileInfo && backendItem.userFileInfo.length > 0) {
        backendItem.userFileInfo.forEach(info => {
            userFilesForDisplay.push({
                name: info.name,
                type: info.type,
                size: info.size,
            });
        });
        if (userFilesForDisplay.length > 0) {
            hasUserFiles = true;
        }
    }
    // Fallback for user files from parts if userFileInfo is not present
    else if (backendItem.role === 'user' && backendItem.parts?.some(p => p.fileData || p.inlineData)) {
        backendItem.parts.forEach(part => {
            if (part.fileData) {
                const uri = part.fileData.fileUri;
                const type = part.fileData.mimeType || 'application/octet-stream';
                if (uri) {
                    userFilesForDisplay.push({
                        name: uri.split('/').pop() || 'file_from_part_user',
                        type: type,
                        size: 0, // Size might not be available from part.fileData
                    });
                    hasUserFiles = true;
                } else {
                    console.warn(`[mapBackendHistoryItemToFrontendChatMessage] User message part has fileData but no fileUri. Part:`, part);
                }
            } else if (part.inlineData) {
                const type = part.inlineData.mimeType;
                const data = part.inlineData.data;
                if (type && data) {
                    userFilesForDisplay.push({
                        name: `inline_from_part_user.${type.split('/')[1] || 'bin'}`,
                        type: type,
                        size: Math.round((data.length * 3) / 4), // Approximate size
                    });
                    hasUserFiles = true;
                } else {
                    console.warn(`[mapBackendHistoryItemToFrontendChatMessage] User message part has inlineData but missing mimeType or data. Part:`, part);
                }
            }
        });
    }


    const hasAnyFileContent = botFilesForDisplay.length > 0 || hasUserFiles;

    // Determine messageType
    if (hasAnyFileContent) {
        messageType = 'multimodal';
    } else if (textContent) {
        messageType = 'text';
    } else {
        // If no text and no files, it might be a function call/response or an empty message.
        // The `hasDisplayablePartContent` helps differentiate.
        // If it only had functionCall/Response, hasDisplayablePartContent would be false.
        messageType = 'text'; // Keep as text, MessageContentRenderer will handle emptiness
    }

    // Override messageType for specific actions
    let isActionDisplayable = false;
    if (backendItem.action?.type === 'openMap') {
        messageType = 'map';
        isActionDisplayable = true;
    } else if (backendItem.action?.type === 'itemFollowStatusUpdated') {
        messageType = 'follow_update';
        isActionDisplayable = true;
    } else if (backendItem.action?.type === 'displayConferenceSources') {
        // This action itself makes the message displayable, even if text/files are empty
        isActionDisplayable = true;
        // messageType might remain 'text' or 'multimodal' if other content exists
    }

    // --- CRITICAL CHECK ---
    // If there's no text content, no file content from any source,
    // no displayable content derived from parts (e.g. text, fileData, inlineData),
    // AND no specific displayable action, then this message should not be rendered.
    if (!textContent && !hasAnyFileContent && !hasDisplayablePartContent && !isActionDisplayable) {
        // This primarily targets messages that *only* contain functionCall or functionResponse parts.
        // Also, if a 'model' role message has parts but none are text/fileData/inlineData.
        console.log(`[mapBackendHistoryItemToFrontendChatMessage] ID: ${backendItem.uuid}, Role: ${backendItem.role}. No displayable content (text, files, or displayable parts/actions). Returning null.`);
        return null; // << DO NOT CREATE A CHAT MESSAGE OBJECT
    }


    console.log(`[mapBackendHistoryItemToFrontendChatMessage] ID: ${backendItem.uuid}, Role: ${backendItem.role}`);
    console.log(`  Parts received:`, backendItem.parts);
    console.log(`  UserFileInfo received:`, backendItem.userFileInfo);
    console.log(`  TextContent derived: "${textContent}"`);
    console.log(`  UserFilesForDisplay:`, userFilesForDisplay);
    console.log(`  BotFilesForDisplay:`, botFilesForDisplay);
    console.log(`  HasDisplayablePartContent: ${hasDisplayablePartContent}`);
    console.log(`  HasAnyFileContent: ${hasAnyFileContent}`);
    console.log(`  IsActionDisplayable: ${isActionDisplayable}`);
    console.log(`  Final MessageType: ${messageType}`);

    return {
        id: backendItem.uuid || generateMessageId(),
        role: backendItem.role,
        parts: backendItem.parts, // Keep original parts for MessageContentRenderer if it needs to inspect them
        text: textContent,
        isUser: backendItem.role === 'user',
        type: messageType,
        timestamp: backendItem.timestamp || new Date().toISOString(),
        thoughts: backendItem.thoughts,
        files: userFilesForDisplay.length > 0 ? userFilesForDisplay : undefined,
        botFiles: botFilesForDisplay.length > 0 ? botFilesForDisplay : undefined,
        action: backendItem.action,
    };
}


// Extracted from _onSocketChatResult
export const createMessagePayloadFromResult = (
    result: ResultUpdate,
    currentThoughts?: ThoughtStep[]
): Omit<ChatMessageType, 'id' | 'isUser' | 'role'> => {
    let messageTextContent = "";
    let messageParts = result.parts || [];
    let messageType: ChatMessageType['type'] = 'text';
    let botFilesForDisplay: ChatMessageType['botFiles'] = [];
    let locationData: string | undefined = undefined;
    const actionData: FrontendAction | undefined = result.action;

    if (result.message) {
        messageTextContent = result.message;
        if (messageParts.length === 0) messageParts = [{ text: result.message }];
    } else if (messageParts.length > 0) {
        messageTextContent = messageParts.filter(p => p.text).map(p => p.text).join('\n');
    } else {
        messageTextContent = "Result received."; // Fallback
        messageParts = [{ text: messageTextContent }];
    }

    let hasNonTextPart = false;
    messageParts.forEach(part => {
        if (part.fileData) {
            const mimeType = part.fileData.mimeType || 'application/octet-stream';
            if (part.fileData.fileUri) { // Ensure fileUri exists
                botFilesForDisplay.push({ uri: part.fileData.fileUri, mimeType: mimeType });
                hasNonTextPart = true;
            } else {
                 console.warn("[MessageStore createMessagePayloadFromResult] Received fileData part missing fileUri:", part.fileData);
            }
        } else if (part.inlineData) {
            if (part.inlineData.data && part.inlineData.mimeType) {
                botFilesForDisplay.push({
                    mimeType: part.inlineData.mimeType,
                    inlineData: { data: part.inlineData.data, mimeType: part.inlineData.mimeType }
                });
                hasNonTextPart = true;
            } else { console.warn("[MessageStore createMessagePayloadFromResult] Received inlineData part missing essential data or mimeType:", part.inlineData); }
        }
    });

    if (hasNonTextPart) messageType = 'multimodal';
    else if (messageParts.every(p => p.text) && messageParts.length > 0) messageType = 'text';


    if (actionData?.type === 'openMap' && actionData.location) {
        messageType = 'map';
        locationData = actionData.location;
        if (!result.message && !messageParts.some(p => p.text)) {
            messageTextContent = `Showing map for: ${actionData.location}`;
            messageParts = [{ text: messageTextContent }];
        }
    } else if (actionData?.type === 'itemFollowStatusUpdated') {
        messageType = 'follow_update';
        if (!result.message && !messageParts.some(p => p.text) && actionData.payload) {
            const followPayload = actionData.payload as ItemFollowStatusUpdatePayload;
            messageTextContent = followPayload.followed ? "Item followed." : "Item unfollowed.";
            messageParts = [{ text: messageTextContent }];
        }
    } else if (actionData?.type === 'confirmEmailSend') {
        if (!result.message && !messageParts.some(p => p.text)) {
            messageTextContent = 'Please confirm the action.';
            messageParts = [{ text: messageTextContent }];
        }
    } else if (actionData?.type === 'navigate' && (!result.message && !messageParts.some(p => p.text))) {
        messageTextContent = `Okay, navigating...`;
        messageParts = [{ text: messageTextContent }];
    }

    if (!messageTextContent && messageParts.length === 0 && botFilesForDisplay.length > 0) {
        messageTextContent = `${botFilesForDisplay.length} file(s) received.`;
    } else if (!messageTextContent && messageParts.length === 0 && !actionData && botFilesForDisplay.length === 0) {
        messageTextContent = "Result received.";
        messageParts = [{ text: messageTextContent }];
    }

    const finalThoughts = (result.thoughts && result.thoughts.length > 0)
        ? result.thoughts
        : currentThoughts;

    return {
        text: messageTextContent,
        parts: messageParts,
        thoughts: finalThoughts,
        type: messageType,
        location: locationData,
        action: actionData,
        timestamp: new Date().toISOString(),
        botFiles: botFilesForDisplay.length > 0 ? botFilesForDisplay : undefined,
    };
};