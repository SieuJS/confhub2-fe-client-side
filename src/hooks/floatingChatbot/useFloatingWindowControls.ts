// src/hooks/useFloatingWindowControls.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import type { ResizeDirection, NumberSize } from 're-resizable';

interface FloatingWindowControlsProps {
  initialWidth: number;
  initialHeight: number;
  minConstraints: { width: number; height: number };
  maxConstraintsPercentage: { width: number; height: number };
  localStorageKeys: { position: string; size: string };
  isEnabled: boolean; // To control when the hook is active (e.g., when chat is open)
}

interface FloatingWindowControlsReturn {
  position: { x: number; y: number };
  size: { width: number; height: number };
  bounds: { left: number; top: number; right: number; bottom: number };
  draggableWrapperRef: React.RefObject<HTMLDivElement>;
  dragHandlers: {
    onStart: () => void;
    onDrag: (e: DraggableEvent, ui: DraggableData) => void;
    onStop: () => void;
  };
  resizeHandlers: {
    onResizeStart: (
      e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>,
      dir: ResizeDirection,
      elementRef: HTMLElement
    ) => void;
    onResize: (
      event: MouseEvent | TouchEvent,
      direction: ResizeDirection,
      elementRef: HTMLElement,
      delta: NumberSize
    ) => void;
    onResizeStop: (
      event: MouseEvent | TouchEvent,
      direction: ResizeDirection,
      elementRef: HTMLElement,
      delta: NumberSize
    ) => void;
  };
  currentMaxWidth: number;
  currentMaxHeight: number;
  adjustPositionToFitScreen: () => void;
  isInteracting: boolean;
  // Expose setters if the parent component needs to programmatically change them
  // (e.g., on initial load from a different source or specific reset)
  setPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  setSize: React.Dispatch<React.SetStateAction<{ width: number; height: number }>>;
}

