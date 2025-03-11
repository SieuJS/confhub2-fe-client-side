"use client";
import { useEffect, memo, useRef } from "react";
import { useLiveAPIContext } from "../contexts/LiveAPIContext"; // Thay đổi đường dẫn import nếu cần
import { ToolCall } from "../multimodal-live-types";


import { getConferencesDeclaration, getJournalsDeclaration, getWebsiteInformationDeclaration, drawChartDeclaration, systemInstructions } from "./functionDeclaration"
function AltairComponent() {
  const { client, setConfig } = useLiveAPIContext();

  useEffect(() => {
    setConfig({
      model: "models/gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: "audio", // Nếu bạn muốn phản hồi bằng giọng nói
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
        },
      },
      systemInstruction: {
        parts: [{ text: systemInstructions }],
      },
      tools: [
        {
          functionDeclarations: [
            getConferencesDeclaration,
            getJournalsDeclaration,
            getWebsiteInformationDeclaration,
            // drawChartDeclaration,
          ],
        },
      ],
    });
  }, [setConfig]);

  useEffect(() => {
    const onToolCall = async (toolCall: ToolCall) => {
      console.log(`got toolcall`, toolCall);


      const BASE_URL = "http://localhost:3000";
      console.log(BASE_URL);
      // Không cần tìm kiếm function call cụ thể nữa, xử lý tất cả
      for (const fc of toolCall.functionCalls) {
        try {
          let responseData;
          if (fc.name === "getConferences") {
            const response = await fetch(`${BASE_URL}/api/get_conferences`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(fc.args),
            });
            responseData = await response.json();
          }
          else if (fc.name === "getJournals") {
            const response = await fetch(`${BASE_URL}/api/get_journals`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(fc.args),
            });
            responseData = await response.json();
          }
          else if (fc.name === "getWebsiteInformation") {
            const response = await fetch(`${BASE_URL}/api/get_website_information`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(fc.args),
            });
            responseData = await response.json();
          }
          else if (fc.name === "drawChart") {
            const response = await fetch(`${BASE_URL}/api/draw_chart`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(fc.args),
            });
            responseData = await response.json();
          }
          // else if (fc.name === "yourResponse") {
          //   // Khi gặp yourResponse, gửi phản hồi cuối cùng
          //   const finalResponse = await (fc.args as any).finalResponse; // Lấy nội dung phản hồi
          //   console.log("Final Response:", finalResponse);
          //   responseData = finalResponse
          //   // continue
          // }
          else {
            console.warn(`Unknown function call: ${fc.name}`);
            continue;
          }

          client.sendToolResponse({
            functionResponses: toolCall.functionCalls.map((fc) => ({
              response: { content: responseData },
              id: fc.id,
            }))
          });

        } catch (error: any) {
          console.error(`Error calling API for ${fc.name}:`, error);
          client.sendToolResponse({
            functionResponses: toolCall.functionCalls.map((fc) => ({
              response: { content: { type: "error", message: error.message || "An unexpected error occurred." } },
              id: fc.id,
            }))
          });
        }
      }
    };

    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client]);

  return null; // Hoặc các component UI của bạn
}

export const Altair = memo(AltairComponent);