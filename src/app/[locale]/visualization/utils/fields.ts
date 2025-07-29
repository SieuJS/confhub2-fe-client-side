import { DataField } from '../../../../models/visualization/visualization';
import { ConferenceResponse } from '@/src/models/response/conference.response';
import { getNestedValue } from './helpers';

// --- Ghi chú quan trọng về thiết kế ---
// File này định nghĩa các trường dữ liệu có sẵn để trực quan hóa.
// Một số trường, đặc biệt là các trường từ mảng `ranks`, yêu cầu dữ liệu đầu vào (rawData)
// phải được "làm phẳng" (flattened) trước khi đưa vào hàm processDataForChart.
// Ví dụ: một hội nghị có 3 ranks sẽ được biến đổi thành 3 dòng dữ liệu riêng biệt,
// mỗi dòng chứa thông tin của hội nghị và thông tin của một rank cụ thể.

// --- Constants ---
/**
 * Tên danh mục được sử dụng cho các điểm dữ liệu có giá trị không xác định hoặc không hợp lệ.
 */
export const UNKNOWN_CATEGORY = 'Unknown';

/**
 * Tập hợp các tên châu lục hợp lệ để tra cứu và chuẩn hóa dữ liệu.
 */
const VALID_CONTINENTS = new Set([
    'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Antarctica'
]);

// --- Helper Functions ---

/**
 * Chọn đối tượng organization phù hợp để lấy dữ liệu.
 * Ưu tiên organizations[0] nếu có topics. Nếu không, sử dụng organizations[1] nếu tồn tại.
 * Logic này giúp xử lý các trường hợp dữ liệu được crawl về có nhiều phiên bản.
 * @param item Đối tượng ConferenceResponse.
 * @returns Một mảng chứa đối tượng organization đã chọn, hoặc mảng rỗng.
 */
const selectOrganizationsArray = (item: ConferenceResponse): any[] => {
    const organizations = getNestedValue(item, 'organizations');
    if (!Array.isArray(organizations) || organizations.length === 0) {
        return [];
    }
    const org0 = organizations[0];
    const org0Topics = org0 ? getNestedValue(org0, 'topics') : undefined;
    if (org0 && Array.isArray(org0Topics) && org0Topics.length > 0) {
        return [org0];
    }
    const org1 = organizations.length > 1 ? organizations[1] : undefined;
    return org1 ? [org1] : [org0]; // Fallback to org0 if org1 doesn't exist
};

/**
 * Tính toán chênh lệch giữa hai ngày (dưới dạng chuỗi ISO) và trả về số ngày.
 * @param startDateStr Ngày bắt đầu.
 * @param endDateStr Ngày kết thúc.
 * @returns Số ngày chênh lệch, hoặc null nếu có lỗi.
 */
const calculateDateDiff = (startDateStr: any, endDateStr: any): number | null => {
    if (!startDateStr || !endDateStr) return null;
    try {
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        // Kiểm tra nếu date không hợp lệ
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) {
        return null;
    }
};

// --- Accessor Definitions ---
/**
 * Định nghĩa các hàm (accessor) để trích xuất dữ liệu cụ thể từ một mục ConferenceResponse.
 * Các hàm này đóng gói logic xử lý dữ liệu bị thiếu hoặc không nhất quán.
 */
const accessors = {
    // --- Conference-level Accessors ---
    status: (item: ConferenceResponse): string => item.status ?? UNKNOWN_CATEGORY,
    title: (item: ConferenceResponse): string => item.title ?? UNKNOWN_CATEGORY,
    acronym: (item: ConferenceResponse): string => item.acronym ?? UNKNOWN_CATEGORY,

    // --- Organization-level Accessors (sử dụng helper `selectOrganizationsArray`) ---
    continent: (item: ConferenceResponse): string => {
        const org = selectOrganizationsArray(item)[0];
        const value = getNestedValue(org, 'locations[0].continent')?.trim();
        return (value && VALID_CONTINENTS.has(value)) ? value : UNKNOWN_CATEGORY;
    },
    country: (item: ConferenceResponse): string => {
        const org = selectOrganizationsArray(item)[0];
        return getNestedValue(org, 'locations[0].country')?.trim() || UNKNOWN_CATEGORY;
    },
    city: (item: ConferenceResponse): string => {
        const org = selectOrganizationsArray(item)[0];
        return getNestedValue(org, 'locations[0].cityStateProvince')?.trim() || UNKNOWN_CATEGORY;
    },
    year: (item: ConferenceResponse): string => {
        const org = selectOrganizationsArray(item)[0];
        const year = getNestedValue(org, 'year');
        return (year !== null && year !== undefined && year !== 0) ? String(year) : UNKNOWN_CATEGORY;
    },
    accessType: (item: ConferenceResponse): string => {
        const org = selectOrganizationsArray(item)[0];
        return getNestedValue(org, 'accessType') ?? UNKNOWN_CATEGORY;
    },
    topicsCount: (item: ConferenceResponse): number => {
        const org = selectOrganizationsArray(item)[0];
        const topics = getNestedValue(org, 'topics');
        return Array.isArray(topics) ? topics.length : 0;
    },

    // --- Rank-level Accessors (dành cho dữ liệu đã được làm phẳng) ---
    // Lưu ý: `item` ở đây được giả định là một object đã được làm phẳng.
    rank: (item: any): string => item.rank ?? UNKNOWN_CATEGORY,
    rankSource: (item: any): string => item.source ?? UNKNOWN_CATEGORY,
    researchField: (item: any): string => item.researchField ?? UNKNOWN_CATEGORY,

    // --- Calculated Measures from Dates ---
    conferenceDuration: (item: ConferenceResponse): number | null => {
        const org = selectOrganizationsArray(item)[0];
        const dates = getNestedValue(org, 'dates');
        if (!Array.isArray(dates)) return null;
        const confDates = dates.find(d => d.type === 'conferenceDates');
        return calculateDateDiff(confDates?.fromDate, confDates?.toDate);
    },
    notificationDuration: (item: ConferenceResponse): number | null => {
        const org = selectOrganizationsArray(item)[0];
        const dates = getNestedValue(org, 'dates');
        if (!Array.isArray(dates)) return null;
        const subDate = dates.find(d => d.type === 'submissionDate')?.fromDate;
        const notifDate = dates.find(d => d.type === 'notificationDate')?.fromDate;
        return calculateDateDiff(subDate, notifDate);
    },
    cameraReadyPrepTime: (item: ConferenceResponse): number | null => {
        const org = selectOrganizationsArray(item)[0];
        const dates = getNestedValue(org, 'dates');
        if (!Array.isArray(dates)) return null;
        const notifDate = dates.find(d => d.type === 'notificationDate')?.fromDate;
        const cameraReadyDate = dates.find(d => d.type === 'cameraReadyDate')?.fromDate;
        return calculateDateDiff(notifDate, cameraReadyDate);
    },
};

