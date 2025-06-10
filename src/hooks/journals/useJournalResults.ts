// src/hooks/journals/useJournalResults.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { journalFollowService } from '@/src/services/journal-follow.service';
import { JournalApiResponse, JournalData } from '../../models/response/journal.response'; // Giả sử đã có file này
import { toast } from 'react-toastify';

type JournalSortOption = 'title' | 'issn' | 'publisher' | 'language' | 'impactFactor' | 'citeScore' | 'sjr' | 'overallRank' | 'hIndex';

// Không cần initialData cho việc fetch toàn bộ dữ liệu từ API,
// hook này sẽ tự động fetch khi được mount hoặc khi tham số thay đổi.
interface UseJournalResultsProps {}

const useJournalResults = ({}: UseJournalResultsProps = {}) => {
    // journals sẽ lưu trữ dữ liệu của trang hiện tại từ API
    const [journals, setJournals] = useState<JournalData[] | undefined>(undefined);
    // Lưu trữ thông tin meta từ API
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 12, totalPages: 0 }); // Khởi tạo với giá trị mặc định

    // Trạng thái loading và error
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Hooks từ Next.js để quản lý định tuyến và URL
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Định nghĩa số lượng tạp chí trên mỗi trang (đây là limit sẽ gửi lên API)
    const journalsPerPage = 12;

    // --- State và Logic cho Follow/Unfollow ---
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

    // --- Logic Fetching Dữ liệu & Phân trang ---

    // Lấy currentPage và sortBy từ URL Search Params (ưu tiên URL để đồng bộ)
    const currentPageFromUrl = parseInt(searchParams.get('page') || '1');
    const currentSortBy = (searchParams.get('sortBy') as JournalSortOption) || 'title';


    // Hàm fetch chính để lấy dữ liệu từ API
    const fetchJournals = useCallback(async () => {
        setLoading(true);
        setError(null);

        // Tạo URLSearchParams từ searchParams hiện tại để thêm/ghi đè các tham số
        const params = new URLSearchParams(searchParams.toString());

        // Đảm bảo trang hiện tại và limit luôn được gửi lên API
        params.set('page', currentPageFromUrl.toString());
        params.set('limit', journalsPerPage.toString());

        // Lấy các tham số lọc từ searchParams và thêm vào URL (giả định API có thể nhận các tham số này)
        const keyword = searchParams.get('keyword');
        if (keyword) params.set('keyword', keyword);

        const country = searchParams.get('country');
        if (country) params.set('country', country);

        const publicationType = searchParams.get('publicationType');
        if (publicationType) params.set('publicationType', publicationType);

        // Đối với các mảng như subjectAreas, cần xử lý đặc biệt để API nhận đúng
        const subjectAreas = searchParams.getAll('subjectAreas');
        if (subjectAreas.length > 0) {
            params.delete('subjectAreas'); // Xóa các tham số cũ để thêm lại
            subjectAreas.forEach(area => params.append('subjectAreas', area));
        }

        const quartile = searchParams.get('quartile');
        if (quartile) params.set('quartile', quartile);

        const publisher = searchParams.get('publisher');
        if (publisher) params.set('publisher', publisher);

        const issn = searchParams.get('issn');
        if (issn) params.set('issn', issn);

        const impactFactor = searchParams.get('impactFactor');
        if (impactFactor) params.set('impactFactor', impactFactor);

        const hIndex = searchParams.get('hIndex');
        if (hIndex) params.set('hIndex', hIndex);

        const sjr = searchParams.get('sjr');
        if (sjr) params.set('sjr', sjr);

        // Thêm tham số sắp xếp
        params.set('sortBy', currentSortBy);


        try {
            const apiUrl = `${process.env.NEXT_PUBLIC_DATABASE_URL}/api/v1/journals?${params.toString()}`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }

            const apiResponse: JournalApiResponse = await response.json();
            setJournals(apiResponse.data);
            setMeta(apiResponse.meta); // Cập nhật meta data từ API

        } catch (err: any) {
            console.error("Failed to fetch journals:", err);
            setError(err.message);
            setJournals([]);
            setMeta({ total: 0, page: 1, limit: journalsPerPage, totalPages: 0 }); // Reset meta on error
        } finally {
            setLoading(false);
        }
    }, [currentPageFromUrl, currentSortBy, searchParams, journalsPerPage]); // Dependencies cho useCallback

    // Trigger fetchJournals mỗi khi currentPageFromUrl (tức là param 'page' trong URL)
    // hoặc searchParams (các bộ lọc/sắp xếp khác) thay đổi.
    useEffect(() => {
        fetchJournals();
    }, [fetchJournals]);

    // Hàm paginate: Cập nhật URL 'page' param, sẽ kích hoạt useEffect và fetchJournals
    const paginate = useCallback((pageNumber: number) => {
        // Tránh chuyển trang nếu không hợp lệ
        if (pageNumber < 1 || pageNumber > meta.totalPages) {
            return;
        }
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set('page', pageNumber.toString());
        router.push(`${pathname}?${current.toString()}`);
    }, [searchParams, pathname, router, meta.totalPages]);

    // Hàm handleSortByChange: Cập nhật URL 'sortBy' param và reset về trang 1
    const handleSortByChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        const newSortBy = event.target.value as JournalSortOption;
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set('sortBy', newSortBy);
        current.set('page', '1'); // Reset về trang 1 khi thay đổi sort
        router.push(`${pathname}?${current.toString()}`);
    }, [searchParams, pathname, router]);

    // Các giá trị trả về từ hook
    return {
        journals: journals, // Dữ liệu của trang hiện tại
        totalJournals: meta.total, // Tổng số record từ meta
        currentPage: meta.page, // Trang hiện tại từ meta (API trả về)
        journalsPerPage: meta.limit, // Số record mỗi trang từ meta
        totalPages: meta.totalPages, // Tổng số trang từ meta
        sortBy: currentSortBy, // Tùy chọn sắp xếp hiện tại
        loading,
        error,
        // currentJournals được giữ lại cho tính tương thích ngược,
        // thực chất nó chính là 'journals'
        currentJournals: journals,
        paginate,
        handleSortByChange,
        handleFollowToggle,
        followedJournals,
    };
};

export default useJournalResults;