
// src/shared/types.ts
import { FunctionCall, Part } from "@google/generative-ai"; // Import necessary types

// Ensure HistoryItem part can hold various types
export interface HistoryItem {
    role: "user" | "model" | "function"; // Add 'function' role
    parts: Part[]; // Use the SDK's Part type directly
    // Removed 'type' field if it was specific to your old structure
}

// ChatResponse might just return the final outcome
export interface ChatResponse {
    type: "text" | "error";
    message: string;
    thought?: string; // Optional field for internal reasoning/steps
}

export interface ChatUpdate {
    type: 'partial_result'; // Hoặc 'chat_update' tùy bạn đặt tên event
    textChunk: string;
    // Tùy chọn: Gửi toàn bộ text nếu client muốn xử lý kiểu đó
    // fullText?: string;
}

// You might want an intermediate response type if handleUserInput needs more info
export interface GeminiInteractionResult {
    status: "requires_function_call" | "final_text" | "error";
    functionCall?: FunctionCall; // Present if status is 'requires_function_call'
    text?: string; // Present if status is 'final_text'
    errorMessage?: string; // Present if status is 'error'
}

// Define the structure for a single step in the thought process
export interface ThoughtStep {
    step: string;       // The identifier (e.g., 'thinking', 'function_call')
    message: string;    // The descriptive message for that step
    timestamp: string;  // ISO timestamp when the step occurred
    details?: any;      // Optional: Any extra data (like function args)
}

export interface StatusUpdate {
    type: 'status';
    step: string;
    message: string;
    details?: any; // Optional details relevant to the step (e.g., function name/args)
    thoughts?: ThoughtStep[]; // Add the thought process history

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

// --- ResultUpdate (No change needed here, already has optional 'action') ---
export interface ResultUpdate {
    type: 'result';
    message: string; // The text message to display
    thoughts?: ThoughtStep[];
    action?: FrontendAction; // Now includes NavigationAction or OpenMapAction
}

export interface ErrorUpdate {
    type: 'error';
    message: string;
    step?: string; // The step where the error might have occurred
    thought?: string; // Optional: keep if used elsewhere, or remove
    thoughts?: ThoughtStep[]; // Add the thought process history leading to the error
}




export type MessageType = 'text' | 'error' | 'warning' | 'map' | undefined; // <<< Add 'map'

export interface ChatMessageType {
    id: string;
    message: string; // Can be used as a label for the map or fallback text
    isUser: boolean;
    type: MessageType; // <<< Use the updated type
    thoughts?: ThoughtStep[];
    location?: string; // <<< ADDED: Optional location for map messages
    // Add other potential properties if needed
}


export interface LoadingState {
    isLoading: boolean;
    step: string;
    message: string;
}





// Payload for the confirmation action from backend
export interface ConfirmSendEmailAction {
    confirmationId: string;
    subject: string;
    requestType: 'contact' | 'report';
    message: string;
    timeoutMs: number;
}

// Add to FrontendAction union type
// Add the new action type to your FrontendAction union type
export type FrontendAction =
    | { type: 'navigate'; url: string }
    | { type: 'openMap'; location: string }
    | { type: 'confirmEmailSend'; payload: ConfirmSendEmailAction } // <-- Add this
    // | { type: 'otherAction'; ... } // Add other existing actions
    | undefined; // Keep undefined if it's used


// Type for the result event from backend after confirmation/cancellation/timeout
export interface EmailConfirmationResult {
    confirmationId: string;
    status: 'success' | 'cancelled' | 'timedout' | 'error';
    message: string; // Message from backend explaining the outcome
}

// Update ResultUpdate if action is part of it
export interface ResultUpdate {
    type: 'result';
    message: string; // Can be null if only action is present
    thoughts?: ThoughtStep[];
    action?: FrontendAction; // Ensure this includes the new type
}