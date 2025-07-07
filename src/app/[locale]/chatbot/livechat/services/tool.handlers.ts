// src/app/[locale]/chatbot/livechat/services/tool.handlers.ts

// Import FunctionCall from the new SDK
import { FunctionCall as SDKFunctionCall } from '@google/genai';

import {
  getAuthTokenClientSide,
  makeFrontendApiCall,
  fetchItemDetailsFromApi,
  getUrlArg
} from '../utils/api.helpers';
import { websiteInfo } from "../../language/functions";
import { transformConferenceData } from '../../utils/transformApiData';

// =================================================================
// --- TYPE DEFINITIONS ---
// =================================================================

// --- Common Interfaces ---

interface HandlerConfig {
  databaseUrl: string;
  frontendUrl: string;
  currentLocale: string;
}

export interface ToolHandlerResponse {
  response: Record<string, unknown>;
  id: string;
}

export interface ItemDateRange {
  fromDate: string;
  toDate: string;
}

export interface ItemLocation {
  address: string;
  cityStateProvince: string;
  country: string;
  continent: string;
}

// --- Item Type Interfaces ---

export interface FollowItem {
  id: string;
  title: string;
  acronym: string;
  dates: ItemDateRange[];
  location: ItemLocation;
  itemType?: "conference";
}

export interface CalendarItem {
  id: string;
  title: string;
  acronym?: string;
  creatorId: string | null;
  adminId: string;
  followedAt: string;
  updatedAt: string;
  status: string;
  dates: ItemDateRange[];
  location: ItemLocation;
}

export interface BlacklistItem {
  conferenceId: string;
  title: string;
  acronym: string;
}

// --- UI Action Payloads and Types ---

interface DisplayListPayload {
  items: (FollowItem | CalendarItem | BlacklistItem)[];
  itemType: 'conference';
  listType: 'followed' | 'calendar' | 'blacklist' | string;
  title?: string;
}

interface ItemFollowStatusUpdatePayload {
  item: FollowItem;
  itemType: 'conference';
  followed: boolean;
}

interface ItemCalendarStatusUpdatePayload {
  item: CalendarItem;
  itemType: 'conference';
  calendar: boolean;
}

interface ItemBlacklistStatusUpdatePayload {
  item: { id: string; title: string; acronym?: string };
  itemType: 'conference';
  blacklisted: boolean;
}

type UIAction =
  | { type: 'displayList'; payload: DisplayListPayload }
  | { type: 'itemFollowStatusUpdated'; payload: ItemFollowStatusUpdatePayload }
  | { type: 'itemCalendarStatusUpdated'; payload: ItemCalendarStatusUpdatePayload }
  | { type: 'itemBlacklistStatusUpdated'; payload: ItemBlacklistStatusUpdatePayload }
  | { type: 'display_map'; location: string };

// --- Structured Response Content ---

interface StructuredContent {
  messageForModel: string;
  uiAction?: UIAction;
}

// =================================================================
// --- START: NEW HELPER FUNCTIONS (Copied and adapted from backendService.ts) ---
// =================================================================

/**
 * Parses a query string into an object.
 * Handles multiple values for the same key.
 * @param queryString The URL-encoded query string.
 * @returns An object representing the query parameters.
 */
function parseQueryString(queryString: string): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {};
  if (!queryString) return params;

  queryString.split('&').forEach(pair => {
    const parts = pair.split('=');
    if (parts.length === 2) {
      const key = decodeURIComponent(parts[0]);
      const value = decodeURIComponent(parts[1]);
      if (params.hasOwnProperty(key)) {
        if (Array.isArray(params[key])) {
          (params[key] as string[]).push(value);
        } else {
          params[key] = [params[key] as string, value];
        }
      } else {
        params[key] = value;
      }
    }
  });
  return params;
}

/**
 * Converts a parameter object back into a URL-encoded query string.
 * @param params The object representing the query parameters.
 * @returns A URL-encoded query string.
 */
function buildQueryString(params: Record<string, string | string[]>): string {
  const parts: string[] = [];
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const value = params[key];
      if (Array.isArray(value)) {
        value.forEach(val => parts.push(`${key}=${val}`));
      } else {
        parts.push(`${key}=${value as string}`);
      }
    }
  }
  return parts.join('&');
}

/**
 * Pre-processes the search query string to normalize dates and add detail mode if needed.
 * This logic is mirrored from the backend service to ensure consistent query handling.
 * @param queryString The initial query string from the model.
 * @returns The processed query string, ready for the API call.
 */
