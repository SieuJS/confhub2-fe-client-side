import { useState, useEffect, useCallback, useRef } from 'react';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import type { ResizeDirection, NumberSize } from 're-resizable';

interface FloatingWindowControlsProps {
  initialWidth: number;
  initialHeight: number;
  minConstraints: { width: number; height: number };
  maxConstraintsPercentage: { width: number; height: number };
  localStorageKeys: { position: string; size: string };
  isEnabled: boolean;
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
  setPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  setSize: React.Dispatch<React.SetStateAction<{ width: number; height: number }>>;
  isInitialized: boolean;
}

// Helper function to get initial size from localStorage or defaults
const getInitialSizeValue = (
  lsKey: string,
  initialW: number,
  initialH: number,
  minW: number,
  minH: number,
  maxWPercent: number,
  maxHPercent: number
): { width: number; height: number } => {
  if (typeof window === 'undefined') {
    // console.log('[FWC InitSize] Window undefined, returning defaults for SSR/pre-mount');
    return { width: initialW, height: initialH };
  }
  const savedSizeJSON = localStorage.getItem(lsKey);
  if (savedSizeJSON) {
    try {
      const parsedSize = JSON.parse(savedSizeJSON);
      return {
        width: Math.min(
          Math.max(parsedSize.width, minW),
          window.innerWidth * maxWPercent
        ),
        height: Math.min(
          Math.max(parsedSize.height, minH),
          window.innerHeight * maxHPercent
        ),
      };
    } catch (e) {
      // console.error(`[FWC InitSize] Failed to parse saved size ${lsKey}:`, e);
      // Fall through to default if parsing fails
    }
  }
  // console.log('[FWC InitSize] No saved size or error, returning defaults');
  return { width: initialW, height: initialH };
};

// Helper function to get initial position from localStorage or defaults
const getInitialPositionValue = (
  lsKey: string,
  currentSize: { width: number; height: number } // Relies on the actual initial size
): { x: number; y: number } => {
  if (typeof window === 'undefined') {
    // console.log('[FWC InitPos] Window undefined, returning 0,0 for SSR/pre-mount');
    return { x: 0, y: 0 }; // Default if no window (SSR or pre-mount)
  }
  const savedPositionJSON = localStorage.getItem(lsKey);
  // Default position calculation (e.g., bottom-right with padding)
  const defaultX = Math.max(0, window.innerWidth - currentSize.width - 32);
  const defaultY = Math.max(0, window.innerHeight - currentSize.height - 32);

  if (savedPositionJSON) {
    try {
      const parsedPosition = JSON.parse(savedPositionJSON);
      return {
        x: Math.min(
          Math.max(0, parsedPosition.x),
          Math.max(0, window.innerWidth - currentSize.width) // Ensure within bounds
        ),
        y: Math.min(
          Math.max(0, parsedPosition.y),
          Math.max(0, window.innerHeight - currentSize.height) // Ensure within bounds
        ),
      };
    } catch (e) {
      // console.error(`[FWC InitPos] Failed to parse saved position ${lsKey}:`, e);
      // Fall through to default if parsing fails
    }
  }
  // console.log('[FWC InitPos] No saved position or error, returning calculated defaults');
  return { x: defaultX, y: defaultY };
};


