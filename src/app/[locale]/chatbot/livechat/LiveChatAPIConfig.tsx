// // src/app/[locale]/chatbot/LiveChatAPIConfig.tsx
// "use client";
// import { useEffect, memo, useCallback } from "react";
// import { usePathname } from 'next/navigation';

// // --- Import Namespace for LiveChat specific items ---
// import * as LiveChat from '@/src/app/[locale]/chatbot/livechat/index';

// // --- Import types chung và config ---
// import { OutputModality, PrebuiltVoice, Language, ToolCall } from '@/src/app/[locale]/chatbot/lib/live-chat.types';
// import { transformConferenceData } from './utils/transformApiData'; // Giả sử giữ lại helper này
// import { appConfig } from "@/src/middleware"; // Giả sử giữ lại config này

// // --- !!! Import hàm và type cấu hình TẬP TRUNG !!! ---
// // !!! Đảm bảo đường dẫn này chính xác tới file languageConfig.ts của bạn !!!
// import { getAgentLanguageConfig, AgentId } from '@/src/app/[locale]/chatbot/utils/languageConfig';

// // --- KHÔNG cần import trực tiếp function/instruction nữa ---
// // import { EN_routeToAgentDeclaration, EN_hostAgentSystemInstructions } from './lib/functionDeclarations';

// // --- Types cho Tool Call Handling (giữ nguyên) ---
// interface RouteToAgentArgs { targetAgent: AgentId; taskDescription: string; inputData?: Record<string, any> | string; }
// interface ConferenceAgentInput { searchQuery?: string; }
// interface JournalAgentInput { searchQuery?: string; }
// interface NavigationAgentInput { url: string; }
// // interface WebsiteInfoInput { /*...*/ }
// interface OriginalLiveChatResponseFormat { response: { content: any; }; id: string; }
// interface ErrorPayload { type: "error"; message: string; }

// // --- Props Interface (Không cần hostAgentSystemInstructions) ---
// interface LiveChatAPIConfigProps {
//   outputModality: OutputModality;
//   selectedVoice: PrebuiltVoice;
//   language: Language; // Vẫn cần ngôn ngữ để chọn config phù hợp
// }

// function LiveChatAPI({ outputModality, selectedVoice, language }: LiveChatAPIConfigProps) {
//   const { client, setConfig } = LiveChat.useLiveAPIContext();
//   const pathname = usePathname();
//   const currentLocale = pathname.split('/')[1] as Language;

//   // --- Effect 1: Configure API Client using Central Config ---
//   useEffect(() => {
//     // Xác định ngôn ngữ và agent ID
//     // const activeLanguage = currentLocale || language;
//     const agentId: AgentId = 'HostAgent'; // Component này luôn là HostAgent

//     console.log(`[LiveChatAPIConfig] Configuring API as ${agentId} for: Modality=${outputModality}, Voice=${selectedVoice}, Language=${language}`);

//     // --- Lấy cấu hình (instructions & functions) từ hàm tập trung ---
//     const agentConfig = getAgentLanguageConfig(language, agentId);
//     const { systemInstructions, functionDeclarations } = agentConfig;

//     if (!systemInstructions || systemInstructions.startsWith("Error:")) {
//         console.error(`[LiveChatAPIConfig] Failed to get valid system instructions for ${agentId}/${language}. Using fallback.`);
//         // Cung cấp fallback cứng nếu cần, hoặc dựa vào fallback trong getAgentLanguageConfig
//     }
//      if (!functionDeclarations || functionDeclarations.length === 0) {
//         console.warn(`[LiveChatAPIConfig] No function declarations found for ${agentId}/${language}. Tools might not work.`);
//     }

//     console.log(`[LiveChatAPIConfig] Using instructions for ${agentId}/${language}:`, systemInstructions);
//     console.log(`[LiveChatAPIConfig] Using functions for ${agentId}/${language}:`, functionDeclarations);

