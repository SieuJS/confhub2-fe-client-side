// src/hooks/dashboard/note/useResizablePanels.ts
import { useState, useRef, useCallback, useEffect } from 'react';

export const useResizablePanels = (initialWidth: number) => {
  const [leftWidth, setLeftWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const leftSectionRef = useRef<HTMLDivElement>(null);
  const rightSectionRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !leftSectionRef.current) return;

      const container = leftSectionRef.current.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      const minWidth = 10;
      const maxWidth = 90;

      if (newLeftWidth >= minWidth && newLeftWidth <= maxWidth) {
        setLeftWidth(newLeftWidth);
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  return {
    leftWidth,
    isResizing,
    startResizing,
    leftSectionRef,
    rightSectionRef
  };
};