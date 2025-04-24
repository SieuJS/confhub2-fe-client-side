// // src/app/[locale]/chatbot/LiveChatAPIConfig.tsx
// "use client";
// import { useEffect, memo } from "react";
// import { useLiveAPIContext } from '@/src/app/[locale]/chatbot/livechat/contexts/LiveAPIContext';
// import { OutputModality, PrebuiltVoice, Language, ToolCall } from '@/src/app/[locale]/chatbot/lib/live-chat.types';
// import { transformConferenceData } from './utils/transformApiData';
// import { appConfig } from "@/src/middleware";
// import { FunctionDeclaration, FunctionCall } from "@google/generative-ai";
// import { usePathname } from 'next/navigation';

// import { getAgentLanguageConfig, AgentId } from './lib/languageConfig';

// interface LiveChatAPIConfigProps {
//   outputModality: OutputModality;
//   selectedVoice: PrebuiltVoice;
//   language: Language;
//   systemInstructions: string;
// }

// function LiveChatAPI({ outputModality, selectedVoice, language, systemInstructions }: LiveChatAPIConfigProps) {
//   const { client, setConfig } = useLiveAPIContext();

//   const pathname = usePathname()
//   const currentLocale = pathname.split('/')[1]

//   // Effect 1: Configure the API client based on props
//   useEffect(() => {
//     console.log(`Configuring API for: Modality=${outputModality}, Voice=${selectedVoice}, Language=${language}, Locale=${currentLocale}`);

//     const modalitiesConfig = outputModality === 'audio' ? ["AUDIO"] : ["TEXT"];
//     const generationConfig: any = {
//       responseModalities: modalitiesConfig,
//     };

//     if (outputModality === 'audio') {
//       generationConfig.speechConfig = {
//         voiceConfig: {
//           prebuiltVoiceConfig: { voiceName: selectedVoice }
//         },
//       };
//     }

//     // --- Select Function Declarations based on Language ---
//     let activeFunctionDeclarations: FunctionDeclaration[];

//     // Determine active language (use currentLocale if available and reliable, otherwise fall back to prop)
//     const activeLang = currentLocale || language;

//     if (activeLang === 'vi') {
//       console.log("Using Vietnamese function declarations.");
//       activeFunctionDeclarations = [
//         vietnam_getConferencesDeclaration,
//         vietnam_getJournalsDeclaration,
//         vietnam_getWebsiteInfoDeclaration,
//         // navigationDeclaration, // Add navigation
//         // vietnam_drawChartDeclaration,
//       ];
//     } else if (activeLang === 'zh') {
//       console.log("Using Chinese function declarations.");
//       activeFunctionDeclarations = [
//         china_getConferencesDeclaration,
//         china_getJournalsDeclaration,
//         china_getWebsiteInfoDeclaration,
//         // navigationDeclaration, // Add navigation
//         // china_drawChartDeclaration,
//       ];
//     } else { // Default to English
//       console.log("Using English function declarations (default).");
//       activeFunctionDeclarations = [
//         english_getConferencesDeclaration,
//         english_getJournalsDeclaration,
//         english_getWebsiteInfoDeclaration,
//         english_navigationDeclaration, // Add navigation
//         // drawChartDeclaration,
//       ];
//     }
//     // --- End Selection ---

//     const finalConfig = {
//       model: "models/gemini-2.0-flash-live-001",
//       generationConfig: generationConfig,
//       systemInstruction: {
//         parts: [{ text: systemInstructions }],
//       },
//       tools: [
//         {
//           functionDeclarations: activeFunctionDeclarations,
//         },
//       ],
//     };

//     console.log("Setting config with functions:", JSON.stringify(finalConfig.tools, null, 2));
//     setConfig(finalConfig);

//   }, [setConfig, outputModality, selectedVoice, language, systemInstructions, currentLocale]); // Added currentLocale dependency


