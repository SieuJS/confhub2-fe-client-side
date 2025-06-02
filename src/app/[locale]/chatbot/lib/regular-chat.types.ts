// src/app/[locale]/chatbot/lib/regular-chat.types.ts
import { FunctionCall, Part as GooglePart } from "@google/genai"; // Đổi tên Part thành GooglePart để tránh nhầm lẫn

// --- Core Data Structures ---

/**
 * Represents a file uploaded by the user, primarily for UI display and initial sending.
 */
export interface UserFile {
  name: string;
  type: string;
  size: number;
  dataUrl?: string; // For client-side preview (blob or base64 URL)
  // googleFileUri?: string; // Có thể thêm nếu muốn giữ tham chiếu đến URI sau khi upload thành công ở client
}

/**
 * Represents a file sent by the bot, for UI display.
 */
export interface BotFile {
  uri?: string; // URI if it's a file from Google File API or external link
  inlineData?: { mimeType: string; data: string }; // Base64 data for inline content
  mimeType: string; // Always present
  name?: string; // Optional: A display name for the bot's file
}

/**
 * Stores original information about a user-uploaded file, sent to backend for persistence.
 */
export interface OriginalUserFileInfo {
  name: string;        // Original file name
  size: number;        // Original file size in bytes
  type: string;        // Original MIME type
  googleFileUri: string; // The URI returned by Google File API after upload
}

/**
 * Represents a single part of a message, aligned with Google's SDK Part,
 * but potentially extended if absolutely necessary (though generally avoided).
 * Hiện tại, chúng ta sẽ sử dụng trực tiếp GooglePart.
 */
export type AppPart = GooglePart; // Sử dụng trực tiếp type từ SDK

/**
 * Structure for an item in the conversation history (stored in backend, sent to frontend).
 */
export interface HistoryItem {
  role: "user" | "model" | "function";
  parts: AppPart[]; // Parts theo định nghĩa của Google SDK
  timestamp?: string | Date;
  uuid: string; // Unique ID for the message (frontend generated for user, backend for model)

  thoughts?: ThoughtStep[]; // Optional: Model's thought process
  action?: FrontendAction;  // Optional: Action requested by the model
  // Thông tin file gốc của người dùng, chỉ có ý nghĩa với role: 'user'
  userFileInfo?: OriginalUserFileInfo[];
  sources?: SourceItem[]; // <<< THÊM MỚI: Chỉ cho role 'model'
}


/**
 * Structure for a message displayed in the chat UI (Frontend).
 */
export interface ChatMessageType {
  id: string; // uuid từ HistoryItem
  role: "user" | "model" | "function";
  parts: AppPart[]; // Parts gốc từ HistoryItem, dùng cho MessageContentRenderer
  text?: string;    // Text chính của tin nhắn, có thể được trích xuất từ parts
  isUser: boolean; // Suy ra từ role
  type: MessageType; // Loại tin nhắn để render UI (text, multimodal, map, error, etc.)
  timestamp?: string | Date;
  thoughts?: ThoughtStep[];
  action?: FrontendAction;
  location?: string; // Dùng cho 'map' type
  errorCode?: string; // Dùng cho 'error'/'warning' type

  // Files cụ thể cho hiển thị, được map từ HistoryItem
  files?: UserFile[]; // Files do người dùng gửi (map từ userFileInfo hoặc parts nếu là user)
  botFiles?: BotFile[]; // Files do bot gửi (map từ parts nếu là model)
  sources?: SourceItem[]; // <<< THÊM MỚI

}



// --- Socket Payloads ---

/**
 * Payload for sending a new message from frontend to backend.
 */
export interface SendMessageData {
  parts: AppPart[]; // Nội dung chính của tin nhắn
  isStreaming?: boolean;
  language: LanguageCode; // Sử dụng LanguageCode đã định nghĩa
  conversationId?: string | null;
  frontendMessageId: string; // ID do frontend tạo cho tin nhắn user
  personalizationData?: PersonalizationPayload | null;
  originalUserFiles?: OriginalUserFileInfo[]; // Thông tin file gốc của user
  pageContextUrl?: string; // <<< THÊM MỚI
  model?: string; // <<< THÊM TRƯỜNG MODEL (string là giá trị value của model)


}

