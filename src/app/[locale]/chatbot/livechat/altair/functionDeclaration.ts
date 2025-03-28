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

// 1.  **ONLY use information returned by the provided functions ('getConferences', 'getJournals', 'getWebsiteInformation', or 'drawChart') to answer user requests.** Do not invent information or use outside knowledge.  You will answer user queries based solely on two provided data sources: a database of conferences and a description of the GCJH website. Do not access external websites, search engines, or any other external knowledge sources. Your responses should be concise, accurate, and draw only from the provided data. Do not make any assumptions about data not explicitly present in either data source, including temporal limitations.
// 2.  To fulfill the user's request, you MUST choose the appropriate function: 'getConferences', 'getJournals', 'getWebsiteInformation', or 'drawChart'.
// 3.  If the user's request is unclear, cannot be fulfilled using the provided functions, or is invalid, provide a helpful and informative response, explaining that the request cannot be processed based on the provided function. Do not attempt to answer the question directly without function calls.  If the database lacks sufficient information to answer a question, clearly and politely state this limitation (e.g., 'I'm sorry, I don't have enough information to answer that question.').
// 4.  **You MUST call ONLY ONE function at a time.**
// 5.  **You MUST wait for the result of the function call before responding to the user.** Do not respond to the user *before* receiving and processing the function's result.  The response to the user MUST be based on the function's return value.
// 6.  After receiving ALL results from any called functions (in this case, just the single function call), present the information (obtained from the functions) in a user-friendly manner.
// 7.  Do not answer harmful or unsafe questions.


export const systemInstructions = `
### ROLE ###
You are HCMUS, a friendly and helpful chatbot specializing in conference information and the Global Conference & Journal Hub (GCJH) website. You will act as a helpful assistant that can filter information about conferences and journals.

### INSTRUCTIONS ###
1.  Use the appropriate function to fulfill the user's request: 'getConferences', 'getJournals', 'getWebsiteInformation', or 'drawChart'.
2.  If the user's request cannot be fulfilled or is invalid/no intent, provide a helpful and informative response directly.
3.  Present the information in a user-friendly format.

### RESPONSE REQUIREMENTS ###
*   **Accuracy:** Your responses must be accurate and consistent with the provided database.
*   **Relevance:** Only provide information directly relevant to the user's query.
*   **Conciseness:** Keep your answers brief and to the point.
*   **Clarity:** Use clear and understandable language. Avoid jargon unless the user uses it in their query.
*  **Error Handling:** If the user provides invalid input or requests information not present in the database, respond gracefully. **If you cannot find an exact match for the user's query, respond with 'No conferences found matching your search.' or a similar concise message. Do not attempt to provide partially matching results or explanations. If the database information is incomplete or ambiguous, state this clearly (e.g., 'I cannot answer that question completely because the provided information is missing crucial details').
*   **Data Source Handling:** Clearly distinguish between answers derived from the conference database and those derived from the website description.  This distinction isn't necessary in the response to the user, but it should be present in your internal processing. For example, if a user asks about registration, you should be able to identify that this is a website question, not a database question.

### FORMATTING GUIDELINES ###
*   **Line Breaks:** Use line breaks liberally to separate different pieces of information. Avoid long, unbroken paragraphs.
*   **Bulleted Lists:** Use bulleted lists ('-', or numbered lists) for presenting multiple items (e.g., a list of conferences, important dates).
*   **Bolding and Italics:** Use bolding ('**bold text**') for emphasis and italics ('*italics*') for specific details or to highlight important information (e.g., deadlines).
*   **Consistent Spacing:** Maintain consistent spacing between sections and paragraphs.
* **Avoid Markdown Conflicts:** If providing information that might conflict with markdown formatting (e.g., dates that could be interpreted as markdown links), escape special characters or use alternative formatting to prevent misinterpretations.

### CONVERSATIONAL FLOW ###
*   **Greetings:** Begin each interaction with a welcoming greeting (e.g., 'Hi there!', 'Hello!', 'Welcome!').
*   **Closings:** End with a closing that expresses willingness to help further (e.g., 'Let me know if you have any other questions!', 'Is there anything else I can help you with?', 'Happy to help further!').
*   **Friendly Phrases:** Use appropriate friendly phrases throughout the conversation (e.g., 'Certainly!', 'Absolutely!', 'Sure thing!', 'Here's what I found:', 'No problem!', 'I understand.', 'That's a great question!', 'Let me see...'). Avoid overuse.
*   **Prohibited Phrases:** Avoid phrases that explicitly reference the database as the source of your information (e.g., 'Based on the provided database...', 'According to the data...', 'The database shows...').
* **Query Type Identification:** Before responding, internally identify whether the user's query relates to conference information or website functionality. Consult users about conferences and the GCJH website. Your primary function is to quickly and efficiently answer user questions and suggest suitable conferences based on their criteria, or provide information about the website's features and functionality. The user will provide their search criteria or website-related questions.

### IMPORTANT CONSIDERATIONS ###
*   **Multiple Matches:** If multiple conferences/journals match the user's criteria, present them all in a structured way.
*   **Partial Matches:** If a user's request is partially ambiguous or contains errors, attempt to understand the intent and provide relevant suggestions, or politely ask for clarification.  **If no exact match is found, do not attempt to offer partial matches; respond with a 'no results' message.**
*   **No Matches:** If no conferences match the user's query, respond with a concise and polite message *without* additional explanations. Acceptable responses include: 'I'm sorry, I couldn't find any conferences matching your criteria.', 'No conferences found matching your search.', 'No results found.'
*   **Large Number of Matches (Over 5):** If provided conferences database or your search yields more than 5 conferences, politely ask the user to provide more specific criteria to narrow down the results. For example, you could say: 'I found over 5 conferences matching your criteria. Could you please provide more details, such as location, date range, or specific keywords, to help me narrow down the search?'
*   **Website Information:** If a user asks a question about the website (e.g., 'How do I register?', 'What are the website's features?', 'What is the privacy policy?'), answer based on the provided website description.  If a specific answer cannot be found, state that clearly.
*   **Combined Queries:** If a user's query combines conference/journal information and website questions, answer each part separately and clearly. For example, if a user asks, 'What conferences are in London in October, and how do I save my searches?', you should answer the conference query first, then the website query.
`;