//   // Effect 2: Handle Tool Calls
//   useEffect(() => {
//     const onToolCall = async (toolCall: ToolCall) => {
//       console.log(`Got toolcall`, toolCall);
//       const NEXT_PUBLIC_DATABASE_URL = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1` || "http://confhub.engineer/api/v1";
//       const BASE_WEB_URL = "http://localhost:8386"; // Your web app's base URL
//       const responses = [];

//       // Helper function to safely extract URL argument
//       const getUrlArg = (fc: FunctionCall): string | undefined => {
//         return fc.args && typeof fc.args === 'object' && typeof (fc.args as any).url === 'string'
//           ? (fc.args as any).url
//           : undefined;
//       };

//       for (const fc of toolCall.functionCalls) {
//         // Reset variables for each function call
//         let apiUrl = '';
//         let method: 'GET' | 'POST' = 'POST'; // Default, override as needed
//         let body: string | undefined = undefined;
//         let headers: HeadersInit = { 'Content-Type': 'application/json' };
//         let requiresJsonResponse = false;
//         let responseData: any;
//         let finalUrl = ''; // URL for API calls OR navigation
//         let searchQuery: string | undefined = undefined;
//         let requiresApiCall = true; // Assume API call needed unless it's navigation

//         try {
//           switch (fc.name) {
//             // --- Existing Cases ---
//             case "getConferences":

//               apiUrl = `${NEXT_PUBLIC_DATABASE_URL}/conference`;
//               method = 'GET';
//               headers = {};
//               searchQuery = fc.args && typeof fc.args === 'object' && typeof (fc.args as any).searchQuery === 'string'
//                 ? (fc.args as any).searchQuery
//                 : undefined;
//               if (!searchQuery) {
//                 console.warn(`Warning: 'searchQuery' argument missing/invalid for ${fc.name}. Proceeding without search query.`);
//                 finalUrl = apiUrl;
//               } else {
//                 console.log(`Extracted Conference Search Query for ${fc.name}:`, searchQuery);
//                 // Encode the search query properly
//                 finalUrl = `${apiUrl}?${searchQuery}`;
//               }
//               requiresJsonResponse = true;
//               break;

//             case "getJournals":

//               apiUrl = `${NEXT_PUBLIC_DATABASE_URL}/journal`; // *** MAKE SURE THIS IS THE CORRECT ENDPOINT ***
//               method = 'GET'; // Or POST? Check your API spec
//               headers = {};   // Adjust if POST
//               // Assuming search query like conferences if GET
//               searchQuery = fc.args && typeof fc.args === 'object' && typeof (fc.args as any).searchQuery === 'string'
//                 ? (fc.args as any).searchQuery
//                 : undefined;
//               if (!searchQuery) {
//                 finalUrl = apiUrl;
//               } else {
//                 finalUrl = `${apiUrl}?${searchQuery}`;
//               }
//               // If POST:
//               // method = 'POST';
//               // body = JSON.stringify(fc.args);
//               // finalUrl = apiUrl;
//               requiresJsonResponse = true;
//               break;

//             case "getWebsiteInfo":

//               // Assuming this is just informational, maybe no API needed?
//               // Or perhaps calls a general info endpoint? Clarify its purpose.
//               // For now, let's assume it doesn't need an API call here, maybe handled differently
//               console.warn(`${fc.name} called, but no specific backend API defined in this handler.`);
//               responses.push({ response: { content: { message: `Function ${fc.name} acknowledged but no action configured.` } }, id: fc.id });
//               requiresApiCall = false; // Prevent API call attempt below
//               continue; // Skip to next function call

//             // --- NEW Navigation Case ---
//             case "navigation":
//               requiresApiCall = false;
//               const targetUrl = getUrlArg(fc);

//               if (!targetUrl) {
//                 console.error(`Missing or invalid 'url' argument for navigation.`);
//                 throw new Error("Missing 'url' argument for navigation function.");
//               }

//               let navigationResponseMessage = '';
//               let urlToOpen = '';

