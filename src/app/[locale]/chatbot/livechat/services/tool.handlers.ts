// src/app/[locale]/chatbot/livechat/services/tool.handlers.ts

// Import FunctionCall from the new SDK
import { FunctionCall as SDKFunctionCall } from '@google/genai';

import {
  getAuthTokenClientSide,
  makeFrontendApiCall,
  fetchItemDetailsFromApi,
  // formatItemsForModel, // We'll create more specific formatters or inline messages
  getUrlArg
} from '../utils/api.helpers';
import { websiteInfo } from "../../language/functions";
import { transformConferenceData } from '../../utils/transformApiData';

// Define a common config type for handlers
interface HandlerConfig {
  databaseUrl: string;
  frontendUrl: string;
  currentLocale: string;
}

export interface ToolHandlerResponse {
  response: Record<string, unknown>;
  id: string;
}

// Helper to format a list of items for the model's response (generic)
function formatGenericListForModel(items: any[], itemTypeName: string, listType: string, keyId = 'id', keyTitle = 'title', keyAcronym = 'acronym'): string {
  if (!items || items.length === 0) {
    return `You have no ${itemTypeName} in your ${listType} list.`;
  }
  const formatted = items.map(item => {
    let display = `- ${item[keyTitle] || 'Unknown Title'}`;
    if (item[keyAcronym]) display += ` (${item[keyAcronym]})`;
    // Add more details if available and needed, e.g., dates, location
    return display;
  }).join('\n');
  return `Here are the ${itemTypeName} in your ${listType} list:\n${formatted}`;
}


// --- Individual Handlers ---

async function handleGetConferences(fc: SDKFunctionCall, config: HandlerConfig): Promise<ToolHandlerResponse> {
  const apiUrl = `${config.databaseUrl}/conference`;
  const searchQuery = fc.args && typeof fc.args['searchQuery'] === 'string'
    ? fc.args['searchQuery']
    : undefined;
  const finalUrl = searchQuery ? `${apiUrl}?${searchQuery}` : apiUrl;

  console.log(`[LiveChat ToolHandler] Calling API for getConferences using GET at: ${finalUrl}`);
  const response = await fetch(finalUrl, { method: 'GET', headers: {} });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}) for getConferences: ${errorText.substring(0, 200)}`);
  }
  const responseData = await response.json();
  const contentToSend = transformConferenceData(responseData, searchQuery);
  return { response: { content: contentToSend }, id: fc.id || `conf-fallback-${Date.now()}` };
}

async function handleGetJournals(fc: SDKFunctionCall, config: HandlerConfig): Promise<ToolHandlerResponse> {
  const apiUrl = `${config.databaseUrl}/journal`;
  const searchQuery = fc.args && typeof fc.args['searchQuery'] === 'string'
    ? fc.args['searchQuery']
    : undefined;
  const finalUrl = searchQuery ? `${apiUrl}?${searchQuery}` : apiUrl;

  console.log(`[LiveChat ToolHandler] Calling API for getJournals using GET at: ${finalUrl}`);
  const response = await fetch(finalUrl, { method: 'GET', headers: {} });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}) for getJournals: ${errorText.substring(0, 200)}`);
  }
  const responseData = await response.json();
  return { response: { content: responseData }, id: fc.id || `journal-fallback-${Date.now()}` };
}

async function handleGetWebsiteInfo(fc: SDKFunctionCall, _config: HandlerConfig): Promise<ToolHandlerResponse> {
  return { response: { content: websiteInfo }, id: fc.id || `webinfo-fallback-${Date.now()}` };
}

async function handleNavigation(fc: SDKFunctionCall, config: HandlerConfig): Promise<ToolHandlerResponse> {
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
    console.warn("[LiveChat ToolHandler] window object not available for navigation.");
  }
  return { response: { content: { message: `Navigating to ${urlToOpen}`, status: 'success' } }, id: fc.id || `nav-fallback-${Date.now()}` };
}

