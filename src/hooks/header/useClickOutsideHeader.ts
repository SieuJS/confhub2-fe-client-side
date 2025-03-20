// components/Header/hooks/useClickOutside.ts
import { useEffect, RefObject } from 'react';
import { debounce } from './debounce'; // Put debounce in a utils folder

export const useClickOutside = (ref: RefObject<HTMLElement>, callback: () => void) => {
    useEffect(() => {
        const handleClickOutside = debounce((event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        }, 200);

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref, callback]);
};