function preprocessSearchQuery(queryString: string | undefined): string {
  if (!queryString) {
    return '';
  }

  let effectiveQueryString = queryString;

  // --- 1. Date Normalization ---
  const queryParams = parseQueryString(queryString);
  const datePrefixes = ['sub', 'cameraReady', 'notification', 'registration', ''];
  let modifiedForDates = false;

  datePrefixes.forEach(prefix => {
    const fromKey = `${prefix}FromDate`;
    const toKey = `${prefix}ToDate`;
    const hasFrom = queryParams.hasOwnProperty(fromKey);
    const hasTo = queryParams.hasOwnProperty(toKey);

    if (hasFrom && !hasTo) {
      queryParams[toKey] = queryParams[fromKey];
      modifiedForDates = true;
    } else if (!hasFrom && hasTo) {
      queryParams[fromKey] = queryParams[toKey];
      modifiedForDates = true;
    }
  });

  if (modifiedForDates) {
    effectiveQueryString = buildQueryString(queryParams);
  }

  // --- 2. Detail Mode Logic ---
  const detailModeKeywords = [
    'subFromDate', 'subToDate',
    'cameraReadyFromDate', 'cameraReadyToDate',
    'notificationFromDate', 'notificationToDate',
    'registrationFromDate', 'registrationToDate'
  ];

  const needsDetailMode = detailModeKeywords.some(keyword =>
    effectiveQueryString.includes(keyword)
  );

  if (needsDetailMode && !effectiveQueryString.includes('mode=detail')) {
    if (effectiveQueryString.length > 0 && !effectiveQueryString.endsWith('&')) {
      effectiveQueryString += '&';
    }
    effectiveQueryString += 'mode=detail';
  }

  return effectiveQueryString;
}

// =================================================================
// --- END: NEW HELPER FUNCTIONS ---
// =================================================================


// =================================================================
// --- INDIVIDUAL HANDLERS (MODIFIED) ---
// =================================================================

