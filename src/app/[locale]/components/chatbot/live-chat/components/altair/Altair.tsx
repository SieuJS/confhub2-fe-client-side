"use client";

// frontend/Altair.tsx (React)
import { type FunctionDeclaration, SchemaType, FunctionDeclarationSchema } from "@google/generative-ai";
import { useEffect, useState, memo, useRef } from "react"; // Or your UI library

// --- Your Data Handling Functions (Adapted for TypeScript) ---
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { ToolCall } from "../../multimodal-live-types";

interface UserIntent {
  Intent: ("No intent" | "Find information" | "Draw chart" | "Website navigation" | "Invalid")[];
  About?: "Conference" | "Journal" | "Website" | "Invalid";
  "Filter conference"?: ConferenceFilter;
  "Filter journal"?: JournalFilter;
  Redirect?: RedirectInfo;
  Description: string;
}

interface ConferenceFilter {
  Topics?: string[];
  Country?: string[];
  "Conferences name list"?: string[];
  "Conferences acronym list"?: string[];
  Type?: ("Hybrid" | "Offline" | "Online")[];
  Rank?: ("A*" | "A" | "B" | "C" | "National" | "Regional" | "Unranked")[];
  Continent?: ("Asia" | "Africa" | "North America" | "South America" | "Oceania" | "Europe")[];
  "Conference dates"?: string;
  "Submision date"?: string;
  "Notification date"?: string;
  "Camera-ready date"?: string;
  "Registration date"?: string;
}

interface JournalFilter {
  Rank?: number[];
  Title?: string[];
  Issn?: string[];
  SJR?: number[];
  "SJR Best Quartile"?: string[];
  "H index"?: number;
  Country?: string[];
  Region?: string[];
  Publisher?: string[];
  Areas?: string[];
  Categories?: string[];
  Overton?: number[];
  SDG?: string[];
}

interface RedirectInfo {
  Type: "Internal website" | "Conference website" | "Journal website" | "Invalid";
  Value?: string;  // Optional, as per your original schema.
  Message: string;
}

// --- Function Declaration ---

const informationFilteringDeclaration: FunctionDeclaration = {
  "name": "informationFiltering",
  "description": "Filters information about conferences or journals based on specified criteria.",
  "parameters": {
    "type": SchemaType.OBJECT,
    "properties": {
      "Intent": {
        "type": SchemaType.ARRAY,
        "description": "The intent of the user's request.",
        "items": {
          "type": SchemaType.STRING,
          format: "enum",
          enum: [
            "No intent",
            "Find information",
            "Draw chart",
            "Website navigation",
            "Invalid"
          ]
        }
      },
      "About": {
        "type": SchemaType.STRING,
        format: "enum",
        "description": "The type of information the user is requesting.",
        "enum": [
          "Conference",
          "Journal",
          "Website",
          "Invalid"
        ]
      },
      "Filter conference": {
        "type": SchemaType.OBJECT,
        "description": "Filters for conference information.",
        "properties": {
          "Topics": {
            "type": SchemaType.ARRAY,
            "description": "List of topics to filter conferences by.",
            "items": {
              "type": SchemaType.STRING
            }
          },
          "Country": {
            "type": SchemaType.ARRAY,
            "description": "List of countries to filter conferences by.",
            "items": {
              "type": SchemaType.STRING
            }
          },
          "Conferences name list": {
            "type": SchemaType.ARRAY,
            "description": "List of conference names to filter by.",
            "items": {
              "type": SchemaType.STRING
            }
          },
          "Conferences acronym list": {
            "type": SchemaType.ARRAY,
            "description": "List of conference acronyms to filter by.",
            "items": {
              "type": SchemaType.STRING
            }
          },
          "Type": {
            "type": SchemaType.ARRAY,
            "description": "List of conference types (Hybrid, Offline, Online) to filter by.",
            "items": {
              "type": SchemaType.STRING,
              format: "enum",
              "enum": [
                "Hybrid",
                "Offline",
                "Online"
              ]
            }
          },
          "Rank": {
            "type": SchemaType.ARRAY,
            "description": "List of conference ranks to filter by.",
            "items": {
              "type": SchemaType.STRING,
              format: "enum",

              "enum": [
                "A*",
                "A",
                "B",
                "C",
                "National",
                "Regional",
                "Unranked"
              ]
            }
          },
          "Continent": {
            "type": SchemaType.ARRAY,
            "description": "List of continents to filter conferences by.",
            "items": {
              "type": SchemaType.STRING,
              format: "enum",

              "enum": [
                "Asia",
                "Africa",
                "North America",
                "South America",
                "Oceania",
                "Europe"
              ]
            }
          },
          "Conference dates": {
            "type": SchemaType.STRING,
            "description": "Conference dates to filter by."
          },
          "Submision date": {
            "type": SchemaType.STRING,
            "description": "Submission date to filter by."
          },
          "Notification date": {
            "type": SchemaType.STRING,
            "description": "Notification date to filter by."
          },
          "Camera-ready date": {
            "type": SchemaType.STRING,
            "description": "Camera-ready date to filter by."
          },
          "Registration date": {
            "type": SchemaType.STRING,
            "description": "Registration date to filter by."
          }
        }
      },
      "Description": {
        "type": SchemaType.STRING,
        "description": "A description of the information being requested or filtered."
      }
    },
    "required": [
      "Intent",
      "Description"
    ]
  }

};

