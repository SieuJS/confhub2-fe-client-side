// src/hooks/usePopularConferences.ts
import { useState, useRef, useEffect, useCallback } from 'react';
import { ConferenceInfo } from '@/src/models/response/conference.list.response';
import { getListConference } from '@/src/api/conference/getListConferences';

type Conference = ConferenceInfo;

interface UsePopularConferencesReturn {
    listConferences: Conference[];
    isHovered: boolean;
    displayedCards: Conference[];
    loading: boolean;
    scroll: (direction: 'left' | 'right') => void;
    handleMouseEnter: () => void;
    handleMouseLeave: () => void;
    visibleCount: number;
}

const usePopularConferences = (initialVisibleCount: number = 3): UsePopularConferencesReturn => { // Add initialVisibleCount parameter
    const [listConferences, setListConferences] = useState<Conference[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);  // Start at 0 for multiple visible cards
    const [isHovered, setIsHovered] = useState(false);
    const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(initialVisibleCount); // Use state for visibleCount


    const wrapIndex = useCallback((index: number) => {
        return (index + listConferences.length) % listConferences.length;
    }, [listConferences.length]);

    const scroll = useCallback((direction: 'left' | 'right') => {
        setCurrentIndex(prevIndex => {
            let newIndex: number;
            if (direction === 'left') {
                newIndex = wrapIndex(prevIndex - 1);
            } else {
                newIndex = wrapIndex(prevIndex + 1);
            }
            return newIndex;
        });
    }, [wrapIndex]);

    const startAutoScroll = useCallback(() => {
        if (autoScrollInterval.current) {
            clearInterval(autoScrollInterval.current);
        }
        autoScrollInterval.current = setInterval(() => {
            scroll('right'); // Use the unified scroll function
        }, 3000);
    }, [scroll]);  // Depend on the scroll function

    const stopAutoScroll = useCallback(() => {
        if (autoScrollInterval.current) {
            clearInterval(autoScrollInterval.current);
            autoScrollInterval.current = null;
        }
    }, []);




    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
        stopAutoScroll();
    }, [stopAutoScroll]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        startAutoScroll();
    }, [startAutoScroll]);



    useEffect(() => {
        const fetchListConference = async () => {
            try {
                setLoading(true);
                const conferencesData = await getListConference();
                if (conferencesData.payload.length > 0) {
                    setListConferences(conferencesData.payload);
                } else {
                    setListConferences([]); // Nếu không có conference nào được follow
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchListConference();
    }, []);

    useEffect(() => {
        if (listConferences.length > 0) {
            startAutoScroll();
        }
        return () => {
            stopAutoScroll();
        };
    }, [currentIndex, listConferences.length]);

    // Calculate displayedCards correctly
    const displayedCards = [
        listConferences[wrapIndex(currentIndex - 2)],
        listConferences[wrapIndex(currentIndex - 1)],
        listConferences[currentIndex],
        listConferences[wrapIndex(currentIndex + 1)],
        listConferences[wrapIndex(currentIndex + 2)],
    ];


    return {
        listConferences,
        isHovered,
        displayedCards,
        loading,
        scroll, // Return the unified scroll function
        handleMouseEnter,
        handleMouseLeave,
        visibleCount,
    };
};
export default usePopularConferences;