//               if (targetUrl.startsWith('/')) {
//                 // Internal navigation
//                 if (!currentLocale) {
//                   console.error("Cannot determine current locale for internal navigation.");
//                   throw new Error("Locale information unavailable for internal link construction.");
//                 }
//                 urlToOpen = `${BASE_WEB_URL}/${currentLocale}${targetUrl}`;
//                 navigationResponseMessage = `Okay, I'll open the internal page: ${targetUrl}`;
//                 console.log(`Attempting internal navigation to: ${urlToOpen}`);

//               } else if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
//                 // External navigation
//                 urlToOpen = targetUrl;
//                 navigationResponseMessage = `Okay, I'll open the external website.`; // Keep it simple
//                 console.log(`Attempting external navigation to: ${urlToOpen}`);

//               } else {
//                 console.error(`Invalid 'url' format for navigation: ${targetUrl}. Must start with '/' or 'http(s)://'.`);
//                 throw new Error(`Invalid 'url' format. Must be an internal path (starting with '/') or a full external URL.`);
//               }

//               // --- Execute Navigation in New Tab ---
//               // Ensure this runs in the browser context
//               if (typeof window !== 'undefined') {
//                 window.open(urlToOpen, '_blank', 'noopener,noreferrer');
//               } else {
//                 console.warn("window object not available, cannot open new tab (maybe running in Node?).");
//                 // Handle server-side rendering or other environments if necessary
//                 navigationResponseMessage = `Navigation requested for ${urlToOpen}, but cannot open tab from this context.`;
//               }
//               // --- --------------------------- ---

//               // Respond to the model that the action was initiated
//               responses.push({
//                 response: { content: { message: navigationResponseMessage, status: 'success' } }, // Simple success message
//                 id: fc.id
//               });
//               continue; // Go to the next function call in the batch


//             // --- Default Case ---
//             default:
//               console.warn(`Unknown function call name received: ${fc.name}`);
//               responses.push({ response: { content: { type: "error", message: `Unknown function: ${fc.name}` } }, id: fc.id });
//               requiresApiCall = false;
//               continue; // Skip to next function call
//           }
//           // --- End Switch ---


//           // --- API Call Logic (Only if requiresApiCall is true) ---
//           if (requiresApiCall) {
//             console.log(`Calling API for ${fc.name} using ${method} at: ${finalUrl}`);
//             if (body) console.log('With body:', body);

//             const response = await fetch(finalUrl, { method, headers, body });

//             if (!response.ok) {
//               const errorText = await response.text();
//               console.error(`API call for ${fc.name} failed with status ${response.status}: ${errorText}`);
//               throw new Error(`API Error (${response.status}) for ${fc.name}: ${errorText.substring(0, 200)}`);
//             }

//             try {
//               responseData = requiresJsonResponse ? await response.json() : await response.text();
//             } catch (parseError: any) {
//               console.error(`Error parsing ${requiresJsonResponse ? 'JSON' : 'text'} response for ${fc.name}:`, parseError);
//               const rawText = await response.text(); // Attempt to read as text for debugging
//               console.error("Raw response text:", rawText.substring(0, 500));
//               throw new Error(`Failed to parse API response for ${fc.name}.`);
//             }

//             let contentToSend = responseData;
//             // Apply transformation if needed (e.g., for conferences)
//             if ((fc.name === 'getConferences') && responseData) {
//               console.log(`Transforming data for ${fc.name}${searchQuery ? ` with query: ${searchQuery}` : ''}`);
//               // Ensure transformConferenceData handles potentially missing search query gracefully
//               contentToSend = transformConferenceData(responseData, searchQuery);
//             }
//             // Add transformations for journals if needed

