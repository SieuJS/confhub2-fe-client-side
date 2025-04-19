// src/components/LiveChatAPIConfig.tsx (Adjusted)
"use client";
import { useEffect, memo } from "react";
import { useLiveAPIContext } from '@/src/app/[locale]/chatbot/livechat/contexts/LiveAPIContext';
import {
  getConferencesDeclaration,
  getJournalsDeclaration,
  getWebsiteInformationDeclaration,
  // drawChartDeclaration, // Keep commented if not used
  vietnam_getConferencesDeclaration, vietnam_getJournalsDeclaration, vietnam_getWebsiteInformationDeclaration, vietnam_drawChartDeclaration,
  china_getConferencesDeclaration, china_getJournalsDeclaration, china_getWebsiteInformationDeclaration, china_drawChartDeclaration,

} from "./lib/functionsDeclaration"; // Adjust path
import { OutputModality, PrebuiltVoice, Language, ToolCall } from '@/src/app/[locale]/chatbot/lib/types';
import { transformConferenceData } from './utils/transformApiData'; // Adjust path
import { appConfig } from "@/src/middleware"; // Adjust path
import { FunctionDeclaration } from "@google/generative-ai";

interface LiveChatAPIConfigProps {
  outputModality: OutputModality;
  selectedVoice: PrebuiltVoice;
  language: Language;
  systemInstructions: string;
}

