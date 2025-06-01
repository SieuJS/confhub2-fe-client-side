// src/hooks/journals/useJournalResults.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { JournalResponseData } from '../../models/response/journal.response';
import { journalFollowService } from '@/src/services/journal-follow.service';
import { toast } from 'react-toastify';

type JournalSortOption = 'title' | 'issn' | 'publisher' | 'language' | 'impactFactor' | 'citeScore' | 'sjr' | 'overallRank' | 'hIndex';

interface UseJournalResultsProps {
  initialData?: JournalResponseData[];
}

const useJournalResults = ({ initialData }: UseJournalResultsProps = {}) => {
    const [baseJournals, setBaseJournals] = useState<JournalResponseData[] | undefined>(initialData);
    const [filteredJournals, setFilteredJournals] = useState<JournalResponseData[] | undefined>(undefined);
    const [currentPage, setCurrentPage] = useState(1);
    const [followedJournals, setFollowedJournals] = useState<string[]>([]);
    const journalsPerPage = 12;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Fetch followed journals
    useEffect(() => {
        const fetchFollowedJournals = async () => {
            try {
                const followed = await journalFollowService.getFollowedJournals();
                setFollowedJournals(followed.map(fj => fj.journalId));
            } catch (error) {
                console.error('Error fetching followed journals:', error);
            }
        };
        fetchFollowedJournals();
    }, []);

    // Effect to fetch base data
    useEffect(() => {
        const fetchBaseData = async () => {
            if (!initialData) {
                setLoading(true);
                setError(null);
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_DATABASE_URL}/api/v1/journals`);
                    if (!response.ok) {
                        throw new Error(`API call failed with status: ${response.status}`);
                    }
                    const data = await response.json();
                    setBaseJournals(data.data);
                } catch (error: any) {
                    console.error("Failed to fetch base journals:", error);
                    setError(error.message);
                    setBaseJournals([]);
                    setLoading(false);
                }
            } else {
                setBaseJournals(initialData);
            }
        };

        fetchBaseData();
    }, [initialData]);

    // Handle follow/unfollow
    const handleFollowToggle = async (journalId: string) => {
        try {
            const isFollowing = followedJournals.includes(journalId);
            if (isFollowing) {
                await journalFollowService.unfollowJournal(journalId);
                setFollowedJournals(prev => prev.filter(id => id !== journalId));
                toast.success('Successfully unfollowed journal');
            } else {
                await journalFollowService.followJournal(journalId);
                setFollowedJournals(prev => [...prev, journalId]);
                toast.success('Successfully followed journal');
            }
        } catch (error) {
            console.error('Error toggling follow status:', error);
            toast.error('Failed to update follow status');
        }
    };

    // Process data based on search params
    const processData = useCallback(() => {
        if (baseJournals === undefined) {
            setLoading(baseJournals === undefined && !initialData);
            return;
        }

        setLoading(true);
        setError(null);

        try {
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
                sortBy: (searchParams.get('sortBy') as JournalSortOption) || 'title',
            };

            let journalsToProcess = [...baseJournals];

            // Apply filters
            if (params.keyword) {
                journalsToProcess = journalsToProcess.filter(journal =>
                    journal.Title.toLowerCase().includes(params.keyword?.toLowerCase() || '')
                );
            }
            if (params.country) {
                journalsToProcess = journalsToProcess.filter(journal => journal.Country === params.country);
            }
            if (params.publicationType) {
                journalsToProcess = journalsToProcess.filter(journal => journal.Type === params.publicationType);
            }
            if (params.subjectAreas?.length) {
                journalsToProcess = journalsToProcess.filter(journal =>
                    journal["Subject Area and Category"]?.Topics?.some((topic: string) => params.subjectAreas?.includes(topic))
                );
            }
            if (params.quartile) {
                journalsToProcess = journalsToProcess.filter(journal =>
                    journal.SupplementaryTable?.some((item: { Quartile: string }) => item.Quartile === params.quartile)
                );
            }
            if (params.publisher) {
                journalsToProcess = journalsToProcess.filter(journal => journal.Publisher === params.publisher);
            }
            if (params.issn) {
                journalsToProcess = journalsToProcess.filter(journal => (journal.ISSN || '').includes(params.issn || ''));
            }

            // Apply metric filters
            const filterMetric = (metricValue: string | undefined | null, selectedValue: string | null | undefined): boolean => {
                if (!selectedValue || metricValue === undefined || metricValue === null) return true;
                try {
                    const metricString = String(metricValue);
                    const selectedNum = parseFloat(selectedValue.replace(/[^0-9.-]/g, ''));
                    const journalNum = parseFloat(metricString.replace(/[^0-9.-]/g, ''));

                    if (isNaN(journalNum)) return true;

                    if (selectedValue.startsWith(">=")) return journalNum >= selectedNum;
                    if (selectedValue.startsWith(">")) return journalNum > selectedNum;
                    if (selectedValue.startsWith("<=")) return journalNum <= selectedNum;
                    if (selectedValue.startsWith("<")) return journalNum < selectedNum;
                    if (selectedValue.includes("-")) {
                        const [min, max] = selectedValue.split("-").map(Number);
                        if (!isNaN(min) && !isNaN(max)) {
                            return journalNum >= min && journalNum <= max;
                        }
                    }
                    return !selectedValue.match(/^[<>]=?/) ? journalNum === selectedNum : true;
                } catch (error) {
                    console.error("Error parsing metric value:", error);
                    return true;
                }
            };

            if (params.impactFactor) {
                journalsToProcess = journalsToProcess.filter(journal => 
                    filterMetric(journal.bioxbio?.[0]?.Impact_factor, params.impactFactor)
                );
            }
            if (params.hIndex) {
                journalsToProcess = journalsToProcess.filter(journal => 
                    filterMetric(journal["H index"], params.hIndex)
                );
            }
            if (params.sjr) {
                journalsToProcess = journalsToProcess.filter(journal => 
                    filterMetric(journal.SJR?.toString(), params.sjr)
                );
            }

            // Apply sorting
            const sortBy = params.sortBy;
            const safeParseFloat = (value: string | undefined | null): number => {
                if (value === undefined || value === null) return 0;
                const cleanedValue = String(value).replace(/[^0-9.-]/g, '');
                const number = parseFloat(cleanedValue);
                return isNaN(number) ? 0 : number;
            };

            let sortedJournals = [...journalsToProcess];
            switch (sortBy) {
                case 'title':
                    sortedJournals.sort((a, b) => a.Title.localeCompare(b.Title));
                    break;
                case 'issn':
                    sortedJournals.sort((a, b) => (a.ISSN || '').localeCompare(b.ISSN || ''));
                    break;
                case 'publisher':
                    sortedJournals.sort((a, b) => (a.Publisher || '').localeCompare(b.Publisher || ''));
                    break;
                case 'impactFactor':
                    sortedJournals.sort((a, b) => {
                        const impactFactorA = safeParseFloat(a.bioxbio?.[0]?.Impact_factor);
                        const impactFactorB = safeParseFloat(b.bioxbio?.[0]?.Impact_factor);
                        return impactFactorB - impactFactorA;
                    });
                    break;
                case 'sjr':
                    sortedJournals.sort((a, b) => {
                        const sjrA = safeParseFloat(a.SJR?.toString());
                        const sjrB = safeParseFloat(b.SJR?.toString());
                        return sjrB - sjrA;
                    });
                    break;
                case 'hIndex':
                    sortedJournals.sort((a, b) => {
                        const hIndexA = safeParseFloat(a["H index"]);
                        const hIndexB = safeParseFloat(b["H index"]);
                        return hIndexB - hIndexA;
                    });
                    break;
                default:
                    sortedJournals.sort((a, b) => a.Title.localeCompare(b.Title));
                    break;
            }

            setFilteredJournals(sortedJournals);
            setCurrentPage(1);
        } catch (error: any) {
            console.error("Failed to process journal data:", error);
            setError(error.message);
            setFilteredJournals([]);
        } finally {
            setLoading(false);
        }
    }, [baseJournals, searchParams, initialData]);

    useEffect(() => {
        processData();
    }, [processData]);

    const indexOfLastJournal = currentPage * journalsPerPage;
    const indexOfFirstJournal = indexOfLastJournal - journalsPerPage;
    const currentJournals = filteredJournals?.slice(indexOfFirstJournal, indexOfLastJournal) ?? [];

    const paginate = (pageNumber: number) => {
        if (pageNumber > 0 && pageNumber <= Math.ceil((filteredJournals?.length ?? 0) / journalsPerPage)) {
            setCurrentPage(pageNumber);
        }
    };

    const handleSortByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newSortBy = event.target.value as JournalSortOption;
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set('sortBy', newSortBy);
        router.push(`${pathname}?${current.toString()}`);
    };

    const currentSortBy = (searchParams.get('sortBy') as JournalSortOption) || 'title';

    return {
        journals: filteredJournals,
        totalJournals: filteredJournals?.length ?? 0,
        currentPage,
        journalsPerPage,
        sortBy: currentSortBy,
        loading,
        error,
        currentJournals,
        paginate,
        handleSortByChange,
        handleFollowToggle,
        followedJournals,
    };
};

export default useJournalResults;