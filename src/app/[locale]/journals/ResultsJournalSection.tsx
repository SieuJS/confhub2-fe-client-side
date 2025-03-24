// ResultsJournalSection.tsx
"use client";

import React, { useState, useEffect } from 'react';
import EventJournalCard from './EventJournalCard';
import Pagination from '../utils/Pagination';
import useJournalResult from '@/src/hooks/journals/useJournalResult';

interface ResultsJournalSectionProps {
}


const ResultsJournalSection: React.FC<ResultsJournalSectionProps> = () => {
    const {
        journals,
        currentPage,
        journalsPerPage,
        sortBy,
        loading,
        error,
        currentJournals,
        paginate,
        handleSortByChange,
      } = useJournalResult();

    if (loading) {
        return <p>Đang tải journals...</p>;
    }

    if (!journals || journals.length === 0) {
        return <p>Không tìm thấy journal nào.</p>;
    }

    return (
        <div className="w-full pl-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">
                    Kết quả Journal ({journals.length})
                </h2>
                <div className="flex items-center rounded-md px-2 py-1">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M3 5a1 1 0 011-1h12a1 1 0 0110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 0110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 0110 2H4a1 1 0 01-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <span className="text-sm mr-1">Sắp xếp theo:</span>
                    <select
                        className="text-sm border rounded px-2 py-1 bg-transparent focus:outline-none"
                        value={sortBy}
                        onChange={handleSortByChange}
                    >
                        <option value="title">Tiêu đề</option>
                        <option value="issn">ISSN</option>
                        <option value="publisher">Nhà xuất bản</option>
                        {/* Language and other metrics might not be directly filterable/sortable based on provided JournalResponse */}
                        {/* <option value="language">Ngôn ngữ</option> */}
                        <option value="impactFactor">Impact Factor</option>
                        {/* <option value="citeScore">CiteScore</option> */}
                        <option value="sjr">SJR</option>
                        {/* <option value="overallRank">Xếp hạng tổng thể</option> */}
                        <option value="hIndex">H-index</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentJournals?.map((journal) => (
                    <EventJournalCard key={journal.Title} journal={journal} /> 
                ))}
            </div>

            {journals.length > 0 && (
                <Pagination
                    eventsPerPage={journalsPerPage}
                    totalEvents={journals.length}
                    paginate={paginate}
                    currentPage={currentPage}
                />
            )}
        </div>
    );
};

export default ResultsJournalSection;