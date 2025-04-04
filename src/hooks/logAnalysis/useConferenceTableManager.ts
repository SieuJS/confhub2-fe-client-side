// src/hooks/useConferenceTableManager.ts
import { useState, useMemo, useCallback, useEffect } from 'react';
import { ConferenceAnalysisDetail } from '@/src/models/logAnalysis/logAnalysis';
import { saveConferenceToJson } from '../../app/api/logAnalysis/saveConferences'; 

// Re-define types needed within the hook or import from a central types file
type SortableColumn = 'acronym' | 'status' | 'durationSeconds' | 'errorCount';
type SortDirection = 'asc' | 'desc';
type MainSavingStatus = 'idle' | 'saving' | 'success' | 'error';

// Interface for the data structure used internally by the hook/table
export interface ConferenceTableData extends ConferenceAnalysisDetail {
    acronym: string;
    errorCount: number;
    title: string; // Ensure title is always present
}

// NEW: Type for row-specific save status
type RowSaveStatus = 'idle' | 'success' | 'error';

export interface UseConferenceTableManagerProps {
    initialData: Record<string, ConferenceAnalysisDetail> | null | undefined;
}


export const useConferenceTableManager = ({ initialData }: UseConferenceTableManagerProps) => {
    const [expandedConference, setExpandedConference] = useState<string | null>(null);
    const [sortColumn, setSortColumn] = useState<SortableColumn | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [selectedConferences, setSelectedConferences] = useState<Record<string, boolean>>({});
    const [mainSaveStatus, setMainSaveStatus] = useState<MainSavingStatus>('idle');

    // --- NEW State for Row Status ---
    const [rowSaveStatus, setRowSaveStatus] = useState<Record<string, RowSaveStatus>>({});
    const [rowSaveErrors, setRowSaveErrors] = useState<Record<string, string>>({}); // Store error message per acronym


    // --- Data Preparation ---
    const conferenceDataArray: ConferenceTableData[] = useMemo(() => {
        if (!initialData) return [];
        return Object.entries(initialData).map(([keyAcronym, data]) => ({
            ...data,
            acronym: keyAcronym,
            errorCount: data.errors?.length || 0,
            title: data.title || '', // Ensure title exists
        }));
    }, [initialData]);

    // --- Effect to initialize/reset row statuses when data changes ---
    useEffect(() => {
        const initialStatus: Record<string, RowSaveStatus> = {};
        conferenceDataArray.forEach(conf => {
            initialStatus[conf.acronym] = 'idle';
        });
        setRowSaveStatus(initialStatus);
        setRowSaveErrors({}); // Clear previous errors
        setSelectedConferences({}); // Reset selection
        setMainSaveStatus('idle'); // Reset main button
        setExpandedConference(null); // Collapse all rows
    }, [conferenceDataArray]); // Dependency on the processed data array



    // --- Sorting ---
    const sortedData = useMemo(() => {
        if (!sortColumn) return conferenceDataArray;
        // Sorting logic remains the same as before...
        return [...conferenceDataArray].sort((a, b) => {
             let aValue: any = a[sortColumn];
             let bValue: any = b[sortColumn];

             const handleNull = (val: any) => (val === null || val === undefined);
             if (handleNull(aValue) && handleNull(bValue)) return 0;
             if (handleNull(aValue)) return sortDirection === 'asc' ? 1 : -1;
             if (handleNull(bValue)) return sortDirection === 'asc' ? -1 : 1;

             switch (sortColumn) {
                 case 'acronym':
                 case 'status':
                     aValue = String(aValue).toLowerCase();
                     bValue = String(bValue).toLowerCase();
                     if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
                     if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
                     return 0;
                 case 'durationSeconds':
                 case 'errorCount':
                     aValue = Number(aValue);
                     bValue = Number(bValue);
                     return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
                 default:
                     return 0;
             }
         });
    }, [conferenceDataArray, sortColumn, sortDirection]);

    const handleSort = useCallback((column: SortableColumn) => {
        if (sortColumn === column) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    }, [sortColumn]);


    // --- Selection ---
    const selectedAcronyms = useMemo(() => {
        return Object.entries(selectedConferences)
            .filter(([, isSelected]) => isSelected)
            .map(([acronym]) => acronym);
    }, [selectedConferences]);

    const handleRowSelectToggle = useCallback((acronym: string) => {
        setSelectedConferences(prev => ({
            ...prev,
            [acronym]: !prev[acronym]
        }));
    }, []);

    const handleSelectAll = useCallback(() => {
        const newSelection: Record<string, boolean> = {};
        sortedData.forEach(conf => { newSelection[conf.acronym] = true; });
        setSelectedConferences(newSelection);
    }, [sortedData]);

    const handleDeselectAll = useCallback(() => {
        setSelectedConferences({});
    }, []);

    const handleSelectNoError = useCallback(() => {
        const newSelection: Record<string, boolean> = {};
        sortedData.forEach(conf => { if (conf.errorCount === 0) newSelection[conf.acronym] = true; });
        setSelectedConferences(newSelection);
    }, [sortedData]);

    const handleSelectError = useCallback(() => {
        const newSelection: Record<string, boolean> = {};
        sortedData.forEach(conf => { if (conf.errorCount > 0) newSelection[conf.acronym] = true; });
        setSelectedConferences(newSelection);
    }, [sortedData]);

    // --- Expand/Collapse ---
    const toggleExpand = useCallback((acronym: string) => {
        setExpandedConference(prev => (prev === acronym ? null : acronym));
    }, []);

    // --- Saving Logic ---
    const isSelectedWithError = useMemo(() => {
        if (selectedAcronyms.length === 0) return false;
        const selectedData = sortedData.filter(conf => selectedConferences[conf.acronym]);
        return selectedData.some(conf => conf.errorCount > 0);
    }, [selectedAcronyms, selectedConferences, sortedData]);

    const isSaveEnabled = useMemo(() => {
        return selectedAcronyms.length > 0 && !isSelectedWithError && mainSaveStatus !== 'saving';
    }, [selectedAcronyms, isSelectedWithError, mainSaveStatus]);

     // Effect to reset main save status when selection changes AFTER an operation
    useEffect(() => {
        if (mainSaveStatus === 'error' || mainSaveStatus === 'success') {
             setMainSaveStatus('idle');
             // Do NOT reset rowSaveStatus or rowSaveErrors here, they persist until next save
        }
    }, [selectedConferences, mainSaveStatus]);


    // MODIFIED: Handle Bulk Save to update row statuses
    const handleBulkSave = useCallback(async () => {
        if (!isSaveEnabled) return;

        setMainSaveStatus('saving');
        // Reset statuses and errors ONLY for the items about to be saved
        const nextRowStatus = { ...rowSaveStatus };
        const nextRowErrors = { ...rowSaveErrors };
        selectedAcronyms.forEach(acronym => {
            nextRowStatus[acronym] = 'idle'; // Reset to idle before attempting save
            delete nextRowErrors[acronym];   // Clear previous error for this item
        });
        setRowSaveStatus(nextRowStatus); // Update state to potentially clear old icons visually
        setRowSaveErrors(nextRowErrors);

        console.log(`Starting bulk save for: ${selectedAcronyms.join(', ')}`);

        const itemsToSave = conferenceDataArray.filter(conf => selectedConferences[conf.acronym]);
        const savePromises = itemsToSave.map(conf =>
            saveConferenceToJson(conf.acronym, conf.title)
        );

        const results = await Promise.allSettled(savePromises);

        // Process results and update final row statuses/errors
        const finalRowStatus: Record<string, RowSaveStatus> = { ...nextRowStatus }; // Start from the reset state
        const finalRowErrors: Record<string, string> = { ...nextRowErrors };
        let overallSuccess = true;
        let successfulSaves = 0;
        let failedSaves = 0;

        results.forEach(result => {
            if (result.status === 'rejected') {
                overallSuccess = false;
                failedSaves++;
                const reason = result.reason as { acronym: string; message: string };
                finalRowStatus[reason.acronym] = 'error';
                finalRowErrors[reason.acronym] = reason.message;
                console.error(`Bulk Save Error (Rejected): ${reason.acronym}`, reason.message);
            } else if (result.status === 'fulfilled') {
                const response = result.value;
                if (!response.success) {
                    overallSuccess = false;
                    failedSaves++;
                    finalRowStatus[response.acronym] = 'error';
                    finalRowErrors[response.acronym] = response.message;
                    console.error(`Bulk Save Error (Fulfilled, Backend Fail): ${response.acronym}`, response.message);
                } else {
                    successfulSaves++;
                    finalRowStatus[response.acronym] = 'success';
                     console.log(`Bulk Save Success: ${response.acronym}`);
                }
            }
        });

        // Update state once with the final results
        setRowSaveStatus(finalRowStatus);
        setRowSaveErrors(finalRowErrors);

        if (overallSuccess) {
            setMainSaveStatus('success');
            console.log(`Bulk save completed successfully for ${successfulSaves} items.`);
            handleDeselectAll(); // Clear selection on success
            setTimeout(() => setMainSaveStatus('idle'), 3000);
        } else {
            setMainSaveStatus('error');
            console.error(`Bulk save completed with ${failedSaves} error(s) out of ${selectedAcronyms.length} selected items.`);
             // Errors are shown per row, main button just indicates failure happened.
             // Optionally, keep error state longer or until next action
        }
    }, [isSaveEnabled, selectedAcronyms, selectedConferences, conferenceDataArray, rowSaveStatus, rowSaveErrors, handleDeselectAll]); // Added row status/errors


    // --- Mock Crawl Again Logic ---
    const handleCrawlAgain = useCallback(() => {
        if (selectedAcronyms.length === 0) return;
        console.log("--- MOCK CRAWL AGAIN ---");
        console.log("Would trigger crawl for:", selectedAcronyms.join(', '));
        alert(`Mock: Triggering crawl again for ${selectedAcronyms.length} conference(s):\n${selectedAcronyms.join('\n')}`);
        // Placeholder for future API call, e.g., using crawlConferenceAgain service
    }, [selectedAcronyms]);


    // --- Return state and handlers ---
    // --- Return state and handlers ---
    return {
        // Data
        sortedData,
        conferenceDataArray,

        // Sorting
        sortColumn,
        sortDirection,
        handleSort,

        // Selection
        selectedConferences,
        selectedAcronyms,
        handleRowSelectToggle,
        handleSelectAll,
        handleSelectNoError,
        handleSelectError,
        handleDeselectAll,

        // Expansion
        expandedConference,
        toggleExpand,

        // Saving
        mainSaveStatus,
        isSaveEnabled,
        handleBulkSave,
        // NEW: Row specific status/errors
        rowSaveStatus,
        rowSaveErrors,

        // Other Actions
        handleCrawlAgain,
    };
};