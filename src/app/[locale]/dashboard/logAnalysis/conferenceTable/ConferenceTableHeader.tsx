// src/app/[locale]/dashboard/logAnalysis/ConferenceTableHeader.tsx
import React from 'react';
import { FaSort, FaSortUp, FaSortDown, FaTimesCircle, FaSave, FaExclamationCircle } from 'react-icons/fa';
// --- IMPORT TYPE TỪ HOOK ---
import {
    SortableColumn, // <-- Import từ hook
    SortDirection   // <-- Import từ hook (nếu đã export)
} from '../../../../../hooks/logAnalysis/useConferenceTableManager'; // Điều chỉnh đường dẫn
interface ConferenceTableHeaderProps {
    sortColumn: SortableColumn | null; // <-- Sử dụng kiểu đã import
    sortDirection: SortDirection;      // <-- Sử dụng kiểu đã import/định nghĩa
    onSort: (column: SortableColumn) => void; // <-- Sử dụng kiểu đã import
}

export const ConferenceTableHeader: React.FC<ConferenceTableHeaderProps> = ({
    sortColumn,
    sortDirection,
    onSort,
}) => {

    const renderSortIcon = (column: SortableColumn) => {
        if (sortColumn !== column) {
            return <FaSort className="inline-block ml-1 text-gray-400" />;
        }
        return sortDirection === 'asc' ? (
            <FaSortUp className="inline-block ml-1 text-blue-600" />
        ) : (
            <FaSortDown className="inline-block ml-1 text-blue-600" />
        );
    };

    // Component SortButton cũng sẽ sử dụng kiểu đúng thông qua props của ConferenceTableHeaderProps
    const SortButton: React.FC<{ column: SortableColumn; title: string; className?: string; children: React.ReactNode }> = ({ column, title, className = '', children }) => (
        <button
            className={`flex items-center w-full text-left focus:outline-none group ${className}`}
            onClick={() => onSort(column)} // Gọi onSort với column có kiểu đúng
            title={`Sort by ${title} ${sortColumn === column ? (sortDirection === 'asc' ? '(Ascending)' : '(Descending)') : ''}`}
        >
            {children}
            {renderSortIcon(column)}
        </button>
    );


    return (
        <thead className="bg-gray-50">
            <tr>
                {/* Các cột hiện có */}
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[4%]">Select</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[6%]">Expand</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                    <SortButton column="title" title="Title">Title</SortButton>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                    <SortButton column="status" title="Status">Status</SortButton>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                    <SortButton column="durationSeconds" title="Duration">Duration</SortButton>
                </th>
                <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12" title="Google Search">Search</th>
                <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12" title="HTML Save">HTML</th>
                <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12" title="Link Processing">Links</th>
                <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12" title="Gemini Determine">Det.</th>
                <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12" title="Gemini Extract">Ext.</th>

                {/* --- CỘT MỚI: Validation Warnings --- */}
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                     <SortButton column="validationWarningCount" title="Validation Warning Count" className="justify-center">
                        {/* Sử dụng icon khác cho warning */}
                        <FaExclamationCircle className="inline mr-1 mb-0.5 text-amber-400" /> Warns
                    </SortButton>
                </th>

                {/* Cột Errors */}
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                    <SortButton column="errorCount" title="Error Count" className="justify-center">
                        <FaTimesCircle className="inline mr-1 mb-0.5 text-red-400" /> Errors
                    </SortButton>
                </th>

                {/* Cột Save Status */}
                <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[6%]" title="Save Status">
                    <FaSave className="inline-block" />
                </th>

            </tr>
        </thead>
    );
};