async function handleManageFollow(fc: SDKFunctionCall, config: HandlerConfig): Promise<ToolHandlerResponse> {
  const args = fc.args || {};
  const itemType = args['itemType'] as 'conference' | 'journal' | undefined;
  const action = args['action'] as 'follow' | 'unfollow' | 'list' | undefined;
  const identifier = args['identifier'] as string | undefined;
  const identifierType = args['identifierType'] as 'acronym' | 'title' | 'id' | undefined;

  // Validation
  if (!itemType || !['conference', 'journal'].includes(itemType)) {
    throw new Error("Invalid or missing 'itemType' for manageFollow. Must be 'conference' or 'journal'.");
  }
  if (!action || !['follow', 'unfollow', 'list'].includes(action)) {
    throw new Error("Invalid or missing 'action' for manageFollow. Must be 'follow', 'unfollow', or 'list'.");
  }
  if ((action === 'follow' || action === 'unfollow') && (!identifier || !identifierType)) {
    throw new Error(`'identifier' and 'identifierType' are required for '${action}' action.`);
  }
  if (identifierType && !['acronym', 'title', 'id'].includes(identifierType)) {
      throw new Error("Invalid 'identifierType'. Must be 'acronym', 'title', or 'id'.");
  }

  const token = await getAuthTokenClientSide();
  if (!token) {
    throw new Error("Authentication required to manage followed items. Please log in.");
  }

  let modelMessage = "";

  if (action === 'list') {
    const listUrl = `${config.databaseUrl}/${itemType === 'conference' ? 'follow-conference' : 'follow-journal'}/followed`;
    console.log(`[LiveChat ToolHandler ManageFollow] Listing followed ${itemType}s from ${listUrl}`);
    const followedItems: any[] = await makeFrontendApiCall(listUrl, 'GET', token); // API returns array of FollowItem
    modelMessage = formatGenericListForModel(followedItems, itemType, 'followed');
  } else { // 'follow' or 'unfollow'
    const itemDetails = await fetchItemDetailsFromApi(identifier!, identifierType!, itemType, config.databaseUrl);
    const itemId = itemDetails.id;
    const itemName = itemDetails.name;
    console.log(`[LiveChat ToolHandler ManageFollow] Found item: ID=${itemId}, Name=${itemName} for ${action}`);

    // Check current follow status
    const listUrl = `${config.databaseUrl}/${itemType === 'conference' ? 'follow-conference' : 'follow-journal'}/followed`;
    const currentFollowedItems: any[] = await makeFrontendApiCall(listUrl, 'GET', token);
    const isCurrentlyFollowing = currentFollowedItems.some(item => item.id === itemId);
    console.log(`[LiveChat ToolHandler ManageFollow] Item ${itemId} currently following: ${isCurrentlyFollowing}`);

    if (action === 'follow') {
      if (isCurrentlyFollowing) {
        modelMessage = `You are already following the ${itemType} "${itemName}".`;
      } else {
        // CROSS-CHECK: For 'follow' conference, check blacklist
        if (itemType === 'conference') {
          const blacklistUrl = `${config.databaseUrl}/blacklist-conference`;
          console.log(`[LiveChat ToolHandler ManageFollow] Checking blacklist status for conference ${itemId} from ${blacklistUrl}`);
          const blacklistedItems: any[] = await makeFrontendApiCall(blacklistUrl, 'GET', token); // API returns array of BlacklistItem
          const isBlacklisted = blacklistedItems.some(item => item.conferenceId === itemId);
          if (isBlacklisted) {
            throw new Error(`The conference "${itemName}" is currently in your blacklist. You must remove it from the blacklist before following.`);
          }
          console.log(`[LiveChat ToolHandler ManageFollow] Conference ${itemId} is not blacklisted. Safe to follow.`);
        }

        const actionUrl = `${config.databaseUrl}/${itemType === 'conference' ? 'follow-conference' : 'follow-journal'}/add`;
        const payload = itemType === 'conference' ? { conferenceId: itemId } : { journalId: itemId };
        console.log(`[LiveChat ToolHandler ManageFollow] Following ${itemType} ${itemId} at ${actionUrl}`);
        await makeFrontendApiCall(actionUrl, 'POST', token, payload);
        modelMessage = `Successfully followed the ${itemType} "${itemName}".`;
      }
    } else { // action === 'unfollow'
      if (!isCurrentlyFollowing) {
        modelMessage = `You are not currently following the ${itemType} "${itemName}".`;
      } else {
        const actionUrl = `${config.databaseUrl}/${itemType === 'conference' ? 'follow-conference' : 'follow-journal'}/remove`;
        const payload = itemType === 'conference' ? { conferenceId: itemId } : { journalId: itemId };
        console.log(`[LiveChat ToolHandler ManageFollow] Unfollowing ${itemType} ${itemId} at ${actionUrl}`);
        await makeFrontendApiCall(actionUrl, 'POST', token, payload);
        modelMessage = `Successfully unfollowed the ${itemType} "${itemName}".`;
      }
    }
  }
  return { response: { content: modelMessage }, id: fc.id || `follow-fallback-${Date.now()}` };
}