const systemInstructions = `Act as a helpful assistant that can filter information about conferences and journals. Your role is to understand the user's request and use the informationFiltering function to filter the information accordingly.

### INSTRUCTIONS ###
1.  If the user's request requires filtering conference or journal information, use the 'informationFiltering' function.
2.  After the 'informationFiltering' function returns its results, use that information to generate a concise and helpful response to the user.
3.  Present the information in a user-friendly format. If no results are found, clearly state that no matching information was found.

Do not answer harmful or unsafe questions.
`;

// --- React Component and API Integration (using a hypothetical `useLiveAPIContext`) ---
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
        { googleSearch: {} }, // Nếu bạn có công cụ tìm kiếm Google
        { functionDeclarations: [informationFilteringDeclaration] },
      ],

    });
  }, [setConfig]);

  useEffect(() => {
    const onToolCall = async (toolCall: ToolCall) => {
      console.log(`got toolcall`, toolCall);
      const fc = toolCall.functionCalls.find(
        (fc) => fc.name === informationFilteringDeclaration.name
      );

      if (fc && toolCall.functionCalls.length) {

        if (!fc.args) {
          throw new Error("fc.args is undefined");
        }

        const userIntent: UserIntent = fc.args as UserIntent;
        const response = await fetch('http://localhost:3000/api/process_intent', { // Gọi API backend
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userIntent),
        });

        if (!response.ok) {
          throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
        }
        console.log("http://localhost:3000/api/process_intent");

        const filterResults = await response.json();
        setTimeout(
          () =>
            client.sendToolResponse({
              functionResponses: toolCall.functionCalls.map((f) => ({
                response: { output: filterResults },
                id: f.id
              }))
            }),
          3000,
        );
      }
    };
    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client]); // Thêm setConfig vào dependency array



  return <div className="vega-embed" />;
}

export const Altair = memo(AltairComponent); // Sử dụng memo để tối ưu hóa hiệu suất



// "use client";

// import { type FunctionDeclaration, SchemaType } from "@google/generative-ai";
// import { useEffect, useRef, useState, memo } from "react";
// // import vegaEmbed from "vega-embed";
// import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
// import { ToolCall } from "../../multimodal-live-types";

// const declaration: FunctionDeclaration = {
//   name: "render_altair",
//   description: "Displays an altair graph in json format.",
//   parameters: {
//     type: SchemaType.OBJECT,
//     properties: {
//       json_graph: {
//         type: SchemaType.STRING,
//         description:
//           "JSON STRING representation of the graph to render. Must be a string, not a json object",
//       },
//     },
//     required: ["json_graph"],
//   },
// };

// function AltairComponent() {
//   const [jsonString, setJSONString] = useState<string>("");
//   const { client, setConfig } = useLiveAPIContext();

//   useEffect(() => {
//     setConfig({
//       model: "models/gemini-2.0-flash-exp",
//       generationConfig: {
//         responseModalities: "audio",
//         speechConfig: {
//           voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
//         },
//       },
//       systemInstruction: {
//         parts: [
//           {
//             text: 'You are my helpful assistant. Any time I ask you for a graph call the "render_altair" function I have provided you. Dont ask for additional information just make your best judgement.',
//           },
//         ],
//       },
//       tools: [
//         // there is a free-tier quota for search
//         { googleSearch: {} },
//         { functionDeclarations: [declaration] },
//       ],
//     });
//   }, [setConfig]);

//   useEffect(() => {
//     const onToolCall = (toolCall: ToolCall) => {
//       console.log(`got toolcall`, toolCall);
//       const fc = toolCall.functionCalls.find(
//         (fc) => fc.name === declaration.name,
//       );
//       if (fc) {
//         const str = (fc.args as any).json_graph;
//         console.log(str);
//         setJSONString(str);
//       }
//       // send data for the response of your tool call
//       // in this case Im just saying it was successful
//       if (toolCall.functionCalls.length) {
//         setTimeout(
//           () =>
//             client.sendToolResponse({
//               functionResponses: toolCall.functionCalls.map((fc) => ({
//                 response: { output: { success: true } },
//                 id: fc.id,
//               })),
//             }),
//           200,
//         );
//       }
//     };
//     client.on("toolcall", onToolCall);
//     return () => {
//       client.off("toolcall", onToolCall);
//     };
//   }, [client]);

//   const embedRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (embedRef.current && jsonString) {
//       // vegaEmbed(embedRef.current, JSON.parse(jsonString));
//     }
//   }, [embedRef, jsonString]);
//   return <div className="vega-embed" ref={embedRef} />;
// }

// export const Altair = memo(AltairComponent);
