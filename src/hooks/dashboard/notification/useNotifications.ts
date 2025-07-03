// src/hooks/dashboard/notification/useNotifications.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Notification } from '@/src/models/response/user.response';
import { useAuth } from '@/src/contexts/AuthContext';

// --- Local Hook Imports ---
import useNotificationData from './useNotificationData';
import useNotificationState from './useNotificationState';
import useSelection from './useSelection';
import useFilteredNotifications from './useFilteredNotifications';
import useBulkReadActions from './useBulkReadActions';
import useBulkImportantActions from './useBulkImportantActions';

/**
 * Props cho hook useNotifications.
 */
interface UseNotificationsProps {
  filter: 'all' | 'unread' | 'read' | 'important';
  showErrorModal: (title: string, message: string) => void;
}

/**
 * Các giá trị và hàm được trả về bởi hook useNotifications.
 */
interface UseNotificationsReturn {
  notifications: Notification[]; // Toàn bộ danh sách thông báo đã sắp xếp
  checkedIndices: string[]; // Danh sách tổng hợp các ID đã được chọn trên mọi trang
  selectAllChecked: boolean; // Trạng thái của checkbox "Select All" trên trang hiện tại
  loading: boolean; // Trạng thái loading chung từ API
  loggedIn: boolean; // Trạng thái đăng nhập của người dùng (từ AuthContext)
  isBanned: boolean; // Trạng thái tài khoản bị cấm
  initialLoad: boolean; // Cờ đánh dấu lần tải dữ liệu đầu tiên
  searchTerm: string; // Từ khóa tìm kiếm hiện tại
  filteredNotifications: Notification[]; // Danh sách thông báo đã được lọc (tìm kiếm + tab)
  paginatedNotifications: Notification[]; // Danh sách thông báo đã được phân trang để hiển thị
  currentPage: number; // Trang hiện tại
  totalPages: number; // Tổng số trang
  itemsPerPage: number; // Số mục trên mỗi trang
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  fetchData: () => Promise<void>;
  handleUpdateSeenAt: (id: string) => Promise<void>; // Giữ lại cho chi tiết thông báo
  handleToggleImportant: (id: string) => Promise<void>;
  handleDeleteNotification: (id: string) => Promise<void>;
  handleToggleReadStatus: (id: string, isRead: boolean) => Promise<void>; // <--- THÊM HÀM NÀY
  handleCheckboxChangeTab: (id: string, checked: boolean) => void;
  handleDeleteSelected: () => Promise<void>;
  handleSelectAllChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleMarkSelectedAsRead: () => Promise<void>;
  handleMarkSelectedAsUnread: () => Promise<void>;
  allSelectedAreRead: boolean;
  handleMarkSelectedAsImportant: () => Promise<void>;
  handleMarkSelectedAsUnimportant: () => Promise<void>;
  allSelectedAreImportant: boolean;
}

/**
 * Hook tùy chỉnh để quản lý toàn bộ logic cho tab thông báo.
 * @param {UseNotificationsProps} props - Props cho hook, bao gồm bộ lọc hiện tại.
 * @returns {UseNotificationsReturn} - Các state và hàm cần thiết cho component UI.
 */
