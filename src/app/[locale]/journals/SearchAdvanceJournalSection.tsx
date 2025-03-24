// SearchAdvanceJournalSection.tsx
"use client";

import React, { useState } from 'react';
import useSearchJournalAdvancedForm from '../../../hooks/journals/useSearchJournalAdvancedForm'; // Import the hook

interface SearchJournalAdvanceSectionProps {
  isAdvancedOptionsVisible: boolean;
  toggleAdvancedOptionsVisibility: () => void;
  onSubjectAreasChange: (subjects: string[]) => void;
  selectedSubjectAreas: string[];
  onQuartileChange: (quartile: string | null) => void;
  selectedQuartile: string | null;
  onOpenAccessTypesChange: (oaTypes: string[]) => void;
  selectedOpenAccessTypes: string[];
  onPublisherChange: (publisher: string | null) => void;
  selectedPublisher: string | null;
  onLanguageChange: (language: string | null) => void;
  selectedLanguage: string | null;
  onImpactFactorChange: (impactFactor: string | null) => void; // Using string for now, can be number or range later
  selectedImpactFactor: string | null;
  onHIndexChange: (hIndex: string | null) => void; // Using string for now
  selectedHIndex: string | null;
  onCiteScoreChange: (citeScore: string | null) => void; // Using string for now
  selectedCiteScore: string | null;
  onSJRChange: (sjr: string | null) => void; // Using string for now
  selectedSJR: string | null;
  onOverallRankChange: (overallRank: string | null) => void; // Using string for now
  selectedOverallRank: string | null;
  onISSNChange: (issn: string | null) => void;
  selectedISSN: string | null;
}

