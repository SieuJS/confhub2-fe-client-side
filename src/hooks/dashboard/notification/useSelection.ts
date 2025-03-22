// src/hooks/useSelection.ts
import { useState, useCallback, useEffect } from 'react';

const useSelection = (itemIds: string[]) => {
    const [checkedIndices, setCheckedIndices] = useState<string[]>([]);
    const [selectAllChecked, setSelectAllChecked] = useState(false);

    const handleCheckboxChange = useCallback((id: string, checked: boolean) => {
        setCheckedIndices(prevIndices => {
            if (checked) {
                return [...prevIndices, id];
            } else {
                return prevIndices.filter(i => i !== id);
            }
        });
    }, []);

    const handleSelectAllChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const checked = event.target.checked;
            setSelectAllChecked(checked);
            if (checked) {
                setCheckedIndices(itemIds);
            } else {
                setCheckedIndices([]);
            }
        },
        [itemIds]
    );

    // Keep checkedIndices within bounds of itemIds.  Important if items are deleted.
    useEffect(() => {
        setCheckedIndices(prevIndices => prevIndices.filter(id => itemIds.includes(id)));
    }, [itemIds]);


    return { checkedIndices, setCheckedIndices, selectAllChecked, handleCheckboxChange, handleSelectAllChange };
};

export default useSelection;