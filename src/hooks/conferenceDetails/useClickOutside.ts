// hooks/useClickOutside.ts
import { useEffect, RefObject } from 'react';

const useClickOutside = (ref: RefObject<HTMLElement>, callback: () => void) => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node) &&
                !(event.target instanceof Element && event.target.closest('.share-menu-container'))) {
                callback();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref, callback]);
};

export default useClickOutside;