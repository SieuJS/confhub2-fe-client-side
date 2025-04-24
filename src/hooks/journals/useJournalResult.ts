// src/hooks/useJournalResults.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { JournalResponse } from '../../models/response/journal.response';
// import journalsList from '../../models/data/journals-list.json'; // Nhập journals-list.json
import journalsList from '../../models/data/journal_data_1_300.json'; // Nhập journals-list.json

type JournalSortOption = 'title' | 'issn' | 'publisher' | 'language' | 'impactFactor' | 'citeScore' | 'sjr' | 'overallRank' | 'hIndex';

interface UseJournalResultsProps {
  initialData?: JournalResponse[];
}

// export interface JournalFilterParams {
//     keyword?: string,
//     country?: string,
//     publicationType?: string,
//     subjectAreas?: string[],
//     quartile?: string,
//     openAccessTypes?: string[],
//     publisher?: string,
//     language?: string,
//     impactFactor?: string,
//     hIndex?: string,
//     citeScore?: string,
//     sjr?: string,
//     overallRank?: string,
//     issn?: string,
//     sortBy?: JournalSortOption,
// }

const useJournalResults = ({ initialData }: UseJournalResultsProps = {}) => {
    const [journals, setJournals] = useState<JournalResponse[] | undefined>(initialData);
    const [currentPage, setCurrentPage] = useState(1);
    const journalsPerPage = 6;
    const [sortBy, setSortBy] = useState<JournalSortOption>('title');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
          // Tạo object params từ searchParams.
          const params = {
            keyword: searchParams.get('keyword') || undefined,
            country: searchParams.get('country') || undefined,
            publicationType: searchParams.get('publicationType') || undefined,
            subjectAreas: searchParams.getAll('subjectAreas') || undefined,
            quartile: searchParams.get('quartile') || undefined,
            openAccessTypes: searchParams.getAll('openAccessTypes') || undefined,
            publisher: searchParams.get('publisher') || undefined,
            language: searchParams.get('language') || undefined,
            impactFactor: searchParams.get('impactFactor') || undefined,
            hIndex: searchParams.get('hIndex') || undefined,
            citeScore: searchParams.get('citeScore') || undefined,
            sjr: searchParams.get('sjr') || undefined,
            overallRank: searchParams.get('overallRank') || undefined,
            issn: searchParams.get('issn') || undefined,
            sortBy: searchParams.get('sortBy') as JournalSortOption || 'title',
          };
    
          let filteredJournals = journalsList as JournalResponse[];
    
        if (params.keyword && params.keyword.length > 0) {
            filteredJournals = filteredJournals.filter(journal =>
                journal.Title.toLowerCase().includes(params?.keyword?.toLowerCase() || '') // Use journal.Title
            );
        }

        if (params.country) {
            filteredJournals = filteredJournals.filter(journal =>
                journal.Country === params.country // Use journal.Country
            );
        }

        if (params.publicationType) {
            filteredJournals = filteredJournals.filter(journal =>
                journal.Type === params.publicationType // Use journal.Type
            );
        }
        if (params.subjectAreas && params.subjectAreas.length > 0) {
            filteredJournals = filteredJournals.filter(journal =>
                journal["Subject Area and Category"]?.Topics?.some(topic => params?.subjectAreas?.includes(topic)) // Use journal["Subject Area and Category"]?.Topics
            );
        }

        if (params.quartile) {
            filteredJournals = filteredJournals.filter(journal =>
                // bestQuartileOverall is not directly available in JournalResponse, you might need to adjust based on your data source
                // Assuming Quartile information is in SupplementaryTable, but filtering directly by quartile might not be straightforward
                // For now, this filter might not work as expected without further logic to derive quartile from JournalResponse
                journal.SupplementaryTable?.some(item => item.Quartile === params.quartile) // Example: Check if ANY SupplementaryTable entry matches selected Quartile
            );
        }

        if (params.openAccessTypes && params.openAccessTypes.length > 0) {
            filteredJournals = filteredJournals.filter(journal =>
                // openAccessType is not directly available in JournalResponse, you might need to adjust based on your data source
                // This filter might need to be adjusted or removed based on your JournalResponse structure
                false // Placeholder: Open Access Type filtering not directly applicable with provided JournalResponse
            );
        }

        if (params.publisher) {
            filteredJournals = filteredJournals.filter(journal =>
                journal.Publisher === params.publisher // Use journal.Publisher
            );
        }

        if (params.language) {
            filteredJournals = filteredJournals.filter(journal =>
                // Language is not directly available in JournalResponse, you might need to adjust based on your data source
                false // Placeholder: Language filtering not directly applicable with provided JournalResponse
            );
        }

        if (params.issn && params.issn.length > 0) {
            filteredJournals = filteredJournals.filter(journal =>
                (journal.ISSN || '').includes(params?.issn || '') // Use journal.ISSN.includes
            );
        }

        // Bộ lọc chỉ số - Adjust metric filtering to use properties from JournalResponse
        const filterMetric = (metricValue: string | undefined, selectedValue: string | null | undefined): boolean => { // Metric values are strings in JournalResponse
            if (!selectedValue || metricValue === undefined || selectedValue === undefined) return true;
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

        if (params.impactFactor) {
            filteredJournals = filteredJournals.filter(journal => filterMetric(journal.bioxbio[0].Impact_factor, params.impactFactor)); // Use bioxbio[0]?.Impact_factor
        }
        if (params.hIndex) {
            filteredJournals = filteredJournals.filter(journal => filterMetric(journal["H index"], params.hIndex)); // Use journal["H index"]
        }
        if (params.citeScore) {
            // CiteScore is not directly available in JournalResponse, filter might not be applicable
            // filteredJournals = filteredJournals.filter(journal => filterMetric(journal.metrics?.citeScore, selectedCiteScore));
        }
        if (params.sjr) {
            filteredJournals = filteredJournals.filter(journal => filterMetric(journal.SJR, params.sjr)); // Use journal.SJR
        }
        if (params.overallRank) {
            // OverallRank is not directly available in JournalResponse, filter might not be applicable
            // filteredJournals = filteredJournals.filter(journal => filterMetric(journal.metrics?.overallRank, params.overallRank));
        }

        if (params.sortBy)
        {
            // Áp dụng sắp xếp
            let sortedJournals = [...filteredJournals]; // Tạo một bản sao *trước khi* sắp xếp
            switch (params.sortBy) {
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

                filteredJournals = sortedJournals;  // Cập nhật state với kết quả đã lọc và sắp xếp
        }
        
          setJournals(filteredJournals);
          setSortBy(params.sortBy!);  // Đã được kiểm tra ở trên.
        } catch (error: any) {
          console.error("Failed to fetch conferences:", error);
          setError(error.message); // Lấy message từ error object.
        } finally {
          setLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const indexOfLastJournal = currentPage * journalsPerPage;
    const indexOfFirstJournal = indexOfLastJournal - journalsPerPage;
    const currentJournals = journals?.slice(indexOfFirstJournal, indexOfLastJournal);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const handleSortByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newSortBy = event.target.value as JournalSortOption;
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set('sortBy', newSortBy);
        const localePrefix = pathname.split('/')[1];
        router.push(`/${localePrefix}/journals?${newParams.toString()}`);
    };

    return {
        journals,
        currentPage,
        journalsPerPage,
        sortBy,
        loading,
        error,
        currentJournals,
        paginate,
        handleSortByChange,
    }
}

export default useJournalResults