//     // --- Cấu hình API Client ---
//     const modalitiesConfig = outputModality === 'audio' ? ["AUDIO"] : ["TEXT"];
//     const generationConfig: any = { responseModalities: modalitiesConfig };
//     if (outputModality === 'audio') {
//       generationConfig.speechConfig = { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } };
//     }

//     // --- Tạo config cuối cùng ---
//     const finalConfig = {
//       model: "models/gemini-2.0-flash-live-001", // Hoặc model bạn dùng
//       generationConfig: generationConfig,
//       systemInstruction: { parts: [{ text: systemInstructions }] }, // <-- Sử dụng instruction lấy được
//       tools: functionDeclarations && functionDeclarations.length > 0
//              ? [{ functionDeclarations: functionDeclarations }]
//              : undefined, // <-- Sử dụng functions lấy được
//     };

//     console.log("[LiveChatAPIConfig] Setting final Host Agent config:", JSON.stringify(finalConfig, null, 2));
//     setConfig(finalConfig);

//     // Dependencies: Các giá trị ảnh hưởng đến việc lấy config hoặc cấu hình client
//   }, [setConfig, outputModality, selectedVoice, language, currentLocale, getAgentLanguageConfig]);


//   // --- Effect 2: Handle Tool Calls (Logic xử lý tool call giữ nguyên) ---
//   const handleToolCall = useCallback(async (toolCall: ToolCall) => {
//     console.log(`[LiveChatAPIConfig] Host Agent received toolcall:`, toolCall);
//     const NEXT_PUBLIC_DATABASE_URL = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1` || "http://confhub.engineer/api/v1";
//     const NEXT_PUBLIC_FRONTEND_URL = typeof window !== 'undefined' ? window.location.origin : "http://localhost:8386"; // Lấy origin động
//     const responses: OriginalLiveChatResponseFormat[] = [];
//     const activeLanguage = currentLocale || language; // Ngôn ngữ dùng cho navigation URL

//     for (const fc of toolCall.functionCalls) {
//       let responseContentPart: any;
//       try {
//         // Chỉ xử lý routeToAgent vì đây là HostAgent
//         if (fc.name === 'routeToAgent') {
//           const args = fc.args as RouteToAgentArgs;
//           const targetAgent = args?.targetAgent;
//           const taskDescription = args?.taskDescription;

//           if (!targetAgent) throw new Error("Missing 'targetAgent' in routeToAgent arguments.");
//           console.log(`[LiveChatAPIConfig] Routing task "${taskDescription || '(no description)'}" to ${targetAgent}`);

//           let resultData: any = null;
//           let errorMessage: string | undefined = undefined;

