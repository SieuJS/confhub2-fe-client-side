// src/app/[locale]/visualization/utils/fields.ts

import { DataField } from '../../../../models/visualization/visualization';
import { ConferenceResponse } from '@/src/models/response/conference.response';
import { getNestedValue } from './helpers'; // Import helper

// --- Constants ---
/**
 * Category name used for data points where the actual value is unknown or invalid.
 */
export const UNKNOWN_CATEGORY = 'Unknown';
const logPrefixFields = 'FIELDS:';

// --- Định nghĩa các châu lục hợp lệ ---
/**
 * A set of valid continent names for efficient lookup.
 * Used to standardize continent values.
 */
const VALID_CONTINENTS = new Set([
    'Africa',
    'Asia',
    'Europe',
    'North America',
    'South America',
    'Oceania',
    // 'Antarctica', // Add if relevant to your data
]);

// --- Helper để chọn mảng organizations dựa trên topics của organizations[0] ---
/**
 * Determines which organization object to use based on the presence of topics in the first organization.
 * If organizations[0] has topics, it uses organizations[0].
 * Otherwise, if organizations[1] exists, it uses organizations[1].
 * Returns an array containing the selected organization object, or an empty array if no organization is suitable.
 * @param item The ConferenceResponse object.
 * @returns An array containing the selected organization object, or an empty array.
 */
const selectOrganizationsArray = (item: ConferenceResponse): any[] => {
    const organizations = getNestedValue(item, 'organizations');

    // Ensure organizations is a non-empty array
    if (!Array.isArray(organizations) || organizations.length === 0) {
        // console.log(`${logPrefixFields} selectOrganizationsArray: No organizations found.`);
        return [];
    }

    // Check if organizations[0] exists and has a non-empty 'topics' array
    const org0 = organizations[0];
    const org0Topics = org0 ? getNestedValue(org0, 'topics') : undefined;

    if (org0 && Array.isArray(org0Topics) && org0Topics.length > 0) {
        // console.log(`${logPrefixFields} selectOrganizationsArray: Using organizations[0] based on topics.`);
        return [org0]; // Use organizations[0]
    } else {
        // If organizations[0] topics are empty or missing, try using organizations[1] if it exists
        const org1 = organizations.length > 1 ? organizations[1] : undefined;
        if (org1) {
            // console.log(`${logPrefixFields} selectOrganizationsArray: organizations[0].topics empty, using organizations[1].`);
            return [org1]; // Use organizations[1]
        } else {
            // console.warn(`${logPrefixFields} selectOrganizationsArray: organizations[0].topics empty and organizations[1] does not exist.`);
            return []; // No suitable organization found
        }
    }
};


// --- STABLE ACCESSOR DEFINITIONS ---
/**
 * Defines the accessor functions used to extract specific data points from a ConferenceResponse item.
 * These functions apply the logic to select the correct organization and handle missing/invalid data.
 */
