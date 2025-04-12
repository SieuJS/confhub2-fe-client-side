// src/app/[locale]/dashboard/logAnalysis/ConferenceTable.tsx
import React from 'react';
import { ConferenceTableData } from '../../../../../hooks/logAnalysis/useConferenceTableManager';
import { ConferenceTableHeader } from './ConferenceTableHeader';
import { ConferenceTableRow } from './ConferenceTableRow';

// Re-define types or import from hook/types file
type SortableColumn = 'title' | 'acronym' | 'status' | 'durationSeconds' | 'errorCount';
type SortDirection = 'asc' | 'desc';

// NEW: Define RowSaveStatus type here or import it
import { RowSaveStatus } from './ConferenceTableRow';

interface ConferenceTableProps {
    data: ConferenceTableData[];
    selectedConferences: Record<string, boolean>;
    expandedConference: string | null;
    sortColumn: SortableColumn | null;
    sortDirection: SortDirection;
    // NEW Props
    rowSaveStatus: Record<string, RowSaveStatus>;
    rowSaveErrors: Record<string, string>;
    // Callbacks
    onSort: (column: SortableColumn) => void;
    onToggleExpand: (title: string) => void;
    onSelectToggle: (title: string) => void;
}

export const ConferenceTable: React.FC<ConferenceTableProps> = ({
    data,
    selectedConferences,
    expandedConference,
    sortColumn,
    sortDirection,
    rowSaveStatus, // Destructure new props
    rowSaveErrors, // Destructure new props
    onSort,
    onToggleExpand,
    onSelectToggle,
}) => {
    return (
        <div className="bg-white shadow-lg rounded-lg overflow-x-auto border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <ConferenceTableHeader
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={onSort}
                />
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((confData) => {
                        const title = confData.title;
                        return (
                            <ConferenceTableRow
                                key={title}
                                confData={confData}
                                isSelected={!!selectedConferences[title]}
                                isExpanded={expandedConference === title}
                                onSelectToggle={onSelectToggle}
                                onToggleExpand={onToggleExpand}
                                // Pass the specific status and error for this row
                                saveStatus={rowSaveStatus[title] || 'idle'} // Default to 'idle' if not found
                                saveError={rowSaveErrors[title]}
                            />
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};