//           // --- Mô phỏng thực thi Sub Agent (logic này giữ nguyên) ---
//           switch (targetAgent) {
//             case 'ConferenceAgent': {
//               console.log(`Simulating ConferenceAgent: Fetching conferences.`);
//               const searchQuery = conferenceInput?.searchQuery;
//               const url = new URL(`${NEXT_PUBLIC_DATABASE_URL}/conference`);
//               if (searchQuery) url.searchParams.append('searchQuery', searchQuery);
//               const finalUrl = url.toString();
//               console.log(`ConferenceAgent API Call URL: ${finalUrl}`);
//               const apiResponse = await fetch(finalUrl);
//               if (!apiResponse.ok) throw new Error(`API Error (${apiResponse.status}) for ${targetAgent}: ${(await apiResponse.text()).substring(0, 200)}`);
//               const rawData = await apiResponse.json();
//               resultData = transformConferenceData(rawData, searchQuery); // Giữ lại transform nếu cần
//               console.log(`ConferenceAgent simulation result size: ${resultData?.conferences?.length || 0} items`);
//               break;
//             }
//              case 'JournalAgent': {
//                 console.log(`Simulating JournalAgent: Fetching journals.`);
//                 const journalInput = inputData as JournalAgentInput;
//                 const searchQuery = journalInput?.searchQuery;
//                 const url = new URL(`${NEXT_PUBLIC_DATABASE_URL}/journal`);
//                 if (searchQuery) url.searchParams.append('searchQuery', searchQuery);
//                 const finalUrl = url.toString();
//                  console.log(`JournalAgent API Call URL: ${finalUrl}`);
//                 const apiResponse = await fetch(finalUrl);
//                  if (!apiResponse.ok) throw new Error(`API Error (${apiResponse.status}) for ${targetAgent}: ${(await apiResponse.text()).substring(0, 200)}`);
//                 resultData = await apiResponse.json(); // Giả sử không cần transform
//                 console.log(`JournalAgent simulation result:`, resultData); // Log kết quả
//                 break;
//              }
//             case 'NavigationAgent': {
//               console.log(`Simulating NavigationAgent: Performing navigation.`);
//               const navInput = inputData as NavigationAgentInput;
//               const targetUrl = navInput?.url;
//               if (!targetUrl || typeof targetUrl !== 'string') throw new Error("Missing or invalid 'url' in inputData for NavigationAgent.");
//               let urlToOpen: string, navMsg: string;
//               if (targetUrl.startsWith('/')) {
//                 const langPrefix = language && ['en', 'vi', 'zh'].includes(language) ? `/${language}` : '/en'; // Default locale
//                 urlToOpen = `${NEXT_PUBLIC_FRONTEND_URL}${langPrefix}${targetUrl}`;
//                 navMsg = `Okay, navigating to internal page: ${targetUrl}`;
//               } else if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
//                 urlToOpen = targetUrl;
//                 navMsg = `Okay, opening external link: ${targetUrl}`;
//               } else {
//                 throw new Error(`Invalid 'url' format: ${targetUrl}. Must start with '/' or 'http(s)://'.`);
//               }
//               if (typeof window !== 'undefined') {
//                 console.log(`Opening URL in new tab: ${urlToOpen}`);
//                 window.open(urlToOpen, '_blank', 'noopener,noreferrer');
//                 resultData = { status: 'success', message: navMsg, urlOpened: urlToOpen };
//               } else {
//                  console.warn("window object not available, cannot open new tab.");
//                 resultData = { status: 'skipped', message: `Navigation requested for ${urlToOpen}, but cannot open tab.` };
//               }
//               break;
//             }
//             case 'WebsiteInfoAgent': // Thêm các agent khác nếu cần
//             case 'AdminContactAgent':
//               console.log(`Simulating ${targetAgent}.`);
//               resultData = { status: 'acknowledged', message: `Received request for ${targetAgent}. Task: "${taskDescription || 'N/A'}".`, inputReceived: inputData };
//               console.log(`${targetAgent} simulation result:`, resultData);
//               break;
//             default:
//               const unknownAgent: string = targetAgent;
//               errorMessage = `Unsupported targetAgent: '${unknownAgent}'.`;
//               console.warn(errorMessage);
//               break;
//           }
//           // --- Kết thúc mô phỏng ---

//           if (errorMessage) throw new Error(errorMessage);
//           responseContentPart = resultData;

//         } else {
//           // Xử lý function call không mong muốn (chỉ mong đợi routeToAgent)
//            console.warn(`[LiveChatAPIConfig] Host Agent received unexpected function call: ${fc.name}.`);
//            throw new Error(`Error: Host Agent received unexpected function call '${fc.name}'. Expected 'routeToAgent'.`);
//         }

//         // Push kết quả thành công
//         responses.push({ response: { content: responseContentPart }, id: fc.id });

//       } catch (error: any) {
//         console.error(`[LiveChatAPIConfig] Error processing function call ${fc.name} (Target: ${(fc.args as any)?.targetAgent || 'N/A'}):`, error);
//         let errMsg = error.message || "An unexpected error occurred.";
//         const errorPayload: ErrorPayload = { type: "error", message: `Failed execution for ${fc.name}: ${errMsg.substring(0, 300)}` };
//         // Push cấu trúc lỗi
//         responses.push({ response: { content: errorPayload }, id: fc.id });
//       }
//     } // End for loop

