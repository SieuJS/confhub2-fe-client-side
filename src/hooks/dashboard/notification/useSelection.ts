// src/hooks/useSelection.ts
import { useState, useCallback, useEffect, useMemo } from 'react';

const useSelection = (visibleItemIds: string[]) => {
    // checkedOnCurrentPage lưu trữ các ID được chọn TRÊN TRANG HIỆN TẠI
    // Khi `visibleItemIds` thay đổi (chuyển trang, lọc), state này sẽ reset.
    const [checkedOnCurrentPage, setCheckedOnCurrentPage] = useState<string[]>([]);

    // Reset lựa chọn trên trang hiện tại khi danh sách item hiển thị thay đổi
    useEffect(() => {
        setCheckedOnCurrentPage([]);
    }, [visibleItemIds]);

    const selectAllCheckedOnCurrentPage = useMemo(() => {
        if (visibleItemIds.length === 0) return false;
        return visibleItemIds.every(id => checkedOnCurrentPage.includes(id));
    }, [checkedOnCurrentPage, visibleItemIds]);

    const handleCheckboxChange = useCallback((id: string, checked: boolean) => {
        setCheckedOnCurrentPage(prevIds => {
            const newIds = new Set(prevIds);
            if (checked) {
                newIds.add(id);
            } else {
                newIds.delete(id);
            }
            return Array.from(newIds);
        });
    }, []);

    const handleSelectAllChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const checked = event.target.checked;
            setCheckedOnCurrentPage(checked ? [...visibleItemIds] : []);
        },
        [visibleItemIds]
    );

    return {
        checkedOnCurrentPage,
        setCheckedOnCurrentPage, // Giúp NotificationTab có thể reset hoặc điều chỉnh cục bộ
        selectAllCheckedOnCurrentPage,
        handleCheckboxChange,
        handleSelectAllChange
    };
};

export default useSelection;