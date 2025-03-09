"use client";

import { type FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { useEffect, useRef, useState, memo } from "react";
// import vegaEmbed from "vega-embed";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { ToolCall } from "../../multimodal-live-types";

export const systemInstructions = `Act as a helpful assistant that can filter information about conferences and journals. Your role is to understand the user's request and use the informationFiltering function to filter the information accordingly.

### INSTRUCTIONS ###
1.  If the user's request requires filtering conference or journal information, use the 'informationFiltering' function.
2.  After the 'informationFiltering' function returns its results, use that information to generate a concise and helpful response to the user.
3.  Present the information in a user-friendly format. If no results are found, clearly state that no matching information was found.

Do not answer harmful or unsafe questions.`;

export const declarations: FunctionDeclaration = 
  {
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
          "enum": [
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
      "Filter journal": {
        "type": SchemaType.OBJECT,
        "description": "Filters for journal information.",
        "properties": {
          "Rank": {
            "type": SchemaType.ARRAY,
            "description": "List of journal ranks to filter by.",
            "items": {
              "type": SchemaType.NUMBER
            }
          },
          "Title": {
            "type": SchemaType.ARRAY,
            "description": "List of journal titles to filter by.",
            "items": {
              "type": SchemaType.STRING
            }
          },
          "Issn": {
            "type": SchemaType.ARRAY,
            "description": "List of journal ISSNs to filter by.",
            "items": {
              "type": SchemaType.STRING
            }
          },
          "SJR": {
            "type": SchemaType.ARRAY,
            "description": "List of journal SJR values to filter by.",
            "items": {
              "type": SchemaType.NUMBER
            }
          },
          "SJR Best Quartile": {
            "type": SchemaType.ARRAY,
            "description": "List of journal SJR Best Quartile values to filter by.",
            "items": {
              "type": SchemaType.STRING
            }
          },
          "H index": {
            "type": SchemaType.NUMBER,
            "description": "Journal H index to filter by."
          },
          "Country": {
            "type": SchemaType.ARRAY,
            "description": "List of countries to filter journals by.",
            "items": {
              "type": SchemaType.STRING
            }
          },
          "Region": {
            "type": SchemaType.ARRAY,
            "description": "List of regions to filter journals by.",
            "items": {
              "type": SchemaType.STRING
            }
          },
          "Publisher": {
            "type": SchemaType.ARRAY,
            "description": "List of publishers to filter journals by.",
            "items": {
              "type": SchemaType.STRING
            }
          },
          "Areas": {
            "type": SchemaType.ARRAY,
            "description": "List of areas to filter journals by.",
            "items": {
              "type": SchemaType.STRING
            }
          },
          "Categories": {
            "type": SchemaType.ARRAY,
            "description": "List of categories to filter journals by.",
            "items": {
              "type": SchemaType.STRING
            }
          },
          "Overton": {
            "type": SchemaType.ARRAY,
            "description": "List of Overton values to filter journals by.",
            "items": {
              "type": SchemaType.NUMBER
            }
          },
          "SDG": {
            "type": SchemaType.ARRAY,
            "description": "List of SDGs to filter journals by.",
            "items": {
              "type": SchemaType.STRING
            }
          }
        }
      },
      "Redirect": {
        "type": SchemaType.OBJECT,
        "description": "Information for redirection.",
        "properties": {
          "Type": {
            "type": SchemaType.STRING,
            "description": "The type of website to redirect to.",
            format: "enum",
            "enum": [
              "Internal website",
              "Conference website",
              "Journal website",
              "Invalid"
            ]
          },
          "Value": {
            "type": SchemaType.STRING,
            "description": "The URL to redirect to."
          },
          "Message": {
            "type": SchemaType.STRING,
            "description": "A message to display upon redirection."
          }
        },
        "required": [
          "Type",
          "Message"
        ]
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
interface FunctionCallResponse {
  name: string;
  args: any;
}

interface MyFunctionDeclaration extends FunctionDeclaration {
  callback: (args: any) => Promise<any>;
}

// Define the types for your filter objects.  This makes the code much more robust.
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
  Value?: string;  // Make Value optional since it might not be present for "Invalid"
  Message: string;
}

interface InformationFilteringArgs {
  Intent: ("No intent" | "Find information" | "Draw chart" | "Website navigation" | "Invalid")[];
  About: "Conference" | "Journal" | "Website" | "Invalid";
  "Filter conference"?: ConferenceFilter;
  "Filter journal"?: JournalFilter;
  Redirect?: RedirectInfo;
  Description: string;
}

const functionDeclarations = declarations.map(declaration: => ({
  ...declaration,
  callback: async (args) => {
    console.log("Function called:", declaration.name);
    console.log("Arguments:", args);

    // 1. Process the function arguments (the 'args' object)
    //    to filter the data and obtain the results.  This is
    //    where you integrate with your data sources.

    let filterResults; // This will hold the results of your filtering.

    try {
      const userIntent = args; // Directly using args as the UserIntent

      if (userIntent?.Intent?.includes("Draw chart")) {
        console.log('Intent: Draw chart');
        filterResults = await handleDrawChartIntent(userIntent, "Chart");

      } else if (userIntent?.Intent?.includes("Website navigation")) {
        console.log('Intent: Website navigation');
        filterResults = await handleWebsiteNavigationIntent(userIntent);

      } else if (userIntent?.Intent?.includes("Find information")) {
        console.log('Intent: Find information');
        if (userIntent.About === "Conference") {
          console.log('About: Conference');
          filterResults = await handleFindInformationConferenceIntent(userIntent);


        } else if (userIntent.About === "Journal") {
          console.log('About: Journal');
          filterResults = await handleFindInformationJournalIntent(userIntent);


        } else if (userIntent.About === "Website") {
          console.log('About: Website');
          filterResults = await handleFindInformationWebsiteIntent(userIntent);

        } else {
          console.log(`Invalid 'About' property: ${userIntent.About}`);
          filterResults = {
            type: "error",
            message: "Invalid 'About' property for 'Find information' intent.",
          };
        }

      } else if (userIntent?.Intent?.includes("No intent")) {
        console.log('Intent: No intent');
        filterResults = { message: await handleNoIntent() };

      } else if (userIntent?.Intent?.includes("Invalid")) {
        console.log('Intent: Invalid');
        filterResults = { message: await handleInvalidIntent(userIntent) };

      } else {
        console.log(`Could not determine intent.  Intent list: ${userIntent?.Intent}`);
        filterResults = {
          type: "error",
          message: "Could not determine the intent.",
        };
      }
    } catch (error: any) {
      console.error(`Error processing user intent: ${error.message}, Stack: ${error.stack}`);
      filterResults = {
        type: "error",
        message: error.message || "An unexpected error occurred.",
      };
    }

    // 2. Return the results to the LLM so it can generate a user-friendly response.
    //    The LLM will then use this data in the 'generateContent' call.
    return filterResults; // Crucially, return the results.
  },
}));

function AltairComponent() {
  const [jsonString, setJSONString] = useState<string>("");
  const { client, setConfig } = useLiveAPIContext();

  useEffect(() => {
    setConfig({
      model: "models/gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: "audio",
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
        },
      },
      systemInstruction: {
        parts: [
          {
            text: systemInstructions,
          },
        ],
      },
      tools: [
        { googleSearch: {} },
        { functionDeclarations: [declaration] },
      ],
    });
  }, [setConfig]);

  useEffect(() => {
    const onToolCall = (toolCall: ToolCall) => {
      console.log(`got toolcall`, toolCall);
      const fc = toolCall.functionCalls.find(
        (fc) => fc.name === declaration.name,
      );
      if (fc) {
        const str = (fc.args as any).json_graph;
        setJSONString(str);
      }
      // send data for the response of your tool call
      // in this case Im just saying it was successful
      if (toolCall.functionCalls.length) {
        setTimeout(
          () =>
            client.sendToolResponse({
              functionResponses: toolCall.functionCalls.map((fc) => ({
                response: { output: { success: true } },
                id: fc.id,
              })),
            }),
          200,
        );
      }
    };
    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client]);

  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (embedRef.current && jsonString) {
      // vegaEmbed(embedRef.current, JSON.parse(jsonString));
    }
  }, [embedRef, jsonString]);
  return <div className="vega-embed" ref={embedRef} />;
}

export const Altair = memo(AltairComponent);