async function handleManageCalendar(fc: SDKFunctionCall, config: HandlerConfig): Promise<ToolHandlerResponse> {
  const args = fc.args || {};
  const itemType = args['itemType'] as string | undefined; // Should always be 'conference'
  const action = args['action'] as 'add' | 'remove' | 'list' | undefined;
  const identifier = args['identifier'] as string | undefined;
  const identifierType = args['identifierType'] as 'acronym' | 'title' | 'id' | undefined;

  // Validation
  if (itemType !== 'conference') {
    throw new Error("Invalid 'itemType' for manageCalendar. Must be 'conference'.");
  }
  if (!action || !['add', 'remove', 'list'].includes(action)) {
    throw new Error("Invalid or missing 'action' for manageCalendar. Must be 'add', 'remove', or 'list'.");
  }
  if ((action === 'add' || action === 'remove') && (!identifier || !identifierType)) {
    throw new Error(`'identifier' and 'identifierType' are required for calendar '${action}' action.`);
  }
   if (identifierType && !['acronym', 'title', 'id'].includes(identifierType)) {
      throw new Error("Invalid 'identifierType'. Must be 'acronym', 'title', or 'id'.");
  }

  const token = await getAuthTokenClientSide();
  if (!token) {
    throw new Error("Authentication required to manage calendar items. Please log in.");
  }

  let modelMessage = "";

  if (action === 'list') {
    const listUrl = `${config.databaseUrl}/calendar/conference-events`;
    console.log(`[LiveChat ToolHandler ManageCalendar] Listing calendar items from ${listUrl}`);
    const calendarItems: any[] = await makeFrontendApiCall(listUrl, 'GET', token); // API returns array of CalendarItem
    modelMessage = formatGenericListForModel(calendarItems, 'conferences', 'calendar');
  } else { // 'add' or 'remove'
    const itemDetails = await fetchItemDetailsFromApi(identifier!, identifierType!, "conference", config.databaseUrl);
    const itemId = itemDetails.id; // This is the conferenceId
    const itemName = itemDetails.name;
    console.log(`[LiveChat ToolHandler ManageCalendar] Found conference: ID=${itemId}, Name=${itemName} for ${action}`);

    // Check current calendar status
    const listUrl = `${config.databaseUrl}/calendar/conference-events`;
    const currentCalendarItems: any[] = await makeFrontendApiCall(listUrl, 'GET', token);
    const isCurrentlyInCalendar = currentCalendarItems.some(item => item.id === itemId); // CalendarItem has 'id' which is conferenceId
    console.log(`[LiveChat ToolHandler ManageCalendar] Conference ${itemId} currently in calendar: ${isCurrentlyInCalendar}`);

    if (action === 'add') {
      if (isCurrentlyInCalendar) {
        modelMessage = `The conference "${itemName}" is already in your calendar.`;
      } else {
        // CROSS-CHECK: For 'add' to calendar, check blacklist
        const blacklistUrl = `${config.databaseUrl}/blacklist-conference`;
        console.log(`[LiveChat ToolHandler ManageCalendar] Checking blacklist status for conference ${itemId} from ${blacklistUrl}`);
        const blacklistedItems: any[] = await makeFrontendApiCall(blacklistUrl, 'GET', token);
        const isBlacklisted = blacklistedItems.some(item => item.conferenceId === itemId);
        if (isBlacklisted) {
          throw new Error(`The conference "${itemName}" is currently in your blacklist. You must remove it from the blacklist before adding it to the calendar.`);
        }
        console.log(`[LiveChat ToolHandler ManageCalendar] Conference ${itemId} is not blacklisted. Safe to add to calendar.`);

        const actionUrl = `${config.databaseUrl}/calendar/add`;
        const payload = { conferenceId: itemId };
        console.log(`[LiveChat ToolHandler ManageCalendar] Adding conference ${itemId} to calendar at ${actionUrl}`);
        await makeFrontendApiCall(actionUrl, 'POST', token, payload);
        modelMessage = `Successfully added conference "${itemName}" to your calendar.`;
      }
    } else { // action === 'remove'
      if (!isCurrentlyInCalendar) {
        modelMessage = `The conference "${itemName}" is not currently in your calendar.`;
      } else {
        const actionUrl = `${config.databaseUrl}/calendar/remove`;
        const payload = { conferenceId: itemId };
        console.log(`[LiveChat ToolHandler ManageCalendar] Removing conference ${itemId} from calendar at ${actionUrl}`);
        await makeFrontendApiCall(actionUrl, 'POST', token, payload);
        modelMessage = `Successfully removed conference "${itemName}" from your calendar.`;
      }
    }
  }
  return { response: { content: modelMessage }, id: fc.id || `calendar-fallback-${Date.now()}` };
}