// Định nghĩa cấu trúc cho source item
export interface SourceItem {
  name: string; // Tên hiển thị của source (ví dụ: domain name)
  url: string;  // URL đầy đủ
  type?: 'page_context' | 'web_search' | 'document' | string; // Loại source (tùy chọn)
}

/**
 * Payload for the 'initial_history' event from backend to frontend.
 */
export interface InitialHistoryPayload {
  conversationId: string;
  messages: HistoryItem[]; // Backend gửi HistoryItem[], frontend store sẽ map sang ChatMessageType[]
}

/**
 * Payload for editing a user message, sent from frontend to backend.
 */
export interface EditUserMessagePayload {
  conversationId: string;
  messageIdToEdit: string; // UUID của tin nhắn user cần sửa
  newText: string;
  language: LanguageCode;
  personalizationData?: PersonalizationPayload | null;
}


/**
 * Payload sent from backend to frontend after a user message is edited and AI responds.
 */
export interface BackendConversationUpdatedAfterEditPayload {
  editedUserMessage: HistoryItem; // Tin nhắn user đã được cập nhật (từ DB)
  newBotMessage: HistoryItem;     // Phản hồi mới từ bot (từ DB)
  conversationId: string;
}


/**
 * Represents a chunk of text/data sent from backend during streaming.
 */
export interface ChatUpdate {
  type: 'partial_result';
  textChunk?: string; // Ưu tiên textChunk cho streaming text
  parts?: AppPart[];  // Dùng cho streaming non-text parts (ít phổ biến hơn)
  thoughts?: ThoughtStep[]; // Có thể stream cả thoughts
}

/**
 * Represents the final result of a bot's turn.
 */
export interface ResultUpdate {
  type: 'result';
  id?: string; // ID cuối cùng của tin nhắn bot từ backend (quan trọng)
  message?: string; // Text tổng hợp cuối cùng (có thể không có nếu chỉ có parts phức tạp)
  parts?: AppPart[]; // Parts đầy đủ cuối cùng từ model
  thoughts?: ThoughtStep[];
  action?: FrontendAction;
  sources?: SourceItem[];
}



/**
 * Represents an error or warning from the backend.
 */
export interface ErrorUpdate {
  type: 'error' | 'warning';
  message: string;
  step?: string;
  code?: string;
  details?: any;
  thoughts?: ThoughtStep[];
}

/**
 * Represents a status update from the backend during processing.
 */
export interface StatusUpdate {
  type: 'status';
  step: string; // Bước xử lý hiện tại ở backend
  message: string; // Mô tả cho bước đó
  details?: any;
  thoughts?: ThoughtStep[];
  agentId?: AgentId;
}



// --- UI & Helper Types ---

export type MessageType = 'text' | 'error' | 'warning' | 'map' | 'follow_update' | 'multimodal';

export interface ThoughtStep {
  step: string;
  message: string;
  timestamp: string;
  details?: any;
  agentId?: AgentId;
}


export type AgentId = 'HostAgent' | 'ConferenceAgent' | 'JournalAgent' | 'AdminContactAgent' | 'NavigationAgent' | 'WebsiteInfoAgent' | string;

export interface LoadingState {
  isLoading: boolean;
  step: string;
  message: string;
  agentId?: AgentId; // Đổi string thành AgentId
}

// Define the structure for a single step in the thought process
export interface ThoughtStep {
  step: string;       // The identifier (e.g., 'thinking', 'function_call')
  message: string;    // The descriptive message for that step
  timestamp: string;  // ISO timestamp when the step occurred
  details?: any;      // Optional: Any extra data (like function args)
  agentId?: AgentId; // <<< THÊM HOẶC ĐẢM BẢO CÓ TRƯỜNG NÀY

}


// --- Define Action Types ---
export interface NavigationAction {
  type: 'navigate';
  url: string; // The URL (internal path or full external URL)
}

// <<< NEW: Define OpenMapAction >>>
export interface OpenMapAction {
  type: 'openMap';
  location: string; // The location string to search on Google Maps
}

/**
 * Payload for the 'displayList' frontend action.
 */
export interface DisplayListPayload {
  items: any[]; // Array of items to display (e.g., FollowItem[], CalendarItem[])
  // Using 'any[]' for now for flexibility, but ideally should be more specific
  // like (FollowItem[] | CalendarItem[])
  itemType: 'conference' | 'journal'; // Type of items in the list
  listType: 'followed' | 'calendar' | string; // Describes the nature of the list
  title?: string; // Optional title for the list display
}