export const useFloatingWindowControls = ({
  initialWidth,
  initialHeight,
  minConstraints,
  maxConstraintsPercentage,
  localStorageKeys,
  isEnabled,
}: FloatingWindowControlsProps): FloatingWindowControlsReturn => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({
    width: initialWidth,
    height: initialHeight,
  });
  const [isInteracting, setIsInteracting] = useState(false);
  const [bounds, setBounds] = useState<{
    left: number;
    top: number;
    right: number;
    bottom: number;
  }>({ left: 0, top: 0, right: 0, bottom: 0 });

  const draggableWrapperRef = useRef<HTMLDivElement>(null);

  const adjustPositionToFitScreen = useCallback(() => {
    if (typeof window === 'undefined' || !isEnabled) return;
    
    // Use current size from state for calculations
    const currentWidth = size.width;
    const currentHeight = size.height;

    setPosition(prevPos => {
      const maxX = window.innerWidth - currentWidth;
      const maxY = window.innerHeight - currentHeight;
      const safeMaxX = Math.max(0, maxX);
      const safeMaxY = Math.max(0, maxY);

      const newX = Math.min(Math.max(0, prevPos.x), safeMaxX);
      const newY = Math.min(Math.max(0, prevPos.y), safeMaxY);

      if (newX !== prevPos.x || newY !== prevPos.y) {
        return { x: newX, y: newY };
      }
      return prevPos;
    });
  }, [isEnabled, size.width, size.height, setPosition]); // Ensure it re-runs if size changes

  // Load from localStorage on mount or when enabled
  useEffect(() => {
    if (typeof window === 'undefined' || !isEnabled) return;

    const savedPositionJSON = localStorage.getItem(localStorageKeys.position);
    const savedSizeJSON = localStorage.getItem(localStorageKeys.size);

    let newSizeState = { width: initialWidth, height: initialHeight };
    if (savedSizeJSON) {
      try {
        const parsedSize = JSON.parse(savedSizeJSON);
        newSizeState.width = Math.min(
          Math.max(parsedSize.width, minConstraints.width),
          window.innerWidth * maxConstraintsPercentage.width
        );
        newSizeState.height = Math.min(
          Math.max(parsedSize.height, minConstraints.height),
          window.innerHeight * maxConstraintsPercentage.height
        );
      } catch (e) {
        console.error(`Failed to parse saved ${localStorageKeys.size}:`, e);
      }
    }
    setSize(newSizeState);

    let newPositionState = { x: 0, y: 0 };
    if (savedPositionJSON) {
      try {
        const parsedPosition = JSON.parse(savedPositionJSON);
        newPositionState.x = Math.min(
          Math.max(0, parsedPosition.x),
          Math.max(0, window.innerWidth - newSizeState.width) // Use newSizeState
        );
        newPositionState.y = Math.min(
          Math.max(0, parsedPosition.y),
          Math.max(0, window.innerHeight - newSizeState.height) // Use newSizeState
        );
      } catch (e) {
        console.error(`Failed to parse saved ${localStorageKeys.position}:`, e);
        newPositionState.x = Math.max(0, window.innerWidth - newSizeState.width - 32);
        newPositionState.y = Math.max(0, window.innerHeight - newSizeState.height - 32);
      }
    } else {
      newPositionState.x = Math.max(0, window.innerWidth - newSizeState.width - 32);
      newPositionState.y = Math.max(0, window.innerHeight - newSizeState.height - 32);
    }
    setPosition(newPositionState);
    // This effect should primarily run when `isEnabled` becomes true,
    // or if the configuration props change (which is less likely for keys/initial values).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isEnabled, 
    localStorageKeys.position, 
    localStorageKeys.size, 
    initialWidth, 
    initialHeight, 
    minConstraints.width, 
    minConstraints.height, 
    maxConstraintsPercentage.width, 
    maxConstraintsPercentage.height
    // setSize and setPosition are stable, no need to list them here
  ]);

  // Update bounds and adjust position on window resize or internal size change
  useEffect(() => {
    if (typeof window === 'undefined' || !isEnabled) return;

    const handleResizeOrSizeChange = () => {
      setBounds({
        left: 0,
        top: 0,
        right: Math.max(0, window.innerWidth - size.width),
        bottom: Math.max(0, window.innerHeight - size.height),
      });
      // Important: Call adjustPositionToFitScreen AFTER bounds might have changed
      // and after size state is confirmed.
      adjustPositionToFitScreen();
    };

    handleResizeOrSizeChange();
    window.addEventListener('resize', handleResizeOrSizeChange);
    return () => window.removeEventListener('resize', handleResizeOrSizeChange);
  }, [size.width, size.height, adjustPositionToFitScreen, isEnabled]);


  const handleDrag = (e: DraggableEvent, ui: DraggableData) => {
    setPosition({ x: ui.x, y: ui.y });
  };

  const handleResize = useCallback(
    (
      event: MouseEvent | TouchEvent,
      direction: ResizeDirection,
      elementRef: HTMLElement,
      delta: NumberSize
    ) => {
      setSize(prevSize => ({
        width: prevSize.width + delta.width,
        height: prevSize.height + delta.height,
      }));
    },
    [setSize] // setSize is stable
  );

  const onDragStart = () => setIsInteracting(true);
  const onDragStop = () => {
    setIsInteracting(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(localStorageKeys.position, JSON.stringify(position));
    }
  };

  const onResizeStart = useCallback(() => {
    setIsInteracting(true);
  }, []);

  const onResizeStop = useCallback(
    (
      event: MouseEvent | TouchEvent,
      direction: ResizeDirection,
      elementRef: HTMLElement,
      delta: NumberSize
    ) => {
      setIsInteracting(false);
      if (typeof window !== 'undefined') {
        // `size` state is already updated by `handleResize` via `setSize`.
        localStorage.setItem(localStorageKeys.size, JSON.stringify(size));
        
        // Position might need adjustment after resize.
        // The original logic called adjustPositionToFitScreen and then saved the *current* position state.
        // This means it saved the position *before* adjustPositionToFitScreen's setPosition might have taken effect in the next render.
        // We replicate this to maintain original logic.
        adjustPositionToFitScreen(); 
        localStorage.setItem(localStorageKeys.position, JSON.stringify(position));
      }
    },
    [size, position, adjustPositionToFitScreen, localStorageKeys.size, localStorageKeys.position]
  );

  const currentMaxWidth = typeof window !== 'undefined' ? window.innerWidth * maxConstraintsPercentage.width : initialWidth * 1.5;
  const currentMaxHeight = typeof window !== 'undefined' ? window.innerHeight * maxConstraintsPercentage.height : initialHeight * 1.5;

  return {
    position,
    size,
    bounds,
    draggableWrapperRef,
    dragHandlers: {
      onStart: onDragStart,
      onDrag: handleDrag,
      onStop: onDragStop,
    },
    resizeHandlers: {
      onResizeStart: onResizeStart,
      onResize: handleResize,
      onResizeStop: onResizeStop,
    },
    currentMaxWidth,
    currentMaxHeight,
    adjustPositionToFitScreen,
    isInteracting,
    setPosition, // Exposing for toggleChatbot's explicit load
    setSize,     // Exposing for toggleChatbot's explicit load
  };
};