async function handleManageBlacklist(fc: SDKFunctionCall, config: HandlerConfig): Promise<ToolHandlerResponse> {
  const args = fc.args || {};
  const itemType = args['itemType'] as string | undefined; // Should always be 'conference'
  const action = args['action'] as 'add' | 'remove' | 'list' | undefined;
  const identifier = args['identifier'] as string | undefined;
  const identifierType = args['identifierType'] as 'acronym' | 'title' | 'id' | undefined;

  // Validation
  if (itemType !== 'conference') {
    throw new Error("Invalid 'itemType' for manageBlacklist. Must be 'conference'.");
  }
  if (!action || !['add', 'remove', 'list'].includes(action)) {
    throw new Error("Invalid or missing 'action' for manageBlacklist. Must be 'add', 'remove', or 'list'.");
  }
  if ((action === 'add' || action === 'remove') && (!identifier || !identifierType)) {
    throw new Error(`'identifier' and 'identifierType' are required for blacklist '${action}' action.`);
  }
  if (identifierType && !['acronym', 'title', 'id'].includes(identifierType)) {
      throw new Error("Invalid 'identifierType'. Must be 'acronym', 'title', or 'id'.");
  }

  const token = await getAuthTokenClientSide();
  if (!token) {
    throw new Error("Authentication required to manage blacklisted items. Please log in.");
  }

  let modelMessage = "";

  if (action === 'list') {
    const listUrl = `${config.databaseUrl}/blacklist-conference`;
    console.log(`[LiveChat ToolHandler ManageBlacklist] Listing blacklisted conferences from ${listUrl}`);
    const blacklistedItems: any[] = await makeFrontendApiCall(listUrl, 'GET', token); // API returns array of BlacklistItem
    modelMessage = formatGenericListForModel(blacklistedItems, 'conferences', 'blacklist', 'conferenceId');
  } else { // 'add' or 'remove'
    const itemDetails = await fetchItemDetailsFromApi(identifier!, identifierType!, "conference", config.databaseUrl);
    const itemId = itemDetails.id; // This is the conferenceId
    const itemName = itemDetails.name;
    console.log(`[LiveChat ToolHandler ManageBlacklist] Found conference: ID=${itemId}, Name=${itemName} for ${action}`);

    // Check current blacklist status
    const listUrl = `${config.databaseUrl}/blacklist-conference`;
    const currentBlacklistedItems: any[] = await makeFrontendApiCall(listUrl, 'GET', token);
    const isCurrentlyBlacklisted = currentBlacklistedItems.some(item => item.conferenceId === itemId);
    console.log(`[LiveChat ToolHandler ManageBlacklist] Conference ${itemId} currently blacklisted: ${isCurrentlyBlacklisted}`);

    if (action === 'add') {
      if (isCurrentlyBlacklisted) {
        modelMessage = `The conference "${itemName}" is already in your blacklist.`;
      } else {
        // CROSS-CHECKS: For 'add' to blacklist, check if followed or in calendar
        let conflictMessages: string[] = [];

        // 1. Check Follow status
        const followUrl = `${config.databaseUrl}/follow-conference/followed`;
        console.log(`[LiveChat ToolHandler ManageBlacklist] Checking follow status for conference ${itemId} from ${followUrl}`);
        const followedItems: any[] = await makeFrontendApiCall(followUrl, 'GET', token);
        const isFollowed = followedItems.some(item => item.id === itemId);
        if (isFollowed) {
          conflictMessages.push(`it is currently in your followed list`);
          console.log(`[LiveChat ToolHandler ManageBlacklist] Conflict: Conference ${itemId} is followed.`);
        }

        // 2. Check Calendar status
        const calendarUrl = `${config.databaseUrl}/calendar/conference-events`;
        console.log(`[LiveChat ToolHandler ManageBlacklist] Checking calendar status for conference ${itemId} from ${calendarUrl}`);
        const calendarItems: any[] = await makeFrontendApiCall(calendarUrl, 'GET', token);
        const isInCalendar = calendarItems.some(item => item.id === itemId); // CalendarItem has 'id'
        if (isInCalendar) {
          conflictMessages.push(`it is currently in your calendar`);
          console.log(`[LiveChat ToolHandler ManageBlacklist] Conflict: Conference ${itemId} is in calendar.`);
        }

        if (conflictMessages.length > 0) {
          let fullConflictMessage = `Cannot add "${itemName}" to blacklist because ${conflictMessages.join(' and ')}.`;
          if (isFollowed && isInCalendar) {
             fullConflictMessage = `The conference "${itemName}" is currently in your followed list AND your calendar. You must unfollow it and remove it from calendar before adding to blacklist.`;
          } else if (isFollowed) {
             fullConflictMessage = `The conference "${itemName}" is currently in your followed list. You must unfollow it before adding it to the blacklist.`;
          } else { // Only isInCalendar
             fullConflictMessage = `The conference "${itemName}" is currently in your calendar. You must remove it from calendar before adding it to the blacklist.`;
          }
          throw new Error(fullConflictMessage);
        }
        console.log(`[LiveChat ToolHandler ManageBlacklist] Conference ${itemId} is not followed and not in calendar. Safe to blacklist.`);

        const actionUrl = `${config.databaseUrl}/blacklist-conference/add`;
        const payload = { conferenceId: itemId };
        console.log(`[LiveChat ToolHandler ManageBlacklist] Adding conference ${itemId} to blacklist at ${actionUrl}`);
        await makeFrontendApiCall(actionUrl, 'POST', token, payload);
        modelMessage = `Successfully added conference "${itemName}" to your blacklist.`;
      }
    } else { // action === 'remove'
      if (!isCurrentlyBlacklisted) {
        modelMessage = `The conference "${itemName}" is not currently in your blacklist.`;
      } else {
        const actionUrl = `${config.databaseUrl}/blacklist-conference/remove`;
        const payload = { conferenceId: itemId };
        console.log(`[LiveChat ToolHandler ManageBlacklist] Removing conference ${itemId} from blacklist at ${actionUrl}`);
        await makeFrontendApiCall(actionUrl, 'POST', token, payload);
        modelMessage = `Successfully removed conference "${itemName}" from your blacklist.`;
      }
    }
  }
  return { response: { content: modelMessage }, id: fc.id || `blacklist-fallback-${Date.now()}` };
}


async function handleOpenGoogleMap(fc: SDKFunctionCall, _config: HandlerConfig): Promise<ToolHandlerResponse> {
  const args = fc.args || {};
  const location = args['location'] as string | undefined;

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
    id: fc.id || `map-fallback-${Date.now()}`
  };
}

// Dispatcher for tool handlers
export const toolHandlers: Record<string, (fc: SDKFunctionCall, config: HandlerConfig) => Promise<ToolHandlerResponse>> = {
  "getConferences": handleGetConferences,
  "getJournals": handleGetJournals,
  "getWebsiteInfo": handleGetWebsiteInfo,
  "navigation": handleNavigation,
  "manageFollow": handleManageFollow,
  "manageCalendar": handleManageCalendar,
  "manageBlacklist": handleManageBlacklist, // Added new handler
  "openGoogleMap": handleOpenGoogleMap,
};