//     if (responses.length > 0) {
//       console.log("[LiveChatAPIConfig] Sending tool responses back:", JSON.stringify(responses, null, 2));
//       client.sendToolResponse({ functionResponses: responses });
//     } else {
//       console.log("[LiveChatAPIConfig] No responses generated for tool call batch.");
//     }
//     // Dependencies cho useCallback: những giá trị bên ngoài mà hàm này sử dụng
//   }, [client, currentLocale, language, transformConferenceData, getAgentLanguageConfig]); // Thêm getAgentLanguageConfig nếu nó thay đổi config tool call


//   // Effect 3: Hook Registration (Không đổi)
//   useEffect(() => {
//     client.on("toolcall", handleToolCall);
//     console.log("[LiveChatAPIConfig] Tool call handler registered.");
//     return () => {
//       client.off("toolcall", handleToolCall);
//       console.log("[LiveChatAPIConfig] Tool call handler unregistered.");
//     };
//   }, [client, handleToolCall]); // Chỉ phụ thuộc client và bản thân callback

//   return null; // Component không render UI trực tiếp
// }

// export const LiveChatAPIConfig = memo(LiveChatAPI); // Giữ memoization


// src/app/[locale]/livechat/LiveChatAPIConfig.tsx

"use client";
import { useEffect, memo } from "react";
import { useLiveAPIContext } from '@/src/app/[locale]/chatbot/livechat/contexts/LiveAPIContext';
import {
  englishGetConferencesDeclaration,
  englishGetJournalsDeclaration,
  englishGetWebsiteInfoDeclaration,
  englishNavigationDeclaration,
  englishManageFollowDeclaration, // Ensure this is correctly imported
  englishManageCalendarDeclaration, // Ensure this is correctly imported
  englishSendEmailToAdminDeclaration,
  websiteInfo,
  englishOpenGoogleMapDeclaration,
} from "../lib/functions"; // Assuming declarations are in this path
import { OutputModality, PrebuiltVoice, Language, ToolCall } from '@/src/app/[locale]/chatbot/lib/live-chat.types'; // Renamed to avoid conflict
import { FunctionDeclaration as LiveChatFunctionDeclaration } from '@google/generative-ai'
import { transformConferenceData } from '../utils/transformApiData';
import { appConfig } from "@/src/middleware";
import { FunctionCall } from "@google/generative-ai"; // This is for Gemini's FunctionCall type
import { usePathname } from 'next/navigation';
import { useLoggerStore } from '@/src/app/[locale]/chatbot/livechat/lib/store-logger'; // Adjust path if needed
import { ToolResponseMessage } from "./multimodal-live-types";

// --- Helper Functions for Frontend API Calls ---

// Placeholder for client-side auth token retrieval
// IMPORTANT: Implement this based on your application's auth mechanism
const getAuthTokenClientSide = async (): Promise<string | null> => {
  // Example: return localStorage.getItem('userAuthToken');
  // For demonstration, returning a dummy token. Replace with your actual implementation.
  const token = localStorage.getItem('token');
  if (!token || token === "YOUR_ACTUAL_USER_TOKEN_FROM_CLIENT_STORAGE_OR_CONTEXT") {
    console.warn("getAuthTokenClientSide: Dummy or no token returned. Implement actual token retrieval.");
    // In a real scenario, you might want to throw an error or return null
    // if the action requires auth and no token is available.
    // return null; // Or throw new Error("Authentication token not found.");
  }
  return token;
};

// Generic API call helper for frontend
async function makeFrontendApiCall(
  url: string,
  method: 'GET' | 'POST' | 'DELETE' | 'PUT',
  token: string | null,
  body?: any
): Promise<any> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorData;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = await response.text(); // Fallback if JSON parsing fails
      }
    } else {
      errorData = await response.text();
    }
    console.error(`Frontend API call to ${url} (method ${method}) failed with status ${response.status}:`, errorData);
    const message = (typeof errorData === 'object' && errorData?.message) ? errorData.message :
      (typeof errorData === 'string' && errorData.trim() !== '') ? errorData :
        `API Error (${response.status})`;
    throw new Error(message);
  }

  if (response.status === 201 || response.headers.get("content-length") === "0") {
    return { success: true, message: "Operation successful." }; // No content to parse
  }
  return response.json(); // Assuming successful responses with content are JSON
}

