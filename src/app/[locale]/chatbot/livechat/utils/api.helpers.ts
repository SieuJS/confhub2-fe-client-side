// src/app/[locale]/chatbot/livechat/utils/api.helpers.ts

// Placeholder for client-side auth token retrieval
// IMPORTANT: Implement this based on your application's auth mechanism
export const getAuthTokenClientSide = async (): Promise<string | null> => {
  const token = localStorage.getItem('token');
  if (!token || token === "YOUR_ACTUAL_USER_TOKEN_FROM_CLIENT_STORAGE_OR_CONTEXT") {
    // console.warn("getAuthTokenClientSide: Dummy or no token returned. Implement actual token retrieval.");
    // In a real scenario, you might want to throw an error or return null
    // if the action requires auth and no token is available.
    // return null; // Or throw new Error("Authentication token not found.");
  }
  return token;
};

// Generic API call helper for frontend
export async function makeFrontendApiCall(
  url: string,
  method: 'GET' | 'POST' | 'DELETE' | 'PUT',
  token: string | null,
  body?: any
): Promise<any> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorData;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = await response.text(); // Fallback if JSON parsing fails
      }
    } else {
      errorData = await response.text();
    }
    // console.error(`Frontend API call to ${url} (method ${method}) failed with status ${response.status}:`, errorData);
    const message = (typeof errorData === 'object' && errorData?.message) ? errorData.message :
      (typeof errorData === 'string' && errorData.trim() !== '') ? errorData :
        `API Error (${response.status})`;
    throw new Error(message);
  }

  // Handle 204 No Content or responses with content-length 0 (e.g., some successful POST/DELETE)
  if (response.status === 204 || response.status === 201 && response.headers.get("content-length") === "0" ) {
    return { success: true, message: "Operation successful." };
  }
  if (response.headers.get("content-length") === "0") { // General check for no content
      return { success: true, message: "Operation successful, no content returned." };
  }

  return response.json(); // Assuming successful responses with content are JSON
}

// Helper to find item ID and name by identifier (acronym, title, or ID)
export async function fetchItemDetailsFromApi(
  identifier: string,
  identifierType: 'acronym' | 'title' | 'id',
  itemType: 'conference',
  databaseUrl: string // Pass the base URL
): Promise<{ id: string; name: string }> {
  if (!identifier) throw new Error("Identifier is required.");

  const searchApiUrl = `${databaseUrl}/${itemType}`; // e.g., /api/v1/conference
  const params = new URLSearchParams({ perPage: '1' });

  if (identifierType === 'id') {
    params.set('id', identifier);
  } else if (identifierType === 'acronym') {
    params.set('acronym', identifier);
  } else if (identifierType === 'title') {
    params.set('title', identifier);
  } else {
    throw new Error(`Unsupported identifier type: ${identifierType}`);
  }

  const finalUrl = `${searchApiUrl}?${params.toString()}`;

  const response = await fetch(finalUrl, { method: 'GET', headers: { 'Accept': 'application/json' } });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch ${itemType} details for "${identifier}" from ${finalUrl}: ${response.status} ${errorText.substring(0, 100)}`);
  }
  const result = await response.json();

  let itemData;
  if (result && Array.isArray(result.payload) && result.payload.length > 0) {
    itemData = result.payload[0];
  } else if (Array.isArray(result) && result.length > 0) {
    itemData = result[0];
  } else if (result && result.id) {
    itemData = result;
  }

  if (itemData && itemData.id) {
    return { id: itemData.id, name: itemData.title || itemData.acronym || itemData.id };
  } else {
    throw new Error(`${itemType} not found with ${identifierType} "${identifier}", or ID missing in response.`);
  }
}

// Helper to format a list of items for the model's response
export function formatItemsForModel(items: any[], itemType: string): string {
  if (!items || items.length === 0) {
    return `You are not following any ${itemType}s.`;
  }
  const formatted = items.map(item => {
    let display = `- ${item.title || 'Unknown Title'}`;
    if (item.acronym) display += ` (${item.acronym})`;
    return display;
  }).join('\n');
  return `Here are the ${itemType}s you are following:\n${formatted}`;
}

export function getUrlArg(fcArgs: any): string | undefined {
    return fcArgs && typeof fcArgs === 'object' && typeof fcArgs.url === 'string'
      ? fcArgs.url
      : undefined;
}