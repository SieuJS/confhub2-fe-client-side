import {
  FunctionDeclaration,
  SchemaType,
} from "@google/generative-ai";


// --- Function Declarations ---
export const getConferencesDeclaration: FunctionDeclaration = {
  name: "getConferences",
  description: "Retrieves information about conferences based on filtering criteria.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
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
      "ConferencesNameList": {
        "type": SchemaType.ARRAY,
        "description": "List of conference names to filter by.",
        "items": {
          "type": SchemaType.STRING
        }
      },
      "ConferencesAcronymList": {
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
      "ConferenceDates": {
        "type": SchemaType.STRING,
        "description": "Conference dates to filter by."
      },
      "SubmisionDate": {
        "type": SchemaType.STRING,
        "description": "Submission date to filter by."
      },
      "NotificationDate": {
        "type": SchemaType.STRING,
        "description": "Notification date to filter by."
      },
      "CameraReadyDate": {
        "type": SchemaType.STRING,
        "description": "Camera ready date to filter by."
      },
      "RegistrationDate": {
        "type": SchemaType.STRING,
        "description": "Registration date to filter by."
      }
    }
  },
};

export const getJournalsDeclaration: FunctionDeclaration = {
  name: "getJournals",
  description: "Retrieves information about journals based on filtering criteria.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
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
      "SJRBestQuartile": {
        "type": SchemaType.ARRAY,
        "description": "List of journal SJR Best Quartile values to filter by.",
        "items": {
          "type": SchemaType.STRING
        }
      },
      "HIndex": {
        "type": SchemaType.INTEGER,
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
};

export const getWebsiteInformationDeclaration: FunctionDeclaration = {
  name: "getWebsiteInformation",
  description: "Retrieves information about websites.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      website: {
        type: SchemaType.STRING,
        description: "Website information, ALWAYS value is website",
      },
    }, 
  },
};

export const drawChartDeclaration: FunctionDeclaration = {
  name: "drawChart",
  description: "Draws a chart based on the provided data.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      chartType: {
        type: SchemaType.STRING,
        description: "The type of chart (e.g., bar, line, pie).",
      }
    },
    required: ["chartType"],
  },
};


export const systemInstructions = `Act as a helpful assistant that can filter information about conferences and journals.

### INSTRUCTIONS ###
1.  **ONLY use information returned by the provided functions ('getConferences', 'getJournals', 'getWebsiteInformation', or 'drawChart') to answer user requests.** Do not invent information or use outside knowledge.
2.  To fulfill the user's request, you MUST choose the appropriate function: 'getConferences', 'getJournals', 'getWebsiteInformation', or 'drawChart'.
3.  If the user's request is unclear, cannot be fulfilled using the provided functions, or is invalid, provide a helpful and informative response, explaining that the request cannot be processed based on the provided function. Do not attempt to answer the question directly without function calls.
4.  **You MUST call ONLY ONE function at a time.**
5.  **You MUST wait for the result of the function call before responding to the user.** Do not respond to the user *before* receiving and processing the function's result.  The response to the user MUST be based on the function's return value.
6.  After receiving ALL results from any called functions (in this case, just the single function call), present the information (obtained from the functions) in a user-friendly manner.

Do not answer harmful or unsafe questions.`;