// Helper to find item ID and name by identifier (acronym, title, or ID)
async function fetchItemDetailsFromApi(
  identifier: string,
  identifierType: 'acronym' | 'title' | 'id',
  itemType: 'conference' | 'journal',
  databaseUrl: string
): Promise<{ id: string; name: string }> {
  if (!identifier) throw new Error("Identifier is required.");

  const searchApiUrl = `${databaseUrl}/${itemType}`; // e.g., /api/v1/conference or /api/v1/journal
  const params = new URLSearchParams({ perPage: '1' });

  if (identifierType === 'id') {
    params.set('id', identifier); // Assuming API supports search by ID directly
  } else if (identifierType === 'acronym') {
    params.set('acronym', identifier);
  } else if (identifierType === 'title') {
    params.set('title', identifier); // Assuming API supports search by title
  } else {
    throw new Error(`Unsupported identifier type: ${identifierType}`);
  }

  const finalUrl = `${searchApiUrl}?${params.toString()}`;
  // console.log(`Fetching item details from: ${finalUrl}`);

  const response = await fetch(finalUrl, { method: 'GET', headers: { 'Accept': 'application/json' } });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch ${itemType} details for "${identifier}" from ${finalUrl}: ${response.status} ${errorText.substring(0, 100)}`);
  }
  const result = await response.json();

  let itemData;
  if (result && Array.isArray(result.payload) && result.payload.length > 0) {
    itemData = result.payload[0];
  } else if (Array.isArray(result) && result.length > 0) { // Fallback for direct array response
    itemData = result[0];
  } else if (result && result.id) { // Fallback for single object response
    itemData = result;
  }


  if (itemData && itemData.id) {
    return { id: itemData.id, name: itemData.title || itemData.acronym || itemData.id };
  } else {
    throw new Error(`${itemType} not found with ${identifierType} "${identifier}", or ID missing in response.`);
  }
}

// Helper to format a list of items for the model's response
// Assuming items have at least 'title' and 'acronym'
function formatItemsForModel(items: any[], itemType: string): string {
  if (!items || items.length === 0) {
    return `You are not following any ${itemType}s.`;
  }
  const formatted = items.map(item => {
    let display = `- ${item.title || 'Unknown Title'}`;
    if (item.acronym) display += ` (${item.acronym})`;
    // Add more details if needed, e.g., date, location, similar to backend handler
    return display;
  }).join('\n');
  return `Here are the ${itemType}s you are following:\n${formatted}`;
}


interface LiveChatAPIConfigProps {
  outputModality: OutputModality;
  selectedVoice: PrebuiltVoice;
  language: Language;
  systemInstructions: string;
}

function LiveChatAPI({ outputModality, selectedVoice, language, systemInstructions }: LiveChatAPIConfigProps) {
  const { client, setConfig } = useLiveAPIContext();

  const { log: logToStore } = useLoggerStore(); // Get the log function from the store

  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1];

  useEffect(() => {
    console.log(`Configuring API for: Modality=${outputModality}, Voice=${selectedVoice}, Language=${language}, Locale=${currentLocale}`);
    const modalitiesConfig = outputModality === 'audio' ? ["AUDIO"] : ["TEXT"];
    const generationConfig: any = {
      responseModalities: modalitiesConfig,
    };
    if (outputModality === 'audio') {
      generationConfig.speechConfig = {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } },
      };
    }

    let activeFunctionDeclarations: LiveChatFunctionDeclaration[]; // Use renamed type
    // For simplicity, always using English declarations as per the current structure
    activeFunctionDeclarations = [
      englishGetConferencesDeclaration,
      englishGetJournalsDeclaration,
      englishGetWebsiteInfoDeclaration,
      englishNavigationDeclaration,
      englishManageFollowDeclaration,     // Added
      englishManageCalendarDeclaration,   // Added
      englishSendEmailToAdminDeclaration,
      englishOpenGoogleMapDeclaration
    ];

    const finalConfig = {
      model: "models/gemini-2.0-flash-live-001",
      generationConfig: generationConfig,
      systemInstruction: {
        parts: [{ text: systemInstructions }],
      },
      tools: [
        {
          functionDeclarations: activeFunctionDeclarations,
        },
      ],
    };
    console.log("Setting config with functions:", JSON.stringify(finalConfig.tools, null, 2));
    setConfig(finalConfig);
  }, [setConfig, outputModality, selectedVoice, language, systemInstructions, currentLocale]);

  useEffect(() => {
    const onToolCall = async (toolCall: ToolCall) => {
      console.log(`Got toolcall`, toolCall);
      const NEXT_PUBLIC_DATABASE_URL = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1` || "https://confhub.westus3.cloudapp.azure.com";
      const NEXT_PUBLIC_FRONTEND_URL = appConfig.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:8386";
      const responses = [];

      const getUrlArg = (fc: FunctionCall): string | undefined => {
        return fc.args && typeof fc.args === 'object' && typeof (fc.args as any).url === 'string'
          ? (fc.args as any).url
          : undefined;
      };

      for (const fc of toolCall.functionCalls) {
        let apiUrl = '';
        let method: 'GET' | 'POST' = 'POST';
        let body: string | undefined = undefined;
        let headers: HeadersInit = { 'Content-Type': 'application/json' };
        let requiresJsonResponse = false;
        let responseData: any;
        let finalUrl = '';
        let searchQuery: string | undefined = undefined;
        let requiresApiCall = true; // Default, set to false for client-side handled functions

        try {
          switch (fc.name) {
            case "getConferences":
              apiUrl = `${NEXT_PUBLIC_DATABASE_URL}/conference`;
              method = 'GET';
              headers = {};
              searchQuery = fc.args && typeof fc.args === 'object' && typeof (fc.args as any).searchQuery === 'string'
                ? (fc.args as any).searchQuery
                : undefined;
              finalUrl = searchQuery ? `${apiUrl}?${searchQuery}` : apiUrl;
              requiresJsonResponse = true;
              break;

            case "getJournals":
              apiUrl = `${NEXT_PUBLIC_DATABASE_URL}/journal`;
              method = 'GET';
              headers = {};
              searchQuery = fc.args && typeof fc.args === 'object' && typeof (fc.args as any).searchQuery === 'string'
                ? (fc.args as any).searchQuery
                : undefined;
              finalUrl = searchQuery ? `${apiUrl}?${searchQuery}` : apiUrl;
              requiresJsonResponse = true;
              break;

            case "getWebsiteInfo":
              responses.push({ response: { content: websiteInfo }, id: fc.id });
              requiresApiCall = false;
              break;

            case "navigation":
              requiresApiCall = false;
              const targetUrl = getUrlArg(fc);
              if (!targetUrl) throw new Error("Missing 'url' argument for navigation.");
              let urlToOpen = '';
              if (targetUrl.startsWith('/')) {
                if (!currentLocale) throw new Error("Locale unavailable for internal link.");
                urlToOpen = `${NEXT_PUBLIC_FRONTEND_URL}/${currentLocale}${targetUrl}`;
              } else if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
                urlToOpen = targetUrl;
              } else {
                throw new Error(`Invalid 'url' format: ${targetUrl}.`);
              }
              if (typeof window !== 'undefined') window.open(urlToOpen, '_blank', 'noopener,noreferrer');
              else console.warn("window object not available for navigation.");
              responses.push({ response: { content: { message: `Navigating to ${urlToOpen}`, status: 'success' } }, id: fc.id });
              continue;

            // --- NEW: manageFollow ---
            case "manageFollow": {
              requiresApiCall = false;
              const args = fc.args as any; // Cast for easier access, validate below
              const { itemType, action, identifier, identifierType } = args;

              if (!itemType || !['conference', 'journal'].includes(itemType)) {
                throw new Error("Invalid or missing 'itemType' for manageFollow. Must be 'conference' or 'journal'.");
              }
              if (!action || !['follow', 'unfollow', 'list'].includes(action)) {
                throw new Error("Invalid or missing 'action' for manageFollow. Must be 'follow', 'unfollow', or 'list'.");
              }

              const token = await getAuthTokenClientSide();
              if (!token) {
                throw new Error("Authentication required to manage followed items. Please log in.");
              }

              let modelMessage = "";

              if (action === 'list') {
                const listUrl = `${NEXT_PUBLIC_DATABASE_URL}/${itemType === 'conference' ? 'follow-conference' : 'follow-journal'}/followed`;
                const followedItems = await makeFrontendApiCall(listUrl, 'GET', token);
                // API returns array of FollowItem: { id, title, acronym, dates, location, ... }
                // The backend service returns { success: true, itemIds, items: followedItems }
                // Assuming makeFrontendApiCall returns the direct array of items or an object containing it.
                // Let's assume it returns an array of items directly for simplicity here.
                // If your API wraps it, e.g. { data: [...] } or { payload: [...] }, adjust access.
                modelMessage = formatItemsForModel(followedItems, itemType); // `followedItems` should be the array
              } else { // 'follow' or 'unfollow'
                if (!identifier || !identifierType) {
                  throw new Error(`'identifier' and 'identifierType' are required for '${action}' action.`);
                }
                if (!['acronym', 'title', 'id'].includes(identifierType)) {
                  throw new Error("Invalid 'identifierType'. Must be 'acronym', 'title', or 'id'.");
                }

                const itemDetails = await fetchItemDetailsFromApi(identifier, identifierType, itemType, NEXT_PUBLIC_DATABASE_URL);
                const itemId = itemDetails.id;
                const itemName = itemDetails.name;

                const actionUrl = `${NEXT_PUBLIC_DATABASE_URL}/${itemType === 'conference' ? 'follow-conference' : 'follow-journal'}/${action === 'follow' ? 'add' : 'remove'}`;
                const payload = itemType === 'conference' ? { conferenceId: itemId } : { journalId: itemId };

                await makeFrontendApiCall(actionUrl, 'POST', token, payload);
                modelMessage = `Successfully ${action === 'follow' ? 'followed' : 'unfollowed'} ${itemType}: "${itemName}".`;
              }
              responses.push({ response: { content: modelMessage }, id: fc.id });
              continue;
            }

            // --- NEW: manageCalendar ---
            case "manageCalendar": {
              requiresApiCall = false;
              const args = fc.args as any;
              const { itemType, action, identifier, identifierType } = args;

              if (itemType !== 'conference') {
                throw new Error("Invalid 'itemType' for manageCalendar. Must be 'conference'.");
              }
              if (!action || !['add', 'remove', 'list'].includes(action)) {
                throw new Error("Invalid or missing 'action' for manageCalendar. Must be 'add', 'remove', or 'list'.");
              }

              const token = await getAuthTokenClientSide();
              if (!token) {
                throw new Error("Authentication required to manage calendar items. Please log in.");
              }

              let modelMessage = "";
              // Assuming calendar endpoints are like: /api/v1/calendar-conference/{list|add|remove}
              if (action === 'list') {
                const listUrl = `${NEXT_PUBLIC_DATABASE_URL}/calendar/events`; // VERIFY THIS ENDPOINT
                const calendarItems = await makeFrontendApiCall(listUrl, 'GET', token);
                // Adapt formatItemsForModel or create a new one if calendar items have a different structure
                modelMessage = formatItemsForModel(calendarItems, 'conference in calendar');
              } else { // 'add' or 'remove'
                if (!identifier || !identifierType) {
                  throw new Error(`'identifier' and 'identifierType' are required for '${action}' action on calendar.`);
                }
                if (!['acronym', 'title', 'id'].includes(identifierType)) {
                  throw new Error("Invalid 'identifierType'. Must be 'acronym', 'title', or 'id'.");
                }

                const itemDetails = await fetchItemDetailsFromApi(identifier, identifierType, "conference", NEXT_PUBLIC_DATABASE_URL);
                const itemId = itemDetails.id;
                const itemName = itemDetails.name;

                const actionUrl = `${NEXT_PUBLIC_DATABASE_URL}/calendar/${action === 'add-event' ? 'add' : 'remove-event'}`; // VERIFY THIS ENDPOINT
                const payload = { conferenceId: itemId }; // Assuming same payload

                // Note: 'remove' might be a DELETE request depending on API design.
                // makeFrontendApiCall supports 'DELETE', adjust if necessary.
                await makeFrontendApiCall(actionUrl, 'PUT', token, payload);
                modelMessage = `Successfully ${action === 'add' ? 'added' : 'removed'} conference "${itemName}" ${action === 'add' ? 'to' : 'from'} your calendar.`;
              }
              responses.push({ response: { content: modelMessage }, id: fc.id });
              continue;
            }

            // --- NEW: openGoogleMap ---
            case "openGoogleMap": {
              requiresApiCall = false;
              const args = fc.args as any;
              const location = args?.location as string | undefined;

              if (!location || typeof location !== 'string' || location.trim() === '') {
                throw new Error("Missing or invalid 'location' argument for openGoogleMap.");
              }

              responses.push({
                response: {
                  content: {
                    messageForModel: `Map for "${location}" is being prepared for display.`,
                    uiAction: {
                      type: "display_map",
                      location: location,
                    }
                  }
                },
                id: fc.id
              });
              continue; // Go to the next function call
            }

            default:
              console.warn(`Unknown function call name received: ${fc.name}`);
              responses.push({ response: { content: { type: "error", message: `Unknown function: ${fc.name}` } }, id: fc.id });
              requiresApiCall = false; // Explicitly false for default too, as it's unhandled
              continue;
          }

          if (requiresApiCall) {
            console.log(`Calling API for ${fc.name} using ${method} at: ${finalUrl}`);
            if (body) console.log('With body:', body);
            const response = await fetch(finalUrl, { method, headers, body: body ? JSON.stringify(body) : body }); // body already stringified for POSTs above
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`API Error (${response.status}) for ${fc.name}: ${errorText.substring(0, 200)}`);
            }
            responseData = requiresJsonResponse ? await response.json() : await response.text();
            let contentToSend = responseData;
            if ((fc.name === 'getConferences') && responseData) {
              contentToSend = transformConferenceData(responseData, searchQuery);
            }
            responses.push({ response: { content: contentToSend }, id: fc.id });
          }
        } catch (error: any) {
          console.error(`Error processing function call ${fc.name}:`, error);
          let errorMessage = error.message || "An unexpected error occurred.";
          if (errorMessage.length > 300) errorMessage = errorMessage.substring(0, 297) + "...";
          responses.push({
            response: { content: { type: "error", message: `Failed to execute ${fc.name}: ${errorMessage}` } },
            id: fc.id
          });
        }
      }

      if (responses.length > 0) {
        console.log("Sending tool responses (raw for client.sendToolResponse):", { functionResponses: responses });

        // --- EXPLICITLY LOG THE OUTGOING TOOL RESPONSE ---
        const toolResponseMessageForLog: ToolResponseMessage = {
          toolResponse: { functionResponses: responses }
        };
        logToStore({
          date: new Date(),
          type: "client.toolResponse", // Use a distinct type
          message: toolResponseMessageForLog,
          count: 1
        });
        // --- END EXPLICIT LOG ---

        client.sendToolResponse({ functionResponses: responses });
      } else {
        console.log("No responses generated for this tool call batch.");
      }
    };

    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client, currentLocale, setConfig, logToStore]); // Added logToStore

  return null;
}

export const LiveChatAPIConfig = memo(LiveChatAPI);