//             console.log(`Response data for ${fc.name}:`, contentToSend);
//             responses.push({ response: { content: contentToSend }, id: fc.id });
//           }
//           // --- End API Call Logic ---
//         } catch (error: any) {
//           console.error(`Error processing function call ${fc.name}:`, error);
//           let errorMessage = error.message || "An unexpected error occurred processing the tool call.";
//           if (errorMessage.length > 300) errorMessage = errorMessage.substring(0, 297) + "...";
//           // Ensure error response format is consistent
//           responses.push({
//             response: {
//               content: { type: "error", message: `Failed to execute ${fc.name}: ${errorMessage}` }
//             },
//             id: fc.id
//           });
//         }
//       } // End for loop

//       if (responses.length > 0) {
//         console.log("Sending tool responses:", JSON.stringify(responses, null, 2));
//         client.sendToolResponse({ functionResponses: responses });
//       } else {
//         console.log("No responses generated for this tool call batch.");
//       }
//     };

//     client.on("toolcall", onToolCall);
//     return () => {
//       client.off("toolcall", onToolCall);
//     };
//   }, [client, currentLocale]); // Added currentLocale to dependency array for onToolCall


//   return null;
// }

// export const LiveChatAPIConfig = memo(LiveChatAPI);





// src/app/[locale]/chatbot/LiveChatAPIConfig.tsx
"use client";
import { useEffect, memo, useCallback } from "react";
import { useLiveAPIContext } from '@/src/app/[locale]/chatbot/livechat/contexts/LiveAPIContext';
// Remove FunctionResponse import from @google/generative-ai
import { OutputModality, PrebuiltVoice, Language, ToolCall } from '@/src/app/[locale]/chatbot/lib/live-chat.types';
import { transformConferenceData } from './utils/transformApiData';
import { appConfig } from "@/src/middleware";
// Keep FunctionDeclaration import
import { FunctionDeclaration } from "@google/generative-ai";
import { usePathname } from 'next/navigation';

import {
  EN_routeToAgentDeclaration,
  EN_hostAgentSystemInstructions,

} from './lib/functionDeclarations';

import { AgentId } from './lib/languageConfig';

// --- Define types for Agent Routing ---
interface RouteToAgentArgs {
  targetAgent: AgentId;
  taskDescription: string;
  inputData?: Record<string, any> | string;
}

interface ConferenceAgentInput {
  searchQuery?: string;
}

interface JournalAgentInput {
  searchQuery?: string;
}

interface NavigationAgentInput {
  url: string;
}

interface WebsiteInfoInput {
  // Define if needed
}

// --- *** NEW TYPE DEFINITION (Matching Original Structure) *** ---
// Define the structure expected by the Live Chat client.sendToolResponse,
// matching the user's original result/error placement.
interface OriginalLiveChatResponseFormat {
  response: {
    // Content holds EITHER the successful result OR an error object
    content: any; // Use 'any' or define a union type like `SuccessResult | ErrorPayload`
  };
  // The ID linking back to the specific FunctionCall
  id: string;
}

// Optional: Define a specific error structure if desired
interface ErrorPayload {
  type: "error";
  message: string;
}
// --- *** END NEW TYPE DEFINITION *** ---


interface LiveChatAPIConfigProps {
  outputModality: OutputModality;
  selectedVoice: PrebuiltVoice;
  language: Language;
  hostAgentSystemInstructions: string;
}

