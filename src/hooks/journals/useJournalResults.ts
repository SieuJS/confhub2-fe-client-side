// src/hooks/journals/useJournalResults.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { journalFollowService } from '@/src/services/journal-follow.service';
import { JournalApiResponse, JournalData } from '../../models/response/journal.response';
import { toast } from 'react-toastify';
import { appConfig } from '@/src/middleware';

type JournalSortOption = 'title' | 'issn' | 'publisher' | 'language' | 'impactFactor' | 'citeScore' | 'sjr' | 'overallRank' | 'hIndex';

interface UseJournalResultsProps {}

const useJournalResults = ({}: UseJournalResultsProps = {}) => {
    const [journals, setJournals] = useState<JournalData[] | undefined>(undefined);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 12, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const journalsPerPage = 12;
    const [followedJournals, setFollowedJournals] = useState<string[]>([]);

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

    const currentPageFromUrl = parseInt(searchParams.get('page') || '1');
    const currentSortBy = (searchParams.get('sortBy') as JournalSortOption) || 'title';

    const fetchJournals = useCallback(async () => {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams(searchParams.toString());
        params.set('page', currentPageFromUrl.toString());
        params.set('limit', journalsPerPage.toString());

        // === CÁC THAY ĐỔI QUAN TRỌNG ===
        // 1. Đổi 'keyword' thành 'search' để khớp với yêu cầu
        const searchValue = searchParams.get('search');
        if (searchValue) {
            params.set('search', searchValue);
        } else {
            params.delete('search'); // Xóa nếu không có giá trị
        }
        
        // 2. Giữ lại 'country' và 'publisher'
        const country = searchParams.get('country');
        if (country) {
            params.set('country', country);
        } else {
            params.delete('country');
        }

        const publisher = searchParams.get('publisher');
        if (publisher) {
            params.set('publisher', publisher);
        } else {
            params.delete('publisher');
        }

        // 3. Thêm 'region' cho tìm kiếm nâng cao
        const region = searchParams.get('region');
        if (region) {
            params.set('region', region);
        } else {
            params.delete('region');
        }

        // 4. Loại bỏ các param không còn sử dụng
        params.delete('keyword');
        params.delete('publicationType');
        params.delete('subjectAreas');
        params.delete('quartile');
        params.delete('openAccessTypes');
        params.delete('language');
        params.delete('impactFactor');
        params.delete('hIndex');
        params.delete('citeScore');
        params.delete('sjr');
        params.delete('overallRank');
        params.delete('issn');
        // === KẾT THÚC THAY ĐỔI ===

        params.set('sortBy', currentSortBy);

        try {
            const apiUrl = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/journals?${params.toString()}`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }

            const apiResponse: JournalApiResponse = await response.json();
            setJournals(apiResponse.data);
            setMeta(apiResponse.meta);

        } catch (err: any) {
            console.error("Failed to fetch journals:", err);
            setError(err.message);
            setJournals([]);
            setMeta({ total: 0, page: 1, limit: journalsPerPage, totalPages: 0 });
        } finally {
            setLoading(false);
        }
    }, [currentPageFromUrl, currentSortBy, searchParams, journalsPerPage]);

    useEffect(() => {
        fetchJournals();
    }, [fetchJournals]);

    const paginate = useCallback((pageNumber: number) => {
        if (pageNumber < 1 || pageNumber > meta.totalPages) {
            return;
        }
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set('page', pageNumber.toString());
        router.push(`${pathname}?${current.toString()}`);
    }, [searchParams, pathname, router, meta.totalPages]);

    const handleSortByChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        const newSortBy = event.target.value as JournalSortOption;
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set('sortBy', newSortBy);
        current.set('page', '1');
        router.push(`${pathname}?${current.toString()}`);
    }, [searchParams, pathname, router]);

    return {
        journals,
        totalJournals: meta.total,
        currentPage: meta.page,
        journalsPerPage: meta.limit,
        totalPages: meta.totalPages,
        sortBy: currentSortBy,
        loading,
        error,
        currentJournals: journals,
        paginate,
        handleSortByChange,
        handleFollowToggle,
        followedJournals,
    };
};

export default useJournalResults;