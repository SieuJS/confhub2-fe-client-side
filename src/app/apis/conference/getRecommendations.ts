// src/app/apis/recommendation/getRecommendations.ts

import { appConfig } from "@/src/middleware";

// This is the URL of your running Python API server
const API_RECOMMENDATION_ENDPOINT = appConfig.NEXT_PUBLIC_RECOMMENDATION_SYSTEM_URL;

export interface RecommendationRequest {
  user_id: string;
  conference_ids: string[];
}

// The response will be a dictionary mapping conference IDs to their scores
export type RecommendationResponse = Record<string, number>;

export const fetchRecommendations = async (params: RecommendationRequest): Promise<RecommendationResponse> => {
  // Don't make a request if there are no conference IDs to score
  if (!params.conference_ids || params.conference_ids.length === 0) {
    return {};
  }

  try {
    const response = await fetch(API_RECOMMENDATION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      // Log the error but don't crash the app.
      // The recommendation is an enhancement, not a critical feature.
      console.error(`Recommendation API error! status: ${response.status}`);
      return {}; // Return an empty object on failure
    }

    const data: RecommendationResponse = await response.json();
    return data;

  } catch (error) {
    console.error("Failed to fetch recommendations:", error);
    return {}; // Return an empty object on network or other errors
  }
};