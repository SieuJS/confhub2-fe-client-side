// src/app/[locale]/chatbot/livechat/services/tool.handlers.ts
// import { FunctionCall } from "@google/generative-ai"; // No longer need the direct import if LiveFunctionCall is used
import { LiveFunctionCall } from '../../lib/live-chat.types'; // Correctly import your custom type
import {
  getAuthTokenClientSide,
  makeFrontendApiCall,
  fetchItemDetailsFromApi,
  formatItemsForModel,
  getUrlArg
} from '../utils/api.helpers';
import { websiteInfo } from "../../lib/functions";
import { transformConferenceData } from '../../utils/transformApiData';
import { appConfig } from "@/src/middleware";

// Define a common config type for handlers
interface HandlerConfig {
  databaseUrl: string;
  frontendUrl: string;
  currentLocale: string;
}

// Define a structure for the response part needed by client.sendToolResponse
export interface ToolHandlerResponse { // Export if needed elsewhere, or keep local
  response: { content: any };
  id: string;
}

// Individual Handlers - Update fc type to LiveFunctionCall
async function handleGetConferences(fc: LiveFunctionCall, config: HandlerConfig): Promise<ToolHandlerResponse> {
  const apiUrl = `${config.databaseUrl}/conference`;
  const searchQuery = fc.args && typeof fc.args === 'object' && typeof (fc.args as any).searchQuery === 'string'
    ? (fc.args as any).searchQuery
    : undefined;
  const finalUrl = searchQuery ? `${apiUrl}?${searchQuery}` : apiUrl;

  console.log(`Calling API for getConferences using GET at: ${finalUrl}`);
  const response = await fetch(finalUrl, { method: 'GET', headers: {} });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}) for getConferences: ${errorText.substring(0, 200)}`);
  }
  const responseData = await response.json();
  const contentToSend = transformConferenceData(responseData, searchQuery);
  return { response: { content: contentToSend }, id: fc.id }; // Now fc.id is valid
}

async function handleGetJournals(fc: LiveFunctionCall, config: HandlerConfig): Promise<ToolHandlerResponse> {
  const apiUrl = `${config.databaseUrl}/journal`;
  const searchQuery = fc.args && typeof fc.args === 'object' && typeof (fc.args as any).searchQuery === 'string'
    ? (fc.args as any).searchQuery
    : undefined;
  const finalUrl = searchQuery ? `${apiUrl}?${searchQuery}` : apiUrl;

  console.log(`Calling API for getJournals using GET at: ${finalUrl}`);
  const response = await fetch(finalUrl, { method: 'GET', headers: {} });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}) for getJournals: ${errorText.substring(0, 200)}`);
  }
  const responseData = await response.json();
  return { response: { content: responseData }, id: fc.id }; // Now fc.id is valid
}

async function handleGetWebsiteInfo(fc: LiveFunctionCall, _config: HandlerConfig): Promise<ToolHandlerResponse> {
  return { response: { content: websiteInfo }, id: fc.id }; // Now fc.id is valid
}

async function handleNavigation(fc: LiveFunctionCall, config: HandlerConfig): Promise<ToolHandlerResponse> {
  const targetUrl = getUrlArg(fc.args);
  if (!targetUrl) throw new Error("Missing 'url' argument for navigation.");

  let urlToOpen = '';
  if (targetUrl.startsWith('/')) {
    if (!config.currentLocale) throw new Error("Locale unavailable for internal link.");
    urlToOpen = `${config.frontendUrl}/${config.currentLocale}${targetUrl}`;
  } else if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
    urlToOpen = targetUrl;
  } else {
    throw new Error(`Invalid 'url' format: ${targetUrl}.`);
  }

  if (typeof window !== 'undefined') {
    window.open(urlToOpen, '_blank', 'noopener,noreferrer');
  } else {
    console.warn("window object not available for navigation.");
  }
  return { response: { content: { message: `Navigating to ${urlToOpen}`, status: 'success' } }, id: fc.id }; // Now fc.id is valid
}