/**
 * Payload for the 'addToCalendar' frontend action.
 * Details needed to create a calendar event.
 */
export interface AddToCalendarPayload {
  conferenceId: string;
  // conferenceDetails should contain all necessary info for a calendar event
  // This structure should align with what your calendar integration needs
  conferenceDetails: {
    id: string;
    title: string;
    acronym?: string;
    startDate?: string; // ISO string
    endDate?: string;   // ISO string
    startTime?: string; // e.g., "10:00" (optional, if not part of startDate)
    endTime?: string;   // e.g., "18:00" (optional, if not part of endDate)
    timezone?: string;  // e.g., "America/New_York" (optional)
    location?: string;  // Text description of location
    description?: string; // Summary or details of the conference
    url?: string; // Link to the conference website
    // Add any other fields your calendar event creation requires
  };
}

/**
 * Payload for the 'removeFromCalendar' frontend action.
 */
export interface RemoveFromCalendarPayload {
  conferenceId: string;
  // Optionally, you might need more details to uniquely identify the event
  // in the user's calendar if conferenceId alone isn't sufficient,
  // e.g., a specific event ID from the calendar provider.
  calendarEventId?: string;
}

// --- Updated FrontendAction type ---

/** Defines the types of actions the backend can request the frontend to perform. */
export type FrontendAction =
  | { type: 'navigate'; url: string }
  | { type: 'openMap'; location: string }
  | { type: 'confirmEmailSend'; payload: ConfirmSendEmailAction } // Assuming ConfirmSendEmailAction is defined elsewhere
  | { type: 'displayList'; payload: DisplayListPayload }
  | { type: 'displayConferenceSources'; payload: DisplayConferenceSourcesPayload } // <<< ACTION MỚI
  | { type: 'addToCalendar'; payload: AddToCalendarPayload }
  | { type: 'removeFromCalendar'; payload: RemoveFromCalendarPayload }
  | { type: 'itemFollowStatusUpdated'; payload: ItemFollowStatusUpdatePayload } // Added new action
  | undefined; // Allows for no action

// Type for the result event from backend after confirmation/cancellation/timeout




export interface FollowItemDate {
  fromDate: string; // ISO Date string
  toDate: string;   // ISO Date string
}

export interface FollowItemLocation {
  address?: string;
  cityStateProvince?: string;
  country?: string;
  continent?: string;
}

export interface FollowItem {
  id: string;
  title: string; // Sử dụng title thay vì name nếu API trả về title
  acronym: string;
  followedAt?: string; // ISO Date string, optional if not always present
  updatedAt?: string;  // ISO Date string, optional
  status?: string;     // Optional
  dates?: FollowItemDate; // Optional
  location?: FollowItemLocation; // Optional
  // Thêm các trường khác nếu cần từ API
  // Ví dụ: nếu là journal, có thể có 'publisher', 'issn', etc.
  // Nếu là conference, có thể có 'websiteUrl', 'submissionDeadline' etc.
  // Hiện tại, chúng ta sẽ giữ các trường chung nhất từ ví dụ của bạn.
}





/**
 * Payload for the 'itemFollowStatusUpdated' frontend action.
 * Contains details of the item whose follow status changed.
 */
export interface ItemFollowStatusUpdatePayload {
  item: FollowItem; // The item whose follow status was updated
  itemType: 'conference' | 'journal';
  followed: boolean; // true if the item is now followed (after a 'follow' action),
  // false if the item is now unfollowed (after an 'unfollow' action)
}



export interface CalendarItem {
  conferenceId: string;
  conference: string; // Sử dụng title thay vì name nếu API trả về title
  acronym?: string;
  followedAt?: string; // ISO Date string, optional if not always present
  updatedAt?: string;  // ISO Date string, optional
  status?: string;     // Optional
  dates?: FollowItemDate; // Optional
  location?: FollowItemLocation; // Optional
  // Thêm các trường khác nếu cần từ API
  // Ví dụ: nếu là journal, có thể có 'publisher', 'issn', etc.
  // Nếu là conference, có thể có 'websiteUrl', 'submissionDeadline' etc.
  // Hiện tại, chúng ta sẽ giữ các trường chung nhất từ ví dụ của bạn.
}


