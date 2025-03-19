// useDialogPosition.ts
import { useState, useCallback } from 'react';
import useViewSwitching from './useViewSwitching'; // Import useViewSwitching

const useDialogPosition = (
    calendarRef: React.RefObject<HTMLDivElement>,
    dialogRef: React.RefObject<HTMLDivElement>,
    defaultDOMRect: DOMRect
) => {
    const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 });
    const { view } = useViewSwitching(); // Get the current view

    const calculateDialogPosition = useCallback((targetRect: DOMRect) => {
        const calendarRect = calendarRef.current?.getBoundingClientRect() ?? defaultDOMRect;

        setTimeout(() => {
            if (dialogRef.current) {
                const dialogWidth = dialogRef.current.offsetWidth;
                const dialogHeight = dialogRef.current.offsetHeight;

                let x;
                let y;

                if (view === 'day') {
                    // --- DayView Specific Logic ---
                    x = targetRect.left - calendarRect.left + (targetRect.width - dialogWidth) / 2;
                    y = targetRect.top - calendarRect.top + (targetRect.height - dialogHeight) / 2;
                    // --- End DayView Logic ---
                } else {
                    // --- Existing Month/Week Logic ---
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;

                    const availableRight = viewportWidth - targetRect.right;
                    const availableBottom = viewportHeight - targetRect.bottom;

                    x = targetRect.right - calendarRect.left;

                    const calendarMidpointY = calendarRect.top + calendarRect.height / 2;

                    if (targetRect.top < calendarMidpointY) {
                        y = targetRect.top - calendarRect.top;
                    } else {
                        y = targetRect.bottom - calendarRect.top - dialogHeight;
                    }

                    if (availableRight < dialogWidth) {
                        x = targetRect.left - calendarRect.left - dialogWidth;
                    }

                    if (availableBottom < dialogHeight && targetRect.top >= calendarMidpointY) {
                        y = targetRect.top - calendarRect.top - dialogHeight;
                        if (availableRight < dialogWidth) {
                            y = targetRect.top - calendarRect.top - dialogHeight;
                        }
                    }

                    if (targetRect.top < calendarMidpointY && (targetRect.top - calendarRect.top) < dialogHeight) {
                        y = targetRect.bottom - calendarRect.top;
                    }
                    // --- End Existing Logic ---
                }


                setDialogPosition({ x, y });
            }
        }, 0);
    }, [calendarRef, dialogRef, defaultDOMRect, view]); // Add 'view' to dependencies

    return { dialogPosition, calculateDialogPosition };
};

export default useDialogPosition;