const useNotifications = ({ filter, showErrorModal }: UseNotificationsProps): UseNotificationsReturn => {
  // === STATE QUẢN LÝ INPUT TỪ UI ===
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [checkedIndices, setCheckedIndices] = useState<string[]>([]);
  const itemsPerPage = 10; // Cấu hình số lượng thông báo trên mỗi trang

  // === CÁC HOOK CON QUẢN LÝ LOGIC RIÊNG BIỆT ===

  // Lấy trạng thái xác thực và thông tin người dùng từ context
  const { isLoggedIn, user } = useAuth();
  const userId = user?.id || '';

  // 1. Hook lấy dữ liệu từ API (đã được đơn giản hóa, không cần truyền userId)
  const {
    notifications: initialNotifications,
    loading,
    isBanned,
    initialLoad,
    fetchData,
  } = useNotificationData(showErrorModal);

  // 2. Hook quản lý state của danh sách thông báo và các hành động đơn lẻ
  const {
    notifications: rawNotifications,
    setNotifications,
    handleUpdateSeenAt, // Giữ lại hàm này nếu vẫn cần cho chi tiết thông báo
    handleToggleImportant,
    handleDeleteNotification,
    updateUserNotifications,
  } = useNotificationState(initialNotifications, userId, showErrorModal);

  // === LOGIC XỬ LÝ VÀ BIẾN ĐỔI DỮ LIỆU ===

  // Bước 1: Sắp xếp thông báo theo thời gian tạo, mới nhất lên đầu
  const sortedNotifications = useMemo(() => {
    return [...rawNotifications].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    });
  }, [rawNotifications]);

  // Bước 2: Lọc theo từ khóa tìm kiếm
  const searchFilteredNotifications = useFilteredNotifications(sortedNotifications, searchTerm);

  // Bước 3: Lọc theo tab (All, Unread, Read, Important)
  const tabFilteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return searchFilteredNotifications.filter(n => !n.seenAt);
    }
    if (filter === 'read') {
      return searchFilteredNotifications.filter(n => n.seenAt);
    }
    if (filter === 'important') {
      return searchFilteredNotifications.filter(n => n.isImportant);
    }
    return searchFilteredNotifications; // 'all' filter
  }, [searchFilteredNotifications, filter]);

  // Bước 4: Tính toán phân trang dựa trên kết quả đã lọc hoàn chỉnh
  const totalPages = useMemo(() => {
    return Math.ceil(tabFilteredNotifications.length / itemsPerPage);
  }, [tabFilteredNotifications.length, itemsPerPage]);

  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return tabFilteredNotifications.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, tabFilteredNotifications, itemsPerPage]);

  // === LOGIC QUẢN LÝ LỰA CHỌN (SELECTION) ===

  // 3. Hook con quản lý logic chọn/bỏ chọn trên trang hiện tại
  const {
    checkedOnCurrentPage,
    setCheckedOnCurrentPage,
    selectAllCheckedOnCurrentPage,
    handleCheckboxChange: handleCheckboxChangeOnPage,
    handleSelectAllChange: handleSelectAllChangeOnPage,
  } = useSelection(
    useMemo(() => paginatedNotifications.map(n => n.id), [paginatedNotifications])
  );

  // Cầu nối: Cập nhật state tổng hợp `checkedIndices` khi có thay đổi trên trang hiện tại
  const handleCheckboxChangeTab = useCallback((id: string, checked: boolean) => {
    handleCheckboxChangeOnPage(id, checked);
    setCheckedIndices(prev => {
      const newSet = new Set(prev);
      if (checked) newSet.add(id);
      else newSet.delete(id);
      return Array.from(newSet);
    });
  }, [handleCheckboxChangeOnPage]);

  const handleSelectAllChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleSelectAllChangeOnPage(event);
    setCheckedIndices(prev => {
      const newSet = new Set(prev);
      const pageIds = paginatedNotifications.map(n => n.id);
      if (event.target.checked) {
        pageIds.forEach(id => newSet.add(id));
      } else {
        pageIds.forEach(id => newSet.delete(id));
      }
      return Array.from(newSet);
    });
  }, [handleSelectAllChangeOnPage, paginatedNotifications]);

  // --- BƯỚC 1: TẠO CÁC HÀM WRAPPER MỚI ĐỂ RESET LỰA CHỌN ---

  // Lấy các hàm gốc từ hook con
  const {
    handleMarkSelectedAsRead: originalMarkAsRead,
    handleMarkSelectedAsUnread: originalMarkAsUnread,
    allSelectedAreRead,
  } = useBulkReadActions(checkedIndices, sortedNotifications, updateUserNotifications);

  const {
    handleMarkSelectedAsImportant: originalMarkAsImportant,
    handleMarkSelectedAsUnimportant: originalMarkAsUnimportant,
    allSelectedAreImportant,
  } = useBulkImportantActions(checkedIndices, sortedNotifications, updateUserNotifications);

  const handleMarkSelectedAsRead = async () => {
    await originalMarkAsRead();
    setCheckedIndices([]); // Reset lựa chọn sau khi thành công
  };

  const handleMarkSelectedAsUnread = async () => {
    await originalMarkAsUnread();
    setCheckedIndices([]); // Reset lựa chọn sau khi thành công
  };

  const handleMarkSelectedAsImportant = async () => {
    await originalMarkAsImportant();
    setCheckedIndices([]); // Reset lựa chọn sau khi thành công
  };

  const handleMarkSelectedAsUnimportant = async () => {
    await originalMarkAsUnimportant();
    setCheckedIndices([]); // Reset lựa chọn sau khi thành công
  };

  const handleDeleteSelected = async () => {
    // Tạo một mảng các bản vá chỉ chứa ID và trạng thái deletedAt
    const patches = checkedIndices.map(id => ({
      id: id,
      deletedAt: new Date().toISOString(),
    }));

    if (patches.length === 0) {
      return; // Không làm gì nếu không có gì được chọn
    }

    try {
      // Gọi hàm patchUserNotifications với chỉ các bản vá của các thông báo được chọn
      await updateUserNotifications(patches);
      setCheckedIndices([]); // Reset lựa chọn sau khi thành công
    } catch (error) {
      console.error('Failed to delete selected notifications:', error);
      throw error; // Re-throw để performAction có thể bắt
    }
  };

  // --- HÀM MỚI: Đánh dấu đã đọc/chưa đọc cho một thông báo ---
  const handleToggleReadStatus = useCallback(async (id: string, isCurrentlyRead: boolean) => {
    try {
      const patch = {
        id: id,
        seenAt: isCurrentlyRead ? null : new Date().toISOString(), // Nếu đang đọc thì đặt null (chưa đọc), ngược lại thì đặt thời gian hiện tại (đã đọc)
      };
      await updateUserNotifications([patch]);
    } catch (error) {
      console.error(`Failed to toggle read status for notification ${id}:`, error);
      showErrorModal('Operation Failed', 'Failed to update notification read status.');
      throw error;
    }
  }, [updateUserNotifications, showErrorModal]);


  // Đồng bộ dữ liệu từ API vào state cục bộ
  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications, setNotifications]);

  // Reset trang về 1 khi người dùng thay đổi bộ lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  // Reset tất cả các lựa chọn khi người dùng thay đổi bộ lọc hoặc tìm kiếm
  useEffect(() => {
    setCheckedIndices([]);
  }, [filter, searchTerm]);

  // Đảm bảo trang hiện tại không vượt quá tổng số trang
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Đồng bộ hóa trạng thái checkbox trên trang hiện tại với danh sách tổng hợp
  useEffect(() => {
    const currentPageChecked = paginatedNotifications
      .filter(n => checkedIndices.includes(n.id))
      .map(n => n.id);
    setCheckedOnCurrentPage(currentPageChecked);
  }, [checkedIndices, paginatedNotifications, setCheckedOnCurrentPage]);


  // === TRẢ VỀ KẾT QUẢ ===
  return {
    notifications: sortedNotifications,
    checkedIndices,
    selectAllChecked: selectAllCheckedOnCurrentPage,
    loading,
    loggedIn: isLoggedIn,
    isBanned,
    initialLoad,
    searchTerm,
    filteredNotifications: tabFilteredNotifications,
    paginatedNotifications,
    currentPage,
    totalPages,
    itemsPerPage,
    setCurrentPage,
    setSearchTerm,
    fetchData,
    handleUpdateSeenAt,
    handleToggleImportant,
    handleDeleteNotification,
    handleToggleReadStatus, // <--- TRẢ VỀ HÀM MỚI
    handleCheckboxChangeTab,
    handleDeleteSelected,
    handleSelectAllChange,
    handleMarkSelectedAsRead,
    handleMarkSelectedAsUnread,
    allSelectedAreRead,
    handleMarkSelectedAsImportant,
    handleMarkSelectedAsUnimportant,
    allSelectedAreImportant,
  };
};

export default useNotifications;