const accessors = {
    /**
     * Accessor for the continent of the organization's first location.
     * Selects the organization based on the logic in `selectOrganizationsArray`.
     * Returns UNKNOWN_CATEGORY if the value is invalid or not found in the valid list.
     * @param item The ConferenceResponse object.
     * @returns The continent name or UNKNOWN_CATEGORY.
     */
    continent: (item: ConferenceResponse): string => {
        const selectedOrganizations = selectOrganizationsArray(item);
        if (selectedOrganizations.length === 0) {
            // console.log(`${logPrefixFields} continent accessor: No valid organizations array selected. Mapping to UNKNOWN.`);
            return UNKNOWN_CATEGORY;
        }

        const path = 'locations[0].continent'; // Path relative to the selected organization object
        const rawValue = getNestedValue(selectedOrganizations[0], path); // Get the value from the selected organization

        // 1. Handle null, undefined, or non-string data types
        if (rawValue === null || rawValue === undefined || typeof rawValue !== 'string') {
            // console.log(`${logPrefixFields} continent accessor: Value is null, undefined, or not a string. Mapping to UNKNOWN.`);
            return UNKNOWN_CATEGORY;
        }

        // 2. Trim leading/trailing whitespace
        const trimmedValue = rawValue.trim();

        // 3. Handle empty string after trim
        if (trimmedValue === '') {
            // console.log(`${logPrefixFields} continent accessor: Value is empty string after trim. Mapping to UNKNOWN.`);
            return UNKNOWN_CATEGORY;
        }

        // 4. Check if the trimmed value is in the set of valid continents
        if (VALID_CONTINENTS.has(trimmedValue)) {
            // console.log(`${logPrefixFields} continent accessor: Found valid continent "${trimmedValue}".`);
            return trimmedValue; // Return the valid continent name
        } else {
            // Value is a non-empty string, but not a standard continent in the list
            // console.warn(`${logPrefixFields} continent accessor: Non-standard continent value "${trimmedValue}" encountered. Mapping to UNKNOWN.`);
            return UNKNOWN_CATEGORY;
        }
    },

    /**
     * Accessor for the country of the organization's first location.
     * Selects the organization based on the logic in `selectOrganizationsArray`.
     * Returns UNKNOWN_CATEGORY if the value is null, undefined, or an empty string after trimming.
     * @param item The ConferenceResponse object.
     * @returns The country name or UNKNOWN_CATEGORY.
     */
    country: (item: ConferenceResponse): string => {
        const selectedOrganizations = selectOrganizationsArray(item);
        if (selectedOrganizations.length === 0) {
            return UNKNOWN_CATEGORY;
        }
        const path = 'locations[0].country'; // Path relative to the selected organization object
        const value = getNestedValue(selectedOrganizations[0], path);
        return (value === null || value === undefined || String(value).trim() === '') ? UNKNOWN_CATEGORY : String(value).trim();
    },

    /**
     * Accessor for the year of the organization.
     * Selects the organization based on the logic in `selectOrganizationsArray`.
     * Returns UNKNOWN_CATEGORY if the value is null, undefined, or an empty string after trimming.
     * Converts the year to a string.
     * @param item The ConferenceResponse object.
     * @returns The year as a string or UNKNOWN_CATEGORY.
     */
    year: (item: ConferenceResponse): string => {
        const selectedOrganizations = selectOrganizationsArray(item);
        if (selectedOrganizations.length === 0) {
             return UNKNOWN_CATEGORY;
        }
        const path = 'year'; // Path relative to the selected organization object
        const value = getNestedValue(selectedOrganizations[0], path);
        // Also handle cases where year might be 0 or similar falsy values if they shouldn't be used
        return (value !== null && value !== undefined && String(value).trim() !== '' && String(value) !== '0') ? String(value) : UNKNOWN_CATEGORY;
    },

    /**
     * Accessor for the access type of the organization.
     * Selects the organization based on the logic in `selectOrganizationsArray`.
     * Returns UNKNOWN_CATEGORY if the value is null, undefined, or an empty string after trimming.
     * @param item The ConferenceResponse object.
     * @returns The access type or UNKNOWN_CATEGORY.
     */
    accessType: (item: ConferenceResponse): string => {
        const selectedOrganizations = selectOrganizationsArray(item);
         if (selectedOrganizations.length === 0) {
             return UNKNOWN_CATEGORY;
         }
        const path = 'accessType'; // Path relative to the selected organization object
        const value = getNestedValue(selectedOrganizations[0], path);
         // Consider applying similar logic if you want to standardize Access Type to Unknown
        return (value === null || value === undefined || String(value).trim() === '') ? UNKNOWN_CATEGORY : String(value).trim();
    },

    /**
     * Accessor for the count of followers.
     * Does NOT depend on the selectOrganizationsArray logic as followers are on the main item.
     * Returns 0 if 'followBy' is not a valid array.
     * @param item The ConferenceResponse object.
     * @returns The number of followers.
     */
    followersCount: (item: ConferenceResponse): number => {
        const path = 'followBy';
        const value = getNestedValue(item, path);
        return Array.isArray(value) ? value.length : 0;
    },

    /**
     * Accessor for the count of feedbacks.
     * Does NOT depend on the selectOrganizationsArray logic as feedbacks are on the main item.
     * Returns 0 if 'feedbacks' is not a valid array.
     * @param item The ConferenceResponse object.
     * @returns The number of feedbacks.
     */
    feedbacksCount: (item: ConferenceResponse): number => {
        const path = 'feedbacks';
        const value = getNestedValue(item, path);
        return Array.isArray(value) ? value.length : 0;
    },

    /**
     * Accessor for the count of topics for the selected organization.
     * Selects the organization based on the logic in `selectOrganizationsArray`.
     * Returns 0 if the selected organization or its 'topics' property is not a valid array.
     * @param item The ConferenceResponse object.
     * @returns The number of topics.
     */
    topicsCount: (item: ConferenceResponse): number => {
         const selectedOrganizations = selectOrganizationsArray(item);
         if (selectedOrganizations.length === 0) {
             return 0; // No organizations to count topics from
         }
        const path = 'topics'; // Path relative to the selected organization object
        const value = getNestedValue(selectedOrganizations[0], path);
        return Array.isArray(value) ? value.length : 0;
    },

    /**
     * Accessor for the feedbacks array.
     * Does NOT depend on the selectOrganizationsArray logic as feedbacks are on the main item.
     * Returns an empty array if 'feedbacks' is not a valid array.
     * @param item The ConferenceResponse object.
     * @returns The feedbacks array or an empty array.
     */
     feedbacksArray: (item: ConferenceResponse): any[] => {
        const path = 'feedbacks';
        const value = getNestedValue(item, path);
        return Array.isArray(value) ? value : [];
    },
};