function LiveChatAPI({ outputModality, selectedVoice, language, systemInstructions }: LiveChatAPIConfigProps) {
  const { client, setConfig } = useLiveAPIContext();

  // Effect 1: Configure the API client based on props
  useEffect(() => {
    console.log(`Configuring API for: Modality=${outputModality}, Voice=${selectedVoice}, Language=${language}`);

    const modalitiesConfig = outputModality === 'audio' ? ["AUDIO"] : ["TEXT"];
    const generationConfig: any = {
      responseModalities: modalitiesConfig,
    };

    if (outputModality === 'audio') {
      generationConfig.speechConfig = {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: selectedVoice }
        },
      };
    }

    // --- Select Function Declarations based on Language ---
    let activeFunctionDeclarations: FunctionDeclaration[]; // Declare the variable

    if (language === 'vi') {
      console.log("Using Vietnamese function declarations.");
      activeFunctionDeclarations = [
        vietnam_getConferencesDeclaration,
        vietnam_getJournalsDeclaration,
        vietnam_getWebsiteInformationDeclaration,
        // vietnam_drawChartDeclaration, // Add if needed for Vietnamese
      ];
    } else if (language === 'zh') { // Check for Chinese (use ===)
      console.log("Using Chinese function declarations."); // Corrected log message
      activeFunctionDeclarations = [
        china_getConferencesDeclaration,
        china_getJournalsDeclaration,
        china_getWebsiteInformationDeclaration,
        // china_drawChartDeclaration, // Add if needed for Chinese
      ];
    } else { // Default to English (handles 'en' and any other unexpected value)
      console.log("Using English function declarations (default).");
      activeFunctionDeclarations = [
        getConferencesDeclaration,
        getJournalsDeclaration,
        getWebsiteInformationDeclaration,
        // drawChartDeclaration, // Add if needed for English/default
      ];
    }
    // --- End Selection ---


    // Set the configuration including the selected tools
    const finalConfig = {
      model: "models/gemini-2.0-flash-live-001",
      generationConfig: generationConfig,
      systemInstruction: {
        parts: [{ text: systemInstructions }],
      },
      tools: [
        {
          functionDeclarations: activeFunctionDeclarations, // Now guaranteed to be assigned
        },
      ],
    };

    console.log("Setting config with functions:", JSON.stringify(finalConfig.tools, null, 2));
    setConfig(finalConfig);

  }, [setConfig, outputModality, selectedVoice, language, systemInstructions]); // Dependencies are correct


  // Effect 2: Handle Tool Calls - **MUST UPDATE SWITCH CASES FOR CHINESE**
  useEffect(() => {
    const onToolCall = async (toolCall: ToolCall) => {
      console.log(`Got toolcall`, toolCall);
      const NEXT_PUBLIC_DATABASE_URL = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1` || "http://confhub.engineer/api/v1";
      const responses = [];

      for (const fc of toolCall.functionCalls) {
        let apiUrl = '';
        let method: 'GET' | 'POST' = 'POST';
        let body: string | undefined = undefined;
        let headers: HeadersInit = { 'Content-Type': 'application/json' };
        let requiresJsonResponse = false;
        let responseData: any;
        let finalUrl = '';
        let searchQuery: string | undefined = undefined;

        try {
          // --- IMPORTANT: Update switch to handle EN, VN, and ZH names ---
          switch (fc.name) {
            case "getConferences":        // English name
            case "vietnam_getConferences":     // Vietnamese name
            case "china_getConferences":  // Chinese name
              apiUrl = `${NEXT_PUBLIC_DATABASE_URL}/conference`;
              method = 'GET';
              headers = {};
              searchQuery = fc.args && typeof fc.args === 'object' && typeof (fc.args as any).searchQuery === 'string'
                ? (fc.args as any).searchQuery
                : undefined;
              if (!searchQuery) {
                console.warn(`Warning: 'searchQuery' argument missing or invalid for ${fc.name}. Proceeding without search query.`);
                finalUrl = apiUrl;
              } else {
                console.log(`Extracted Conference Search Query for ${fc.name}:`, searchQuery);
                finalUrl = `${apiUrl}?${searchQuery}`;
              }
              requiresJsonResponse = true;
              break;

            case "getJournals":           // English name
            case "vietnam_getJournals":        // Vietnamese name
            case "china_getJournals":     // Chinese name
              apiUrl = `${NEXT_PUBLIC_DATABASE_URL}/api/get_journals`; // Assuming same backend endpoint
              method = 'POST';
              body = JSON.stringify(fc.args);
              finalUrl = apiUrl;
              requiresJsonResponse = true;
              break;

            case "getWebsiteInformation": // English name
            case "vietnam_getWebsiteInformation": // Vietnamese name
            case "china_getWebsiteInformation": // Chinese name
              apiUrl = `${NEXT_PUBLIC_DATABASE_URL}/api/get_website_information`; // Assuming same backend endpoint
              method = 'POST';
              body = JSON.stringify(fc.args);
              finalUrl = apiUrl;
              requiresJsonResponse = true; // Or text, depending on API
              break;

            // case "drawChart": // Keep commented if not used globally
            // case "vietnam_drawChart":
            // case "china_drawChart":
            //   console.warn(`${fc.name} function call received but is currently commented out/disabled.`);
            //   responses.push({ response: { content: { type: "info", message: "Chart drawing is not enabled." } }, id: fc.id });
            //   continue;

            default:
              console.warn(`Unknown function call name received: ${fc.name}`);
              responses.push({ response: { content: { type: "error", message: `Unknown function: ${fc.name}` } }, id: fc.id });
              continue;
          }
          // --- End Switch Update ---

          console.log(`Calling API for ${fc.name} using ${method} at: ${finalUrl}`);
          if (body) console.log('With body:', body);

          const response = await fetch(finalUrl, { method, headers, body });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`API call for ${fc.name} failed with status ${response.status}: ${errorText}`);
            throw new Error(`API Error (${response.status}) for ${fc.name}: ${errorText.substring(0, 200)}`);
          }

          try {
            responseData = requiresJsonResponse ? await response.json() : await response.text();
          } catch (parseError: any) {
            console.error(`Error parsing ${requiresJsonResponse ? 'JSON' : 'text'} response for ${fc.name}:`, parseError);
            const rawText = await response.text(); // Attempt to read as text for debugging
            console.error("Raw response text:", rawText.substring(0, 500));
            throw new Error(`Failed to parse API response for ${fc.name}.`);
          }

          let contentToSend = responseData;
          // Apply transformation only if the function was one of the conference functions
          // And check if data exists and optionally if searchQuery was used
          if ((fc.name === 'getConferences' || fc.name === 'vietnam_getConferences' || fc.name === 'china_getConferences') && responseData) {
             console.log(`Transforming data for ${fc.name}${searchQuery ? ` with query: ${searchQuery}` : ''}`);
             // Pass searchQuery even if undefined, let transform handle it
             contentToSend = transformConferenceData(responseData, searchQuery);
          }

          console.log(`Response data for ${fc.name}:`, contentToSend);
          responses.push({ response: { content: contentToSend }, id: fc.id });

        } catch (error: any) {
          console.error(`Error processing function call ${fc.name}:`, error);
          let errorMessage = error.message || "An unexpected error occurred processing the tool call.";
          if (errorMessage.length > 300) errorMessage = errorMessage.substring(0, 297) + "...";
          responses.push({ response: { content: { type: "error", message: `Failed to execute ${fc.name}: ${errorMessage}` } }, id: fc.id });
        }
      } // End for loop

      if (responses.length > 0) {
        console.log("Sending tool responses:", JSON.stringify(responses, null, 2));
        client.sendToolResponse({ functionResponses: responses });
      } else {
        console.log("No responses generated for this tool call batch.");
      }
    };

    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client]); // Keep dependency array simple for tool call handler

  return null;
}

export const LiveChatAPIConfig = memo(LiveChatAPI);