// src/app/[locale]/dashboard/logAnalysis/ConferenceTableRow.tsx
import React from 'react';
import { FaChevronDown, FaChevronUp, FaTimesCircle, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { ConferenceTableData } from '../../../../../hooks/logAnalysis/useConferenceTableManager'; // Import shared data type
import { StatusIcon } from '../StatusIcon'; // Adjust path if needed
import { formatDuration } from '../utils/commonUtils'; // Adjust path if needed

// NEW: Define RowSaveStatus type here or import it
export type RowSaveStatus = 'idle' | 'success' | 'error';

interface ConferenceTableRowProps {
    confData: ConferenceTableData;
    isSelected: boolean;
    isExpanded: boolean;
    onSelectToggle: (title: string) => void;
    onToggleExpand: (title: string) => void;
    saveStatus: RowSaveStatus;
    saveError?: string;
}

export const ConferenceTableRow: React.FC<ConferenceTableRowProps> = ({
    confData,
    isSelected,
    isExpanded,
    onSelectToggle,
    onToggleExpand,
    saveStatus, // Destructure new props
    saveError,   // Destructure new props
}) => {
    // --- Lấy thêm dữ liệu validation ---
    const { title, acronym, status, durationSeconds, steps, errors, finalResultPreview, errorCount, validationWarningCount, hasValidationWarnings, validationWarnings } = confData;
    const hasErrors = errorCount > 0;
    // const hasValidationWarnings = validationWarningCount > 0; // Đã có từ confData

    // Row Background Logic (Cập nhật để ưu tiên Error > Warning > Selected > Status)
    let rowBgClass = 'hover:bg-gray-50'; // Default hover
    let statusPulseClass = '';

    if (hasErrors) {
        rowBgClass = isSelected ? 'bg-red-100 hover:bg-red-200' : 'bg-red-50 hover:bg-red-100'; // Ưu tiên màu đỏ cho lỗi
    } else if (hasValidationWarnings) {
        rowBgClass = isSelected ? 'bg-amber-100 hover:bg-amber-200' : 'bg-amber-50 hover:bg-amber-100'; // Màu vàng/cam cho warning
    } else if (isSelected) {
        rowBgClass = 'bg-blue-50 hover:bg-blue-100'; // Màu xanh cho selected (khi không có lỗi/warning)
    } else {
        // Màu theo status chỉ khi không có lỗi/warning và không được chọn
        if (status === 'failed') rowBgClass = 'bg-red-50 hover:bg-red-100'; // Vẫn cần nếu status là failed nhưng errorCount = 0?
        else if (status === 'processing') { rowBgClass = 'bg-blue-50 hover:bg-blue-100'; statusPulseClass = 'animate-pulse'; }
        else if (status === 'completed') rowBgClass = 'hover:bg-green-100'; // Màu xanh lá cho completed
    }

    // Status Badge Logic
    let statusBadgeClass = 'bg-gray-100 text-gray-800';
    switch (status) {
        case 'completed': statusBadgeClass = 'bg-green-100 text-green-800'; break;
        case 'failed': statusBadgeClass = 'bg-red-100 text-red-800'; break;
        case 'processing': statusBadgeClass = `bg-blue-100 text-blue-800 ${statusPulseClass}`; break;
        case 'unknown': statusBadgeClass = 'bg-yellow-100 text-yellow-800'; break;
    }

    // Link Icon Logic
    const linkAttempted = (steps?.link_processing_attempted ?? 0) > 0;
    const linkAllSuccess = steps?.link_processing_success === steps?.link_processing_attempted;
    const linkHasAttemptsButNotAllSuccess = linkAttempted && !linkAllSuccess;

    // --- CẬP NHẬT colSpan cho expanded row ---
    const colSpan = 13; // Select + Expand + 9 data + Warns + Errors + Saved

    return (
        <React.Fragment>
            {/* Main Data Row */}
            <tr className={`${rowBgClass} transition-colors duration-150`}>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                    {/* Checkbox */}
                    <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                        checked={isSelected}
                        onChange={() => onSelectToggle(title)}
                        aria-label={`Select ${title}`}
                        title={`Select/Deselect ${title}`}
                    />
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                    {/* Expand Button */}
                    <button onClick={() => onToggleExpand(title)} className="text-blue-600 hover:text-blue-800 focus:outline-none" title={isExpanded ? 'Collapse Details' : 'Expand Details'}>
                        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                </td>


                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{title.substring(0, 50)}...</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {/* Status Badge */}

                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeClass}`}>
                        {status || 'N/A'}
                    </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatDuration(durationSeconds)}</td>
                {/* Step Icons */}
                <td className="px-2 py-2 whitespace-nowrap text-center text-lg"><StatusIcon success={steps?.search_success} attempted={steps?.search_attempted} /></td>
                <td className="px-2 py-2 whitespace-nowrap text-center text-lg"><StatusIcon success={steps?.html_save_success} attempted={steps?.html_save_attempted} /></td>
                <td className="px-2 py-2 whitespace-nowrap text-center text-lg">
                    <StatusIcon success={linkAttempted ? linkAllSuccess : null} attempted={linkAttempted} hasAttempts={linkHasAttemptsButNotAllSuccess} />
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-center text-lg"><StatusIcon success={steps?.gemini_determine_success} attempted={steps?.gemini_determine_attempted} /></td>
                <td className="px-2 py-2 whitespace-nowrap text-center text-lg"><StatusIcon success={steps?.gemini_extract_success} attempted={steps?.gemini_extract_attempted} /></td>

                {/* --- CỘT MỚI: Validation Warning Count --- */}
                <td className={`px-4 py-2 whitespace-nowrap text-sm text-center font-medium ${hasValidationWarnings ? 'text-amber-600 font-bold' : 'text-gray-500'}`}>
                    {hasValidationWarnings && <FaExclamationCircle className="inline mr-1 mb-0.5 text-amber-500" title={`Validation Warnings: ${validationWarningCount}`} />}
                    {validationWarningCount}
                </td>

                {/* Cột Error Count */}
                <td className={`px-4 py-2 whitespace-nowrap text-sm text-center font-medium ${hasErrors ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                    {hasErrors && <FaTimesCircle className="inline mr-1 mb-0.5 text-red-500" title={`Errors: ${errorCount}`} />}
                    {errorCount}
                </td>

                {/* Cột Save Status */}
                <td className="px-2 py-2 whitespace-nowrap text-right text-lg">
                    {saveStatus === 'success' && (
                        <FaCheckCircle
                            className="text-green-500"
                            title="Saved successfully in the last operation"
                        />
                    )}
                    {saveStatus === 'error' && (
                        <FaTimesCircle
                            className="text-red-500"
                            title={`Save failed: ${saveError || 'Unknown error'}`} // Show error in tooltip
                        />
                    )}
                    {/* 'idle' status shows nothing */}
                </td>
            </tr>

            {/* Expanded Row Content */}
            {isExpanded && (
                <tr className="bg-gray-50 border-l-4 border-blue-200">
                    <td colSpan={colSpan} className="px-6 py-4 text-sm text-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Extracted Data Preview */}
                            <div>
                                <h4 className="font-semibold mb-2 text-gray-800">Extracted Data Preview:</h4>
                                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-80 border border-gray-200 custom-scrollbar">
                                    {finalResultPreview ? JSON.stringify(finalResultPreview, null, 2) : 'No preview available.'}
                                </pre>
                            </div>
                            {/* Errors & Steps Details & Validation Warnings */}
                            <div>
                                {/* Hiển thị Errors (nếu có) */}
                                {hasErrors && (
                                    <div className="mb-4">
                                        <h4 className="font-semibold mb-1 text-red-700">Errors ({errorCount}):</h4>
                                        <ul className="list-disc list-inside text-xs text-red-600 max-h-40 overflow-y-auto bg-red-50 p-2 rounded border border-red-200 space-y-1 custom-scrollbar">
                                            {errors?.map((err: any, index: number) => (
                                                <li key={index} className="break-words">
                                                    {typeof err === 'object' ? JSON.stringify(err) : String(err)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {/* --- HIỂN THỊ VALIDATION WARNINGS (Nếu có) --- */}
                                {hasValidationWarnings && validationWarnings && validationWarnings.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="font-semibold mb-1 text-amber-700">Validation Warnings ({validationWarningCount}):</h4>
                                        <ul className="list-disc list-inside text-xs text-amber-700 max-h-40 overflow-y-auto bg-amber-50 p-2 rounded border border-amber-200 space-y-1 custom-scrollbar">
                                            {validationWarnings.map((warn, index) => (
                                                <li key={index} className="break-words">
                                                    <span className="font-medium">{warn.field}:</span> {String(warn.value)} <span className="text-gray-500">({warn.action})</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {/* Link Access Failures */}

                                {steps.link_processing_failed && steps.link_processing_failed.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="font-semibold mb-1 text-yellow-700">Link Access Failures ({steps.link_processing_failed.length}):</h4>
                                        <ul className="list-disc list-inside text-xs text-yellow-600 max-h-40 overflow-y-auto bg-yellow-50 p-2 rounded border border-yellow-200 space-y-1 custom-scrollbar">
                                            {steps.link_processing_failed.map((err: any, index: number) => (
                                                <li key={index} className="break-words">
                                                    {typeof err === 'object' ? JSON.stringify(err) : String(err)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-semibold mb-2 text-gray-800">Step Details:</h4>
                                    {/* Step details list remains the same */}
                                    <ul className="list-none text-xs space-y-1.5">
                                        <li className="flex justify-between border-b pb-1 border-gray-200"><span>Search:</span> <span><strong>{steps?.search_attempts_count ?? 0}</strong> att / <strong>{steps?.search_results_count ?? 0}</strong> res / <strong>{steps?.search_filtered_count ?? 0}</strong> filt</span></li>
                                        <li className="flex justify-between border-b pb-1 border-gray-200"><span>HTML Save:</span> <span>{steps?.html_save_attempted ? `Attempted (${steps?.html_save_success ? 'OK' : 'Fail'})` : 'Skipped'}</span></li>
                                        <li className="flex justify-between border-b pb-1 border-gray-200"><span>Links Processed:</span> <span><strong>{steps?.link_processing_success ?? 0}</strong> / {steps?.link_processing_attempted ?? 0}</span></li>
                                        <li className="flex justify-between border-b pb-1 border-gray-200"><span>Gemini Determine:</span> <span>{steps?.gemini_determine_attempted ? `Attempted (${steps?.gemini_determine_success ? 'OK' : 'Fail'})` : 'Skipped'} {steps?.gemini_determine_cache_used ? '(Cache)' : ''}</span></li>
                                        <li className="flex justify-between"><span>Gemini Extract:</span> <span>{steps?.gemini_extract_attempted ? `Attempted (${steps?.gemini_extract_success ? 'OK' : 'Fail'})` : 'Skipped'} {steps?.gemini_extract_cache_used ? '(Cache)' : ''}</span></li>
                                    </ul>
                                </div>


                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </React.Fragment>
    );
};