// --- Field Definitions Template ---
/**
 * Mảng định nghĩa TẤT CẢ các trường dữ liệu có sẵn để người dùng lựa chọn.
 * Đây là "nguồn chân lý duy nhất" (single source of truth) cho các trường dữ liệu.
 */
const AVAILABLE_FIELDS_TEMPLATE: DataField[] = [
    // === DIMENSIONS (Trường phân loại - dùng để chia nhóm dữ liệu) ===
    { id: 'continent', name: 'Continent', type: 'dimension', accessor: accessors.continent },
    { id: 'country', name: 'Country', type: 'dimension', accessor: accessors.country },
    { id: 'city', name: 'City / State', type: 'dimension', accessor: accessors.city },
    { id: 'year', name: 'Year', type: 'dimension', accessor: accessors.year },
    { id: 'accessType', name: 'Access Type', type: 'dimension', accessor: accessors.accessType },
    { id: 'status', name: 'Status', type: 'dimension', accessor: accessors.status },
    { id: 'title', name: 'Conference Title', type: 'dimension', accessor: accessors.title },
    { id: 'acronym', name: 'Acronym', type: 'dimension', accessor: accessors.acronym },

    // --- Dimensions từ `ranks` (Yêu cầu dữ liệu đã được làm phẳng) ---
    { id: 'rank.value', name: 'Rank', type: 'dimension', accessor: accessors.rank },
    { id: 'rank.source', name: 'Rank Source', type: 'dimension', accessor: accessors.rankSource },
    { id: 'rank.researchField', name: 'Research Field', type: 'dimension', accessor: accessors.researchField },

    // === MEASURES (Trường đo lường - dùng để tính toán, tổng hợp) ===
    { id: 'count.records', name: 'Conference Count', type: 'measure', aggregation: 'count' },
    { id: 'count.topics', name: '# Topics', type: 'measure', accessor: accessors.topicsCount, aggregation: 'sum' },
    
    // --- Measures được tính toán từ `dates` ---
    { id: 'duration.conference', name: 'Conference Duration (days)', type: 'measure', accessor: accessors.conferenceDuration, aggregation: 'average' },
    { id: 'duration.notification', name: 'Notification Duration (days)', type: 'measure', accessor: accessors.notificationDuration, aggregation: 'average' },
    { id: 'duration.cameraReady', name: 'Camera-Ready Prep Time (days)', type: 'measure', accessor: accessors.cameraReadyPrepTime, aggregation: 'average' },
];

/**
 * Trả về danh sách ổn định các trường có sẵn để trực quan hóa.
 * Việc trả về một tham chiếu mảng ổn định (stable array reference) rất quan trọng
 * để tối ưu hóa hiệu suất trong các React hooks như `useMemo` hoặc `useEffect`.
 * @param sampleItem Một mẫu dữ liệu thô để kiểm tra xem dữ liệu có tồn tại không.
 * @returns Một mảng các đối tượng DataField.
 */
export const getAvailableFields = (sampleItem: ConferenceResponse | null | undefined): DataField[] => {
    if (!sampleItem || typeof sampleItem !== 'object') {
        return []; // Trả về mảng rỗng nếu không có dữ liệu mẫu
    }
    // Luôn trả về cùng một đối tượng template để đảm bảo tính ổn định tham chiếu.
    return AVAILABLE_FIELDS_TEMPLATE;
};