async function handleManageFollow(fc: LiveFunctionCall, config: HandlerConfig): Promise<ToolHandlerResponse> {
  const args = fc.args as any;
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
    const listUrl = `${config.databaseUrl}/${itemType === 'conference' ? 'follow-conference' : 'follow-journal'}/followed`;
    const followedItems = await makeFrontendApiCall(listUrl, 'GET', token);
    modelMessage = formatItemsForModel(followedItems, itemType);
  } else { // 'follow' or 'unfollow'
    if (!identifier || !identifierType) {
      throw new Error(`'identifier' and 'identifierType' are required for '${action}' action.`);
    }
    if (!['acronym', 'title', 'id'].includes(identifierType)) {
      throw new Error("Invalid 'identifierType'. Must be 'acronym', 'title', or 'id'.");
    }

    const itemDetails = await fetchItemDetailsFromApi(identifier, identifierType, itemType, config.databaseUrl);
    const itemId = itemDetails.id;
    const itemName = itemDetails.name;

    const actionUrl = `${config.databaseUrl}/${itemType === 'conference' ? 'follow-conference' : 'follow-journal'}/${action === 'follow' ? 'add' : 'remove'}`;
    const payload = itemType === 'conference' ? { conferenceId: itemId } : { journalId: itemId };

    await makeFrontendApiCall(actionUrl, 'POST', token, payload);
    modelMessage = `Successfully ${action === 'follow' ? 'followed' : 'unfollowed'} ${itemType}: "${itemName}".`;
  }
  return { response: { content: modelMessage }, id: fc.id }; // Now fc.id is valid
}

async function handleManageCalendar(fc: LiveFunctionCall, config: HandlerConfig): Promise<ToolHandlerResponse> {
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
  if (action === 'list') {
    const listUrl = `${config.databaseUrl}/calendar/events`;
    const calendarItems = await makeFrontendApiCall(listUrl, 'GET', token);
    modelMessage = formatItemsForModel(calendarItems, 'conference in calendar');
  } else {
    if (!identifier || !identifierType) {
      throw new Error(`'identifier' and 'identifierType' are required for '${action}' action on calendar.`);
    }
    if (!['acronym', 'title', 'id'].includes(identifierType)) {
      throw new Error("Invalid 'identifierType'. Must be 'acronym', 'title', or 'id'.");
    }

    const itemDetails = await fetchItemDetailsFromApi(identifier, identifierType, "conference", config.databaseUrl);
    const itemId = itemDetails.id;
    const itemName = itemDetails.name;

    const apiAction = action === 'add' ? 'add-event' : 'remove-event';
    const actionUrl = `${config.databaseUrl}/calendar/${apiAction}`;
    const payload = { conferenceId: itemId };

    await makeFrontendApiCall(actionUrl, 'PUT', token, payload);
    modelMessage = `Successfully ${action === 'add' ? 'added' : 'removed'} conference "${itemName}" ${action === 'add' ? 'to' : 'from'} your calendar.`;
  }
  return { response: { content: modelMessage }, id: fc.id }; // Now fc.id is valid
}

async function handleOpenGoogleMap(fc: LiveFunctionCall, _config: HandlerConfig): Promise<ToolHandlerResponse> {
  const args = fc.args as any;
  const location = args?.location as string | undefined;

  if (!location || typeof location !== 'string' || location.trim() === '') {
    throw new Error("Missing or invalid 'location' argument for openGoogleMap.");
  }

  return {
    response: {
      content: {
        messageForModel: `Map for "${location}" is being prepared for display.`,
        uiAction: {
          type: "display_map",
          location: location,
        }
      }
    },
    id: fc.id // Now fc.id is valid
  };
}

// Dispatcher for tool handlers - Update fc type to LiveFunctionCall
export const toolHandlers: Record<string, (fc: LiveFunctionCall, config: HandlerConfig) => Promise<ToolHandlerResponse>> = {
  "getConferences": handleGetConferences,
  "getJournals": handleGetJournals,
  "getWebsiteInfo": handleGetWebsiteInfo,
  "navigation": handleNavigation,
  "manageFollow": handleManageFollow,
  "manageCalendar": handleManageCalendar,
  "openGoogleMap": handleOpenGoogleMap,
  // Add new handlers here
};