// Payload for the confirmation action from backend
export interface ConfirmSendEmailAction {
  confirmationId: string;
  subject: string;
  requestType: 'contact' | 'report';
  message: string;
  timeoutMs: number;
}
export interface EmailConfirmationResult {
  confirmationId: string;
  status: 'success' | 'cancelled' | 'timedout' | 'error';
  message: string; // Message from backend explaining the outcome
}



// Định nghĩa payload cho action hiển thị nguồn hội nghị
export interface DisplayConferenceSourcesPayload {
  conferences: Array<{
    id: string;
    title: string;
    acronym?: string; // Tên viết tắt có thể không có
    rank?: string;    // Rank có thể không có hoặc là 'N/A'
    source?: string;  // Nguồn rank
    conferenceDates?: string; // Chuỗi ngày đã được format, ví dụ: "May 10 - 12, 2024"
    location?: string; // Chuỗi địa điểm đã được format
    // Thêm các trường khác nếu bạn muốn hiển thị trên card ở frontend
  }>;
  title?: string; // Tiêu đề cho phần hiển thị này, ví dụ: "Conferences Found"
}


/**
 * Payload for the result of a confirmation action (sent FROM backend TO frontend).
 * Informs the client about the outcome of a 'confirmEmailSend' or similar action.
 */
export interface ConfirmationResultPayload {
  confirmationId: string; // The ID of the original confirmation request
  status:
  | 'confirmed'      // User confirmed, action likely succeeded (e.g., email sent)
  | 'cancelled'      // User cancelled the action
  | 'timeout'        // The confirmation request timed out before user interaction
  | 'not_found'      // The confirmation ID was not found (already processed or invalid)
  | 'failed'         // User confirmed, but the action failed (e.g., email sending error)
  | 'unauthorized'   // The user trying to confirm/cancel was not the original requester
  | 'error';         // Generic error processing the confirmation/cancellation
  message: string;       // A user-friendly message describing the outcome
  details?: any;         // Optional: Additional details (e.g., error specifics if status is 'failed' or 'error')
}



export type ChatMode = 'live' | 'regular';
export type LanguageCode = 'en' | 'vi' | 'zh' | 'de' | 'fr' | 'es' | 'ru' | 'ja' | 'ko' | 'ar';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  flagCode: string;
}



// --- Payload Types for New Events ---
export interface ConversationDeletedPayload {
  conversationId: string;
}

export interface ConversationClearedPayload {
  conversationId: string;
}
export interface ConversationRenamedPayload {
  conversationId: string;
  newTitle: string; // Tiêu đề đã được chuẩn hóa bởi backend
}

export interface ConversationPinStatusChangedPayload {
  conversationId: string;
  isPinned: boolean;
}

// --- Payload Types for Emitting New Events to Backend ---
export interface RenameConversationClientData {
  conversationId: string;
  newTitle: string;
}

export interface PinConversationClientData {
  conversationId: string;
  isPinned: boolean;
}

export interface SearchConversationsClientData {
  searchTerm: string;
  limit?: number;
}

// --- Conversation Metadata (đảm bảo có các trường cần thiết) ---
// Nếu bạn đã có ClientConversationMetadata, hãy đảm bảo nó có các trường này
export interface ConversationMetadata { // Hoặc ClientConversationMetadata
  id: string;
  title: string;       // Sẽ là customTitle nếu có, nếu không là auto-generated
  lastActivity: string | Date;  // Hoặc string nếu bạn parse ở client
  isPinned: boolean;
  // customTitle?: string; // Tùy chọn: Client có thể muốn biết đây là custom title hay không
  // snippet?: string; // Cho kết quả tìm kiếm
}


export interface PersonalizationPayload {
  firstName?: string;
  lastName?: string;
  aboutMe?: string;
  interestedTopics?: string[];
}




export interface SendMessagePayload { // This is for socketStore, might need adjustment
  // userInput: string; // OLD
  parts: GooglePart[]; // <<< NEW: The actual content to send to the model
  isStreaming: boolean;
  language: string;
  conversationId: string | null;
  frontendMessageId: string; // ID of the user's message in the UI
  personalizationData?: PersonalizationPayload | null;
}

// Add to your backend shared types as well (e.g., src/chatbot/shared/types.ts)
// Assuming ChatMessage type on backend is similar or can be mapped from Frontend's ChatMessageType
export interface BackendEditUserMessagePayload {
  conversationId: string;
  messageIdToEdit: string;
  newText: string;
  language: string;
}
