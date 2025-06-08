// src/hooks/useSelection.ts
import { useState, useCallback, useEffect, useMemo } from 'react';

const useSelection = (itemIds: string[]) => {
    const [checkedIndices, setCheckedIndices] = useState<string[]>([]);

    // FIX 1: `selectAllChecked` is derived state. Calculate it with `useMemo`
    // instead of storing it in `useState`. This eliminates sync issues.
    const selectAllChecked = useMemo(() => {
        // It's "all checked" if the list isn't empty and all item IDs are present in the checked list.
        return itemIds.length > 0 && checkedIndices.length === itemIds.length;
    }, [checkedIndices, itemIds]);

    const handleCheckboxChange = useCallback((id: string, checked: boolean) => {
        setCheckedIndices(prevIndices => {
            const newIndices = new Set(prevIndices);
            if (checked) {
                newIndices.add(id);
            } else {
                newIndices.delete(id);
            }
            return Array.from(newIndices);
        });
    }, []); // This handler is self-contained and needs no dependencies.

    const handleSelectAllChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const checked = event.target.checked;
            // FIX 2: Depend directly on `itemIds`. When the user clicks "select all",
            // the checked list becomes a copy of the current `itemIds`.
            setCheckedIndices(checked ? [...itemIds] : []);
        },
        [itemIds] // Correctly depend on `itemIds`.
    );

    // FIX 3: Simplify the effect. Its only job is to sync the selection
    // when the source `itemIds` list changes (e.g., due to filtering).
    useEffect(() => {
        // If an item is checked but is no longer in the master list, uncheck it.
        setCheckedIndices(prev => prev.filter(id => itemIds.includes(id)));
    }, [itemIds]); // This effect should *only* run when the `itemIds` array changes.

    return {
        checkedIndices,
        setCheckedIndices,
        selectAllChecked, // Return the memoized, derived value.
        handleCheckboxChange,
        handleSelectAllChange
    };
};

export default useSelection;