export const useFloatingWindowControls = ({
  initialWidth,
  initialHeight,
  minConstraints,
  maxConstraintsPercentage,
  localStorageKeys,
  isEnabled,
}: FloatingWindowControlsProps): FloatingWindowControlsReturn => {
  const [isInitialized, setIsInitialized] = useState(false);

  const [size, setSize] = useState(() =>
    getInitialSizeValue(
      localStorageKeys.size, initialWidth, initialHeight,
      minConstraints.width, minConstraints.height,
      maxConstraintsPercentage.width, maxConstraintsPercentage.height
    )
  );

  const [position, setPosition] = useState(() => {
    const actualInitialSize = getInitialSizeValue(
        localStorageKeys.size, initialWidth, initialHeight,
        minConstraints.width, minConstraints.height,
        maxConstraintsPercentage.width, maxConstraintsPercentage.height
    );
    return getInitialPositionValue(localStorageKeys.position, actualInitialSize);
  });

  const [isInteracting, setIsInteracting] = useState(false);
  const [bounds, setBounds] = useState({ left: 0, top: 0, right: 0, bottom: 0 });
  const draggableWrapperRef = useRef<HTMLDivElement>(null);

  // --- 1. EFFECT FOR INITIALIZATION AND SYNCHRONIZATION ---
  useEffect(() => {
    if (!isEnabled) {
      setIsInitialized(false);
      // console.log('[FWC SyncEffect] Disabled. isInitialized set to false.');
      return;
    }

    if (typeof window !== 'undefined') {
      // console.log('[FWC SyncEffect] Enabled and window defined. Reading from localStorage.');
      const lsSize = getInitialSizeValue(
        localStorageKeys.size, initialWidth, initialHeight,
        minConstraints.width, minConstraints.height,
        maxConstraintsPercentage.width, maxConstraintsPercentage.height
      );

      setSize(currentSize => {
        if (currentSize.width !== lsSize.width || currentSize.height !== lsSize.height) {
          // console.log('[FWC SyncEffect] Updating size from', currentSize, 'to', lsSize);
          return lsSize;
        }
        return currentSize;
      });

      const lsPosition = getInitialPositionValue(localStorageKeys.position, lsSize);
      setPosition(currentPosition => {
        if (currentPosition.x !== lsPosition.x || currentPosition.y !== lsPosition.y) {
          // console.log('[FWC SyncEffect] Updating position from', currentPosition, 'to', lsPosition);
          return lsPosition;
        }
        return currentPosition;
      });

      setIsInitialized(true);
      // console.log('[FWC SyncEffect] Initialization complete. Size:', lsSize, 'Position:', lsPosition);
    } else {
      // console.log('[FWC SyncEffect] Enabled but window NOT defined. isInitialized remains false.');
      setIsInitialized(false);
    }
  }, [
    isEnabled,
    localStorageKeys.position,
    localStorageKeys.size,
    initialWidth,
    initialHeight,
    minConstraints.width,
    minConstraints.height,
    maxConstraintsPercentage.width,
    maxConstraintsPercentage.height,
    // setSize and setPosition are stable and not needed in deps
  ]);

  // --- 2. ADJUSTING position to fit screen (helper) ---
  const adjustPositionToFitScreen = useCallback(() => {
    if (typeof window === 'undefined' || !isEnabled || !isInitialized) return;

    const currentWidth = size.width;
    const currentHeight = size.height;

    setPosition(prevPos => {
      const maxX = window.innerWidth - currentWidth;
      const maxY = window.innerHeight - currentHeight;
      const safeMaxX = Math.max(0, maxX);
      const safeMaxY = Math.max(0, maxY);
      let newX = prevPos.x, newY = prevPos.y, changed = false;
      if (newX < 0) { newX = 0; changed = true; }
      if (newY < 0) { newY = 0; changed = true; }
      if (newX > safeMaxX) { newX = safeMaxX; changed = true; }
      if (newY > safeMaxY) { newY = safeMaxY; changed = true; }
      if (changed) {
        // console.log('[FWC] adjustPositionToFitScreen: Adjusting to', { x: newX, y: newY });
        return { x: newX, y: newY };
      }
      return prevPos;
    });
  }, [isEnabled, size.width, size.height, isInitialized, setPosition]); // Added setPosition

  // --- 3. UPDATING bounds and auto-adjusting position on window/internal size changes ---
  useEffect(() => {
    if (typeof window === 'undefined' || !isEnabled || !isInitialized) return;

    const handleExternalOrInternalResize = () => {
      // console.log('[FWC BoundsEffect] Resizing. Current size:', size);
      setBounds({
        left: 0,
        top: 0,
        right: Math.max(0, window.innerWidth - size.width),
        bottom: Math.max(0, window.innerHeight - size.height),
      });
      adjustPositionToFitScreen();
    };

    handleExternalOrInternalResize();
    window.addEventListener('resize', handleExternalOrInternalResize);
    return () => window.removeEventListener('resize', handleExternalOrInternalResize);
  }, [size.width, size.height, adjustPositionToFitScreen, isEnabled, isInitialized]);


  // --- 4. SAVING to localStorage ---
  useEffect(() => {
    if (isEnabled && isInitialized && !isInteracting && typeof window !== 'undefined') {
      // console.log('[FWC SaveSizeEffect] Saving size:', size);
      localStorage.setItem(localStorageKeys.size, JSON.stringify(size));
    }
  }, [size, isEnabled, isInitialized, isInteracting, localStorageKeys.size]);

  useEffect(() => {
    if (isEnabled && isInitialized && !isInteracting && typeof window !== 'undefined') {
      // console.log('[FWC SavePosEffect] Saving position:', position);
      localStorage.setItem(localStorageKeys.position, JSON.stringify(position));
    }
  }, [position, isEnabled, isInitialized, isInteracting, localStorageKeys.position]);


  // --- 5. DRAG Handlers ---
  const onDragStart = useCallback(() => {
    // console.log('[FWC] DragStart');
    setIsInteracting(true);
  }, []);

  const handleDrag = useCallback((e: DraggableEvent, ui: DraggableData) => {
    setPosition({ x: ui.x, y: ui.y });
  }, [setPosition]); // Added setPosition

  const onDragStop = useCallback(() => {
    // console.log('[FWC] DragStop');
    setIsInteracting(false);
  }, []);


  // --- 6. RESIZE Handlers ---
  const onResizeStart = useCallback(() => {
    // console.log('[FWC] ResizeStart');
    setIsInteracting(true);
  }, []);

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
    [setSize] // Added setSize
  );

  const onResizeStop = useCallback(
    (
      event: MouseEvent | TouchEvent,
      direction: ResizeDirection,
      elementRef: HTMLElement,
      delta: NumberSize
    ) => {
      // console.log('[FWC] ResizeStop');
      const finalSize = {
        width: elementRef.offsetWidth,
        height: elementRef.offsetHeight,
      };
      setSize(finalSize);
      setIsInteracting(false);
    },
    [setSize] // Added setSize
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
    setPosition,
    setSize,
    isInitialized,
  };
};