// --- STABLE FIELD DEFINITIONS (Template) ---
/**
 * A STABLE array of DataField objects defining the available fields for visualization.
 * Each DataField references an accessor function to extract data.
 * The 'id' values remain constant for external referencing, while accessors implement the data extraction logic.
 */
const AVAILABLE_FIELDS_TEMPLATE: DataField[] = [
    // Dimensions (Categorical or Discrete values)
    { id: 'organizations[0].locations[0].continent', name: 'Continent', type: 'dimension', accessor: accessors.continent },
    { id: 'organizations[0].locations[0].country', name: 'Country', type: 'dimension', accessor: accessors.country },
    { id: 'organizations[0].year', name: 'Year', type: 'dimension', accessor: accessors.year },
    { id: 'organizations[0].accessType', name: 'Access Type', type: 'dimension', accessor: accessors.accessType },

    // Measures (Quantitative values)
    { id: 'count_records', name: 'Record Count', type: 'measure', aggregation: 'count' }, // Special measure to count items
    // { id: 'count_followers', name: '# Followers', type: 'measure', accessor: accessors.followersCount, aggregation: 'sum' },
    // { id: 'count_feedbacks', name: '# Feedbacks', type: 'measure', accessor: accessors.feedbacksCount, aggregation: 'sum' },
    { id: 'count_topics', name: '# Topics', type: 'measure', accessor: accessors.topicsCount, aggregation: 'sum' },
    // {
    //     id: 'feedback_star_avg',
    //     name: 'Avg. Feedback Star',
    //     type: 'measure',
    //     accessor: accessors.feedbacksArray, 
    //     aggregation: 'average',
        
    // },
];

/**
 * Returns the STABLE list of available fields based on a template.
 * Ensures consistency regardless of the specific content of the sample item (as long as one exists).
 * This function is memoized implicitly by always returning the same `AVAILABLE_FIELDS_TEMPLATE` array reference.
 * @param sampleItem A sample raw data item (used only to check if data structure is available at all).
 * @returns A STABLE array of DataField objects, or an empty array if no sample data is provided or invalid.
 */
export const getAvailableFields = (sampleItem: ConferenceResponse | null | undefined): DataField[] => {
    // console.log(`${logPrefixFields} getAvailableFields called. Sample exists: ${!!sampleItem}`);
    if (!sampleItem || typeof sampleItem !== 'object') {
        // console.warn(`${logPrefixFields} Invalid or missing sampleItem. Returning empty fields.`);
        return [];
    }
    // Always return the same template object - reference stability for hooks
    // console.log(`${logPrefixFields} Returning STABLE template with ${AVAILABLE_FIELDS_TEMPLATE.length} fields.`);
    return AVAILABLE_FIELDS_TEMPLATE;
};