const SearchAdvanceJournalSection: React.FC<SearchJournalAdvanceSectionProps> = ({
  isAdvancedOptionsVisible, toggleAdvancedOptionsVisibility,
  onSubjectAreasChange, selectedSubjectAreas, onQuartileChange, selectedQuartile,
  onOpenAccessTypesChange, selectedOpenAccessTypes, onPublisherChange, selectedPublisher,
  onLanguageChange, selectedLanguage, onImpactFactorChange, selectedImpactFactor,
  onHIndexChange, selectedHIndex, onCiteScoreChange, selectedCiteScore,
  onSJRChange, selectedSJR, onOverallRankChange, selectedOverallRank, onISSNChange, selectedISSN
}) => {
  const {
    subjectAreaInput,
    subjectAreaSuggestions,
    openAccessTypeInput,
    openAccessTypeSuggestions,
    availableSubjectAreas,
    availableLanguages,
    availableOpenAccessTypes,
    availableQuartiles,
    handleCiteScoreChangeInput,
    handleHIndexChangeInput,
    handleISSNChangeInput,
    handleImpactFactorChangeInput,
    handleLanguageChangeInput,
    handleOpenAccessTypeInputChange,
    handleOpenAccessTypeInputKeyDown,
    handleOpenAccessTypeSuggestionClick,
    handleOverallRankChangeInput,
    handlePublisherChangeInput,
    handleQuartileChangeInput,
    handleRemoveOpenAccessType,
    handleRemoveSubjectArea,
    handleSJRChangeInput,
    handleSubjectAreaInputChange,
    handleSubjectAreaInputKeyDown,
    handleSubjectAreaSuggestionClick
  } = useSearchJournalAdvancedForm({
    isAdvancedOptionsVisible, toggleAdvancedOptionsVisibility,
    onSubjectAreasChange, selectedSubjectAreas, onQuartileChange, selectedQuartile,
    onOpenAccessTypesChange, selectedOpenAccessTypes, onPublisherChange, selectedPublisher,
    onLanguageChange, selectedLanguage, onImpactFactorChange, selectedImpactFactor,
    onHIndexChange, selectedHIndex, onCiteScoreChange, selectedCiteScore,
    onSJRChange, selectedSJR, onOverallRankChange, selectedOverallRank, onISSNChange, selectedISSN
  })


  return (
    <div>
      <div className="mt-2 flex justify-end">
        <button onClick={toggleAdvancedOptionsVisibility} className='text-sm hover:text-gray-800 focus:outline-none'>
          {isAdvancedOptionsVisible ? 'Ẩn tìm kiếm nâng cao' : 'Hiện tìm kiếm nâng cao'}
        </button>
      </div>

      {isAdvancedOptionsVisible && (
        <div className="mt-4 p-4 border rounded shadow-md">

          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-4">

            <div className="col-span-3 md:col-span-2 relative">
              <label className="block font-bold mb-2" htmlFor="subjectAreas">
                Lĩnh Vực/Chủ Đề:
              </label>
              <input
                type="text"
                id="subjectAreas"
                value={subjectAreaInput}
                onChange={handleSubjectAreaInputChange}
                onKeyDown={handleSubjectAreaInputKeyDown}
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-sm"
                placeholder="Nhập lĩnh vực/chủ đề"
              />
              {subjectAreaSuggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-md max-h-48 overflow-y-auto">
                  {subjectAreaSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSubjectAreaSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedSubjectAreas.map((subject, index) => (
                  <div key={index} className="bg-gray-200 rounded-full px-3 py-1 text-sm flex items-center gap-1">
                    <span>{subject}</span>
                    <button
                      type="button"
                      className="hover:text-gray-700 focus:outline-none"
                      onClick={() => handleRemoveSubjectArea(subject)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="sm:col-span-1">
              <label className="block font-bold mb-2" htmlFor="quartile">
                Quartile:
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-sm"
                id="quartile"
                value={selectedQuartile || ''}
                onChange={handleQuartileChangeInput}
              >
                <option value="">Chọn Quartile</option>
                {availableQuartiles.map((quartile) => (
                  <option key={quartile} value={quartile}>{quartile}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="block font-bold mb-2" htmlFor="issn">
                ISSN:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-sm"
                id="issn"
                type="text"
                placeholder="ISSN"
                value={selectedISSN || ''}
                onChange={handleISSNChangeInput}
              />
            </div>

            <div className="col-span-3 md:col-span-2 relative">
              <label className="block font-bold mb-2" htmlFor="openAccessTypes">
                Loại Hình Open Access:
              </label>
              <input
                type="text"
                id="openAccessTypes"
                value={openAccessTypeInput}
                onChange={handleOpenAccessTypeInputChange}
                onKeyDown={handleOpenAccessTypeInputKeyDown}
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-sm"
                placeholder="Nhập loại hình Open Access"
              />
              {openAccessTypeSuggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-md max-h-48 overflow-y-auto">
                  {openAccessTypeSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleOpenAccessTypeSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedOpenAccessTypes.map((type, index) => (
                  <div key={index} className="bg-gray-200 rounded-full px-3 py-1 text-sm flex items-center gap-1">
                    <span>{type}</span>
                    <button
                      type="button"
                      className="hover:text-gray-700 focus:outline-none"
                      onClick={() => handleRemoveOpenAccessType(type)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>


            <div className="sm:col-span-1">
              <label className="block font-bold mb-2" htmlFor="publisher">
                Nhà Xuất Bản:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-sm"
                id="publisher"
                type="text"
                placeholder="Nhà Xuất Bản"
                value={selectedPublisher || ''}
                onChange={handlePublisherChangeInput}
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block font-bold mb-2" htmlFor="language">
                Ngôn Ngữ:
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-sm"
                id="language"
                value={selectedLanguage || ''}
                onChange={handleLanguageChangeInput}
              >
                <option value="">Chọn Ngôn Ngữ</option>
                {availableLanguages.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            

          </div>

          <p className="font-semibold mt-4 mb-2">Chỉ Số Metrics (Tùy chọn)</p>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            <div className="sm:col-span-1">
              <label className="block font-bold mb-2" htmlFor="impactFactor">
                Impact Factor:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-sm"
                id="impactFactor"
                type="text"
                placeholder="Ví dụ: >10"
                value={selectedImpactFactor || ''}
                onChange={handleImpactFactorChangeInput}
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block font-bold mb-2" htmlFor="hIndex">
                H-index:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-sm"
                id="hIndex"
                type="text"
                placeholder="Ví dụ: >50"
                value={selectedHIndex || ''}
                onChange={handleHIndexChangeInput}
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block font-bold mb-2" htmlFor="citeScore">
                CiteScore:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-sm"
                id="citeScore"
                type="text"
                placeholder="Ví dụ: >5"
                value={selectedCiteScore || ''}
                onChange={handleCiteScoreChangeInput}
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block font-bold mb-2" htmlFor="sjr">
                SJR:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-sm"
                id="sjr"
                type="text"
                placeholder="Ví dụ: >1"
                value={selectedSJR || ''}
                onChange={handleSJRChangeInput}
              />
            </div>

             <div className="sm:col-span-1">
              <label className="block font-bold mb-2" htmlFor="overallRank">
                Overall Rank:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-sm"
                id="overallRank"
                type="text"
                placeholder="Ví dụ: <1000"
                value={selectedOverallRank || ''}
                onChange={handleOverallRankChangeInput}
              />
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default SearchAdvanceJournalSection;