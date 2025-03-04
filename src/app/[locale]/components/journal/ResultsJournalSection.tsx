// ResultsJournalSection.tsx
"use client";

import React, { useState, useEffect } from 'react';
import EventJournalCard from './EventJournalCard';
import Pagination from '../utils/Pagination';
import { JournalResponse } from '../../../../models/response/journal.response';
import journalsList from '../../../../models/data/journals-list.json'; // Nhập journals-list.json

interface ResultsJournalSectionProps {
    searchQuery: string;
    selectedCountry: string | null;
    selectedPublicationType: string | null;
    selectedSubjectAreas: string[];
    selectedQuartile: string | null;
    selectedOpenAccessTypes: string[];
    selectedPublisher: string | null;
    selectedLanguage: string | null;
    selectedImpactFactor: string | null;
    selectedHIndex: string | null;
    selectedCiteScore: string | null;
    selectedSJR: string | null;
    selectedOverallRank: string | null;
    selectedISSN: string | null;
    loading?: boolean;
}

type JournalSortOption = 'title' | 'issn' | 'publisher' | 'language' | 'impactFactor' | 'citeScore' | 'sjr' | 'overallRank' | 'hIndex';

type JournalEvent = JournalResponse; // Cái này có vẻ không được sử dụng, hãy xem xét xóa.