function LiveChatAPI({ outputModality, selectedVoice, language, hostAgentSystemInstructions }: LiveChatAPIConfigProps) {
  const { client, setConfig } = useLiveAPIContext();
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] as Language;

  // --- Effect 1: Configure API Client (No changes here) ---
  useEffect(() => {
    // ... (configuration logic remains the same) ...
    console.log(`Configuring API as Host Agent for: Modality=${outputModality}, Voice=${selectedVoice}, Language=${language}, Locale=${currentLocale}`);
    const modalitiesConfig = outputModality === 'audio' ? ["AUDIO"] : ["TEXT"];
    const generationConfig: any = { responseModalities: modalitiesConfig };
    if (outputModality === 'audio') {
      generationConfig.speechConfig = { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } };
    }
    const activeLang = currentLocale || language;
    let hostAgentFunctionDeclarations: FunctionDeclaration[];
    switch (activeLang) {
      default:
        console.log("Using English Host Agent function declarations (default).");
        hostAgentFunctionDeclarations = [EN_routeToAgentDeclaration];
        break;
    }
    const finalConfig = {
      model: "models/gemini-2.0-flash-live-001",
      generationConfig: generationConfig,
      systemInstruction: { parts: [{ text: EN_hostAgentSystemInstructions }] },
      tools: hostAgentFunctionDeclarations.length > 0 ? [{ functionDeclarations: hostAgentFunctionDeclarations }] : undefined,
    };
    console.log("Setting Host Agent config:", JSON.stringify(finalConfig, null, 2));
    setConfig(finalConfig);
  }, [setConfig, outputModality, selectedVoice, language, hostAgentSystemInstructions, currentLocale]);


  // --- Effect 2: Handle Tool Calls (Primarily 'routeToAgent') ---
  const handleToolCall = useCallback(async (toolCall: ToolCall) => {
    console.log(`Host Agent received toolcall:`, toolCall);
    const NEXT_PUBLIC_DATABASE_URL = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1` || "http://confhub.engineer/api/v1";
    const BASE_WEB_URL = typeof window !== 'undefined' ? window.location.origin : "http://localhost:8386";
    // --- *** USE THE CORRECT TYPE FOR THE ARRAY *** ---
    const responses: OriginalLiveChatResponseFormat[] = [];
    const activeLang = currentLocale || language;

    for (const fc of toolCall.functionCalls) {
      // This variable will hold the content for the 'response.content' field
      let responseContentPart: any;

      try {
        if (fc.name === 'routeToAgent') {
          const args = fc.args as RouteToAgentArgs;
          const targetAgent = args?.targetAgent;
          const inputData = args.inputData;
          const taskDescription = args?.taskDescription;

          console.log(`Routing task "${taskDescription}" to ${targetAgent} with task description:`, taskDescription);

          if (!targetAgent) {
            throw new Error("Missing 'targetAgent' in routeToAgent arguments.");
          }

          let resultData: any = null;
          let errorMessage: string | undefined = undefined;

          // --- Simulate Sub Agent Execution ---
          switch (targetAgent) {
            case 'ConferenceAgent': {
              console.log(`Simulating ConferenceAgent: Fetching conferences.`);
              const conferenceInput = inputData as ConferenceAgentInput;
              const searchQuery = conferenceInput.searchQuery;
              const apiUrl = `${NEXT_PUBLIC_DATABASE_URL}/conference`;
              const finalUrl = searchQuery ? `${apiUrl}?${searchQuery}` : apiUrl;

              const apiResponse = await fetch(finalUrl);
              if (!apiResponse.ok) {
                const errorText = await apiResponse.text();
                throw new Error(`API Error (${apiResponse.status}) for ${targetAgent}: ${errorText.substring(0, 200)}`);
              }
              const rawData = await apiResponse.json();
              resultData = transformConferenceData(rawData, searchQuery);
              console.log(`ConferenceAgent simulation result:`, resultData);
              break;
            }
            case 'JournalAgent': {
              console.log(`Simulating JournalAgent: Fetching journals.`);
              const journalInput = inputData as JournalAgentInput;
              const searchQuery = journalInput.searchQuery;
              const apiUrl = `${NEXT_PUBLIC_DATABASE_URL}/journal`;
              const finalUrl = searchQuery ? `${apiUrl}?${searchQuery}` : apiUrl;

              const apiResponse = await fetch(finalUrl);
              if (!apiResponse.ok) {
                const errorText = await apiResponse.text();
                throw new Error(`API Error (${apiResponse.status}) for ${targetAgent}: ${errorText.substring(0, 200)}`);
              }
              resultData = await apiResponse.json();
              console.log(`JournalAgent simulation result:`, resultData);
              break;
            }
            case 'NavigationAgent': {
              console.log(`Simulating NavigationAgent: Performing navigation.`);
              const navInput = inputData as NavigationAgentInput;
              const targetUrl = navInput?.url;
              if (!targetUrl || typeof targetUrl !== 'string') {
                throw new Error("Missing or invalid 'url' in inputData for NavigationAgent.");
              }
              let urlToOpen: string, navigationResponseMessage: string;
              if (targetUrl.startsWith('/')) {
                urlToOpen = `${BASE_WEB_URL}/${activeLang}${targetUrl}`;
                navigationResponseMessage = `Okay, navigating to internal page: ${targetUrl}`;
              } else if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
                urlToOpen = targetUrl;
                navigationResponseMessage = `Okay, opening: ${targetUrl}`;
              } else {
                throw new Error(`Invalid 'url' format for navigation: ${targetUrl}.`);
              }
              if (typeof window !== 'undefined') {
                window.open(urlToOpen, '_blank', 'noopener,noreferrer');
                resultData = { status: 'success', message: navigationResponseMessage, urlOpened: urlToOpen };
              } else {
                resultData = { status: 'skipped', message: `Navigation requested for ${urlToOpen}, but cannot open tab.` };
              }
              break;
            }
            case 'WebsiteInfoAgent':
              console.log(`Simulating WebsiteInfoAgent.`);
              resultData = { status: 'acknowledged', message: `Information request about website received.`, input: inputData };
              console.log(`WebsiteInfoAgent simulation result:`, resultData);
              break;
            default:
              console.warn(`Unsupported targetAgent received: ${targetAgent}`);
              // Set errorMessage directly, it will be handled below
              errorMessage = `The requested agent '${targetAgent}' is not handled by this client.`;
              break;
          }
          // --- End Sub Agent Simulation ---

          // Prepare the response CONTENT PART
          if (errorMessage) {
            // If an error occurred during simulation, throw it to be caught by the catch block
            // This centralizes error formatting.
            throw new Error(errorMessage);
          } else {
            // Assign successful result data to the content part
            responseContentPart = resultData;
          }

        } else {
          // Handle unexpected function calls by throwing an error
          console.warn(`Host Agent received unexpected function call: ${fc.name}.`);
          throw new Error(`Error: Client received unexpected function call '${fc.name}'. Expected 'routeToAgent'.`);
        }

        // --- *** PUSH SUCCESS STRUCTURE *** ---
        responses.push({
          response: { content: responseContentPart }, // Assign the result here
          id: fc.id // Include the ID
        });

      } catch (error: any) {
        console.error(`Error processing function call ${fc.name} (Target: ${(fc.args as any)?.targetAgent}):`, error);
        let errMsg = error.message || "An unexpected error occurred processing the tool call.";
        if (errMsg.length > 300) errMsg = errMsg.substring(0, 297) + "...";

        // --- *** PUSH ERROR STRUCTURE (Matching Original) *** ---
        // Format the error according to the original structure
        const errorPayload: ErrorPayload = {
          type: "error",
          message: `Failed to execute ${fc.name}: ${errMsg}`
        };
        responses.push({
          response: { content: errorPayload }, // Place error object inside 'content'
          id: fc.id // Include the ID
        });
      }
    } // End for loop

    if (responses.length > 0) {
      console.log("Sending tool responses back to Host Agent:", JSON.stringify(responses, null, 2));
      client.sendToolResponse({ functionResponses: responses });
    } else {
      console.log("No responses generated for this tool call batch.");
    }
  }, [client, currentLocale, language]); // Dependencies


  // Effect 2 (Hook Registration - No changes here)
  useEffect(() => {
    client.on("toolcall", handleToolCall);
    console.log("Tool call handler registered.");
    return () => {
      client.off("toolcall", handleToolCall);
      console.log("Tool call handler unregistered.");
    };
  }, [client, handleToolCall]);


  return null;
}

export const LiveChatAPIConfig = memo(LiveChatAPI);