async function handleGetConferences(fc: SDKFunctionCall, config: HandlerConfig): Promise<ToolHandlerResponse> {
  const apiUrl = `${config.databaseUrl}/conference`;

  // Lấy searchQuery ban đầu từ function call
  const initialSearchQuery = fc.args && typeof fc.args['searchQuery'] === 'string'
    ? fc.args['searchQuery']
    : undefined;

  // *** MODIFICATION START: Áp dụng xử lý query tương tự backendService ***
  // Xử lý searchQuery để chuẩn hóa ngày và thêm 'mode=detail' nếu cần
  const effectiveSearchQuery = preprocessSearchQuery(initialSearchQuery);
  // *** MODIFICATION END ***

  // Xây dựng URL cuối cùng với query đã được xử lý
  const finalUrl = effectiveSearchQuery ? `${apiUrl}?${effectiveSearchQuery}` : apiUrl;

  console.log(`[ToolHandler] Executing API call: GET ${finalUrl}`); // Thêm log để debug

  const response = await fetch(finalUrl, { method: 'GET', headers: {} });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}) for getConferences: ${errorText.substring(0, 200)}`);
  }
  const responseData = await response.json();

  // Sử dụng `effectiveSearchQuery` khi gọi hàm transform để đảm bảo tính nhất quán
  const contentToSend = transformConferenceData(responseData, effectiveSearchQuery);

  return { response: { content: contentToSend }, id: fc.id || `conf-fallback-${Date.now()}` };
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
  }
  return { response: { content: { message: `Navigating to ${urlToOpen}`, status: 'success' } }, id: fc.id || `nav-fallback-${Date.now()}` };
}

async function handleManageFollow(fc: SDKFunctionCall, config: HandlerConfig): Promise<ToolHandlerResponse> {
  const args = fc.args || {};
  const itemType = args['itemType'] as 'conference';
  const action = args['action'] as 'follow' | 'unfollow' | 'list';
  const identifier = args['identifier'] as string | undefined;
  const identifierType = args['identifierType'] as 'acronym' | 'title' | 'id' | undefined;

  // --- Validation ---
  if (itemType !== 'conference') throw new Error("Invalid 'itemType'. Must be 'conference'.");
  if (!action || !['follow', 'unfollow', 'list'].includes(action)) throw new Error("Invalid 'action'.");
  if ((action === 'follow' || action === 'unfollow') && (!identifier || !identifierType)) throw new Error(`'identifier' and 'identifierType' are required for '${action}'.`);
  if (identifierType && !['acronym', 'title', 'id'].includes(identifierType)) throw new Error("Invalid 'identifierType'.");

  const token = await getAuthTokenClientSide();
  if (!token) throw new Error("Authentication required. Please log in.");

  let responseContent: StructuredContent;

  if (action === 'list') {
    const listUrl = `${config.databaseUrl}/follow-conference/followed`;
    const followedItems: FollowItem[] = await makeFrontendApiCall(listUrl, 'GET', token);

    if (followedItems.length === 0) {
      responseContent = { messageForModel: `The user is not following any conferences.` };
    } else {
      const textForModel = `The user is following ${followedItems.length} conferences. Displaying the list.`;
      responseContent = {
        messageForModel: textForModel,
        uiAction: {
          type: 'displayList',
          payload: { items: followedItems, itemType: 'conference', listType: 'followed', title: `Your Followed Conferences` }
        }
      };
    }
  } else { // 'follow' or 'unfollow'
    const itemDetails = await fetchItemDetailsFromApi(identifier!, identifierType!, itemType, config.databaseUrl);
    const itemId = itemDetails.id;
    const itemName = itemDetails.title; // FIX: Changed from .name to .title

    const listUrl = `${config.databaseUrl}/follow-conference/followed`;
    const currentFollowedItems: FollowItem[] = await makeFrontendApiCall(listUrl, 'GET', token);
    const isCurrentlyFollowing = currentFollowedItems.some(item => item.id === itemId);

    let messageForModel = "";
    let uiAction: UIAction | undefined = undefined;

    if (action === 'follow') {
      if (isCurrentlyFollowing) {
        messageForModel = `You are already following the conference "${itemName}".`;
      } else {
        const blacklistUrl = `${config.databaseUrl}/blacklist-conference`;
        const blacklistedItems: BlacklistItem[] = await makeFrontendApiCall(blacklistUrl, 'GET', token);
        if (blacklistedItems.some(item => item.conferenceId === itemId)) {
          throw new Error(`The conference "${itemName}" is in your blacklist. Remove it from the blacklist before following.`);
        }

        await makeFrontendApiCall(`${config.databaseUrl}/follow-conference/add`, 'POST', token, { conferenceId: itemId });
        messageForModel = `Successfully followed the conference "${itemName}".`;

        uiAction = {
          type: 'itemFollowStatusUpdated',
          payload: {
            item: itemDetails as FollowItem, // Assert type for clarity
            itemType: 'conference',
            followed: true
          }
        };
      }
    } else { // 'unfollow'
      if (!isCurrentlyFollowing) {
        messageForModel = `You are not currently following the conference "${itemName}".`;
      } else {
        await makeFrontendApiCall(`${config.databaseUrl}/follow-conference/remove`, 'POST', token, { conferenceId: itemId });
        messageForModel = `Successfully unfollowed the conference "${itemName}".`;

        uiAction = {
          type: 'itemFollowStatusUpdated',
          payload: {
            item: itemDetails as FollowItem, // Assert type for clarity
            itemType: 'conference',
            followed: false
          }
        };
      }
    }
    responseContent = { messageForModel, uiAction };
  }

  return { response: { content: responseContent }, id: fc.id || `follow-fallback-${Date.now()}` };
}

async function handleManageCalendar(fc: SDKFunctionCall, config: HandlerConfig): Promise<ToolHandlerResponse> {
  const args = fc.args || {};
  const itemType = args['itemType'] as 'conference';
  const action = args['action'] as 'add' | 'remove' | 'list';
  const identifier = args['identifier'] as string | undefined;
  const identifierType = args['identifierType'] as 'acronym' | 'title' | 'id' | undefined;

  // --- Validation ---
  if (itemType !== 'conference') throw new Error("Invalid 'itemType'. Must be 'conference'.");
  if (!action || !['add', 'remove', 'list'].includes(action)) throw new Error("Invalid 'action'.");
  if ((action === 'add' || action === 'remove') && (!identifier || !identifierType)) throw new Error(`'identifier' and 'identifierType' are required for '${action}'.`);
  if (identifierType && !['acronym', 'title', 'id'].includes(identifierType)) throw new Error("Invalid 'identifierType'.");

  const token = await getAuthTokenClientSide();
  if (!token) throw new Error("Authentication required. Please log in.");

  let responseContent: StructuredContent;

  if (action === 'list') {
    const listUrl = `${config.databaseUrl}/calendar/conference-events`;
    const calendarItems: CalendarItem[] = await makeFrontendApiCall(listUrl, 'GET', token);

    if (calendarItems.length === 0) {
      responseContent = { messageForModel: `The user has no conferences in their calendar.` };
    } else {
      const textForModel = `The user has ${calendarItems.length} conferences in their calendar. Displaying the list.`;
      responseContent = {
        messageForModel: textForModel,
        uiAction: {
          type: 'displayList',
          payload: { items: calendarItems, itemType: 'conference', listType: 'calendar', title: `Your Calendar Conferences` }
        }
      };
    }
  } else { // 'add' or 'remove'
    const itemDetails = await fetchItemDetailsFromApi(identifier!, identifierType!, "conference", config.databaseUrl);
    const itemId = itemDetails.id;
    const itemName = itemDetails.title; // FIX: Changed from .name to .title

    const listUrl = `${config.databaseUrl}/calendar/conference-events`;
    const currentCalendarItems: CalendarItem[] = await makeFrontendApiCall(listUrl, 'GET', token);
    const isCurrentlyInCalendar = currentCalendarItems.some(item => item.id === itemId);

    let messageForModel = "";
    let uiAction: UIAction | undefined = undefined;

    if (action === 'add') {
      if (isCurrentlyInCalendar) {
        messageForModel = `The conference "${itemName}" is already in your calendar.`;
      } else {
        const blacklistUrl = `${config.databaseUrl}/blacklist-conference`;
        const blacklistedItems: BlacklistItem[] = await makeFrontendApiCall(blacklistUrl, 'GET', token);
        if (blacklistedItems.some(item => item.conferenceId === itemId)) {
          throw new Error(`The conference "${itemName}" is in your blacklist. Remove it from the blacklist before adding to calendar.`);
        }

        const addedItemDetails = await makeFrontendApiCall(`${config.databaseUrl}/calendar/add`, 'POST', token, { conferenceId: itemId });
        messageForModel = `Successfully added conference "${itemName}" to your calendar.`;

        const finalItemDetails = { ...itemDetails, ...addedItemDetails };
        const itemDataForFrontend: CalendarItem = {
          id: itemId,
          title: itemName,
          acronym: finalItemDetails.acronym || '',
          creatorId: finalItemDetails.creatorId || null,
          adminId: finalItemDetails.adminId || '',
          followedAt: finalItemDetails.followedAt || new Date().toISOString(),
          updatedAt: finalItemDetails.updatedAt || new Date().toISOString(),
          status: finalItemDetails.status || 'CRAWLED',
          dates: finalItemDetails.dates || [],
          location: finalItemDetails.location || { address: '', cityStateProvince: '', country: '', continent: '' },
        };

        uiAction = {
          type: 'itemCalendarStatusUpdated',
          payload: { item: itemDataForFrontend, itemType: 'conference', calendar: true }
        };
      }
    } else { // 'remove'
      if (!isCurrentlyInCalendar) {
        messageForModel = `The conference "${itemName}" is not currently in your calendar.`;
      } else {
        await makeFrontendApiCall(`${config.databaseUrl}/calendar/remove`, 'POST', token, { conferenceId: itemId });
        messageForModel = `Successfully removed conference "${itemName}" from your calendar.`;

        uiAction = {
          type: 'itemCalendarStatusUpdated',
          payload: { item: itemDetails as CalendarItem, itemType: 'conference', calendar: false }
        };
      }
    }
    responseContent = { messageForModel, uiAction };
  }

  return { response: { content: responseContent }, id: fc.id || `calendar-fallback-${Date.now()}` };
}

async function handleManageBlacklist(fc: SDKFunctionCall, config: HandlerConfig): Promise<ToolHandlerResponse> {
  const args = fc.args || {};
  const itemType = args['itemType'] as 'conference';
  const action = args['action'] as 'add' | 'remove' | 'list';
  const identifier = args['identifier'] as string | undefined;
  const identifierType = args['identifierType'] as 'acronym' | 'title' | 'id' | undefined;

  // --- Validation ---
  if (itemType !== 'conference') throw new Error("Invalid 'itemType'. Must be 'conference'.");
  if (!action || !['add', 'remove', 'list'].includes(action)) throw new Error("Invalid 'action'.");
  if ((action === 'add' || action === 'remove') && (!identifier || !identifierType)) throw new Error(`'identifier' and 'identifierType' are required for '${action}'.`);
  if (identifierType && !['acronym', 'title', 'id'].includes(identifierType)) throw new Error("Invalid 'identifierType'.");

  const token = await getAuthTokenClientSide();
  if (!token) throw new Error("Authentication required. Please log in.");

  let responseContent: StructuredContent;

  if (action === 'list') {
    const listUrl = `${config.databaseUrl}/blacklist-conference`;
    const blacklistedItems: BlacklistItem[] = await makeFrontendApiCall(listUrl, 'GET', token);

    if (blacklistedItems.length === 0) {
      responseContent = { messageForModel: `The user's blacklist is empty.` };
    } else {
      const textForModel = `The user has ${blacklistedItems.length} conferences in their blacklist. Displaying the list.`;
      responseContent = {
        messageForModel: textForModel,
        uiAction: {
          type: 'displayList',
          payload: { items: blacklistedItems, itemType: 'conference', listType: 'blacklist', title: `Your Blacklisted Conferences` }
        }
      };
    }
  } else { // 'add' or 'remove'
    const itemDetails = await fetchItemDetailsFromApi(identifier!, identifierType!, "conference", config.databaseUrl);
    const itemId = itemDetails.id;
    const itemName = itemDetails.title; // FIX: Changed from .name to .title

    const listUrl = `${config.databaseUrl}/blacklist-conference`;
    const currentBlacklistedItems: BlacklistItem[] = await makeFrontendApiCall(listUrl, 'GET', token);
    const isCurrentlyBlacklisted = currentBlacklistedItems.some(item => item.conferenceId === itemId);

    let messageForModel = "";
    let uiAction: UIAction | undefined = undefined;

    if (action === 'add') {
      if (isCurrentlyBlacklisted) {
        messageForModel = `The conference "${itemName}" is already in your blacklist.`;
      } else {
        // CROSS-CHECKS
        const followedItems: FollowItem[] = await makeFrontendApiCall(`${config.databaseUrl}/follow-conference/followed`, 'GET', token);
        if (followedItems.some(item => item.id === itemId)) {
          throw new Error(`Cannot add "${itemName}" to blacklist because it is in your followed list. Please unfollow it first.`);
        }
        const calendarItems: CalendarItem[] = await makeFrontendApiCall(`${config.databaseUrl}/calendar/conference-events`, 'GET', token);
        if (calendarItems.some(item => item.id === itemId)) {
          throw new Error(`Cannot add "${itemName}" to blacklist because it is in your calendar. Please remove it from the calendar first.`);
        }

        await makeFrontendApiCall(`${config.databaseUrl}/blacklist-conference/add`, 'POST', token, { conferenceId: itemId });
        messageForModel = `Successfully added conference "${itemName}" to your blacklist.`;

        uiAction = {
          type: 'itemBlacklistStatusUpdated',
          payload: {
            item: { id: itemId, title: itemName, acronym: itemDetails.acronym },
            itemType: 'conference',
            blacklisted: true
          }
        };
      }
    } else { // 'remove'
      if (!isCurrentlyBlacklisted) {
        messageForModel = `The conference "${itemName}" is not currently in your blacklist.`;
      } else {
        await makeFrontendApiCall(`${config.databaseUrl}/blacklist-conference/remove`, 'POST', token, { conferenceId: itemId });
        messageForModel = `Successfully removed conference "${itemName}" from your blacklist.`;

        uiAction = {
          type: 'itemBlacklistStatusUpdated',
          payload: {
            item: { id: itemId, title: itemName, acronym: itemDetails.acronym },
            itemType: 'conference',
            blacklisted: false
          }
        };
      }
    }
    responseContent = { messageForModel, uiAction };
  }
  return { response: { content: responseContent }, id: fc.id || `blacklist-fallback-${Date.now()}` };
}

async function handleOpenGoogleMap(fc: SDKFunctionCall, _config: HandlerConfig): Promise<ToolHandlerResponse> {
  const args = fc.args || {};
  const location = args['location'] as string | undefined;

  if (!location || typeof location !== 'string' || location.trim() === '') {
    throw new Error("Missing or invalid 'location' argument for openGoogleMap.");
  }

  const responseContent: StructuredContent = {
    messageForModel: `Map for "${location}" is being prepared for display.`,
    uiAction: {
      type: "display_map",
      location: location,
    }
  };

  return {
    response: { content: responseContent },
    id: fc.id || `map-fallback-${Date.now()}`
  };
}

// =================================================================
// --- DISPATCHER ---
// =================================================================

export const toolHandlers: Record<string, (fc: SDKFunctionCall, config: HandlerConfig) => Promise<ToolHandlerResponse>> = {
  "getConferences": handleGetConferences,
  "getWebsiteInfo": handleGetWebsiteInfo,
  "navigation": handleNavigation,
  "manageFollow": handleManageFollow,
  "manageCalendar": handleManageCalendar,
  "manageBlacklist": handleManageBlacklist,
  "openGoogleMap": handleOpenGoogleMap,
};