const ResultsJournalSection: React.FC<ResultsJournalSectionProps> = ({
    searchQuery, selectedCountry, selectedPublicationType,
    selectedSubjectAreas, selectedQuartile, selectedOpenAccessTypes,
    selectedPublisher, selectedLanguage, selectedImpactFactor, selectedHIndex,
    selectedCiteScore, selectedSJR, selectedOverallRank, selectedISSN, loading
}) => {
    const [journals, setJournals] = useState<JournalResponse[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const journalsPerPage = 6;
    const [sortBy, setSortBy] = useState<JournalSortOption>('title');


    useEffect(() => {
        let filteredJournals = journalsList as JournalResponse[]; // Bắt đầu với danh sách đầy đủ

        if (searchQuery) {
            filteredJournals = filteredJournals.filter(journal =>
                journal.Title.toLowerCase().includes(searchQuery.toLowerCase()) // Use journal.Title
            );
        }

        if (selectedCountry) {
            filteredJournals = filteredJournals.filter(journal =>
                journal.Country === selectedCountry // Use journal.Country
            );
        }

        if (selectedPublicationType) {
            filteredJournals = filteredJournals.filter(journal =>
                journal.Type === selectedPublicationType // Use journal.Type
            );
        }
        if (selectedSubjectAreas && selectedSubjectAreas.length > 0) {
            filteredJournals = filteredJournals.filter(journal =>
                journal["Subject Area and Category"]?.Topics?.some(topic => selectedSubjectAreas.includes(topic)) // Use journal["Subject Area and Category"]?.Topics
            );
        }

        if (selectedQuartile) {
            filteredJournals = filteredJournals.filter(journal =>
                // bestQuartileOverall is not directly available in JournalResponse, you might need to adjust based on your data source
                // Assuming Quartile information is in SupplementaryTable, but filtering directly by quartile might not be straightforward
                // For now, this filter might not work as expected without further logic to derive quartile from JournalResponse
                journal.SupplementaryTable?.some(item => item.Quartile === selectedQuartile) // Example: Check if ANY SupplementaryTable entry matches selected Quartile
            );
        }

        if (selectedOpenAccessTypes && selectedOpenAccessTypes.length > 0) {
            filteredJournals = filteredJournals.filter(journal =>
                // openAccessType is not directly available in JournalResponse, you might need to adjust based on your data source
                // This filter might need to be adjusted or removed based on your JournalResponse structure
                false // Placeholder: Open Access Type filtering not directly applicable with provided JournalResponse
            );
        }

        if (selectedPublisher) {
            filteredJournals = filteredJournals.filter(journal =>
                journal.Publisher === selectedPublisher // Use journal.Publisher
            );
        }

        if (selectedLanguage) {
            filteredJournals = filteredJournals.filter(journal =>
                // Language is not directly available in JournalResponse, you might need to adjust based on your data source
                false // Placeholder: Language filtering not directly applicable with provided JournalResponse
            );
        }

        if (selectedISSN) {
            filteredJournals = filteredJournals.filter(journal =>
                journal.ISSN.includes(selectedISSN) // Use journal.ISSN.includes
            );
        }

        // Bộ lọc chỉ số - Adjust metric filtering to use properties from JournalResponse
        const filterMetric = (metricValue: string | undefined, selectedValue: string | null): boolean => { // Metric values are strings in JournalResponse
            if (!selectedValue || metricValue === undefined) return true;
            try {
                const selectedNum = parseFloat(selectedValue.replace(/[^0-9.-]/g, ''));
                const journalNum = parseFloat(metricValue.replace(/[^0-9.-]/g, '')); // Parse metricValue string to number

                if (selectedValue.startsWith(">=")) return journalNum >= selectedNum;
                if (selectedValue.startsWith(">")) return journalNum > selectedNum;
                if (selectedValue.startsWith("<=")) return journalNum <= selectedNum;
                if (selectedValue.startsWith("<")) return journalNum < selectedNum;
                if (selectedValue.includes("-")) {
                    const [minStr, maxStr] = selectedValue.split("-");
                    const min = parseFloat(minStr);
                    const max = parseFloat(maxStr);
                    return journalNum >= min && journalNum <= max;
                }

                return journalNum === selectedNum;
            } catch (error) {
                console.error("Lỗi khi phân tích giá trị chỉ số:", error);
                return true; // Hoặc xử lý lỗi một cách tốt hơn
            }
        };

        if (selectedImpactFactor) {
            filteredJournals = filteredJournals.filter(journal => filterMetric(journal.bioxbio[0]?.Impact_factor, selectedImpactFactor)); // Use bioxbio[0]?.Impact_factor
        }
        if (selectedHIndex) {
            filteredJournals = filteredJournals.filter(journal => filterMetric(journal["H index"], selectedHIndex)); // Use journal["H index"]
        }
        if (selectedCiteScore) {
            // CiteScore is not directly available in JournalResponse, filter might not be applicable
            // filteredJournals = filteredJournals.filter(journal => filterMetric(journal.metrics?.citeScore, selectedCiteScore));
        }
        if (selectedSJR) {
            filteredJournals = filteredJournals.filter(journal => filterMetric(journal.SJR, selectedSJR)); // Use journal.SJR
        }
        if (selectedOverallRank) {
            // OverallRank is not directly available in JournalResponse, filter might not be applicable
            // filteredJournals = filteredJournals.filter(journal => filterMetric(journal.metrics?.overallRank, selectedOverallRank));
        }

        // Áp dụng sắp xếp
        let sortedJournals = [...filteredJournals]; // Tạo một bản sao *trước khi* sắp xếp
        switch (sortBy) {
            case 'title':
                sortedJournals.sort((a, b) => a.Title.localeCompare(b.Title)); // Use journal.Title
                break;
            case 'issn':
                sortedJournals.sort((a, b) => (a.ISSN || '').localeCompare(b.ISSN || '')); // Use journal.ISSN
                break;
            case 'publisher':
                sortedJournals.sort((a, b) => (a.Publisher || '').localeCompare(b.Publisher || '')); // Use journal.Publisher
                break;
            case 'language':
                // Language is not directly available, sorting by language is not applicable
                break;
            case 'impactFactor':
                sortedJournals.sort((a, b) => { // Sort by latest Impact Factor
                    const impactFactorA = parseFloat(a.bioxbio[0]?.Impact_factor || '0');
                    const impactFactorB = parseFloat(b.bioxbio[0]?.Impact_factor || '0');
                    return impactFactorB - impactFactorA;
                });
                break;
            case 'citeScore':
                // CiteScore is not directly available, sorting by CiteScore is not applicable
                break;
            case 'sjr':
                sortedJournals.sort((a, b) => { // Sort by SJR
                    const sjrA = parseFloat(a.SJR?.replace(/[^0-9.-]/g, '') || '0');
                    const sjrB = parseFloat(b.SJR?.replace(/[^0-9.-]/g, '') || '0');
                    return sjrB - sjrA;
                });
                break;
            case 'overallRank':
                // OverallRank is not directly available, sorting by OverallRank is not applicable
                break;
            case 'hIndex':
                sortedJournals.sort((a, b) => { // Sort by H-index
                    const hIndexA = parseFloat(a["H index"] || '0');
                    const hIndexB = parseFloat(b["H index"] || '0');
                    return hIndexB - hIndexA;
                });
                break;
            default:
                sortedJournals.sort((a, b) => a.Title.localeCompare(b.Title)); // Mặc định sắp xếp theo tiêu đề // Use journal.Title
                break;
        }

        setJournals(sortedJournals);  // Cập nhật state với kết quả đã lọc và sắp xếp

    }, [searchQuery, selectedCountry, selectedPublicationType, selectedSubjectAreas,
        selectedQuartile, selectedOpenAccessTypes, selectedPublisher, selectedLanguage,
        selectedImpactFactor, selectedHIndex, selectedCiteScore, selectedSJR,
        selectedOverallRank, selectedISSN, sortBy]); // Mảng phụ thuộc đúng

    const indexOfLastJournal = currentPage * journalsPerPage;
    const indexOfFirstJournal = indexOfLastJournal - journalsPerPage;
    const currentJournals = journals.slice(indexOfFirstJournal, indexOfLastJournal);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const handleSortByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(event.target.value as JournalSortOption);
        // setCurrentPage(1); // Bạn *có thể* đặt lại về trang 1 khi thay đổi sắp xếp, nhưng thường thì trải nghiệm người dùng tốt hơn *không* làm như vậy.
    };

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
                {currentJournals.map((journal) => (
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