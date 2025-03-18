// hooks/useViewSwitching.ts (Corrected and Further Improved)
import { useState, useCallback, useRef } from 'react';

export type ViewType = 'day' | 'week' | 'month';

interface ViewSwitchingResult {
  view: ViewType;
  setView: (view: ViewType) => void;
  showViewOptions: boolean;
  setShowViewOptions: React.Dispatch<React.SetStateAction<boolean>>; // Add this!
  toggleViewOptions: () => void;
  viewOptionsRef: React.RefObject<HTMLDivElement>;
}

const useViewSwitching = (initialView: ViewType = 'month'): ViewSwitchingResult => {
  const [view, setView] = useState<ViewType>(initialView);
  const [showViewOptions, setShowViewOptions] = useState(false);
  const viewOptionsRef = useRef<HTMLDivElement>(null);

  const toggleViewOptions = useCallback(() => {
    setShowViewOptions((prevShowViewOptions) => !prevShowViewOptions);
  }, []);

  // The click-outside logic is better handled *inside* the main Calendar component,
  // not within the useViewSwitching hook.  We'll remove it from here.

  return { view, setView, showViewOptions, setShowViewOptions, toggleViewOptions, viewOptionsRef };
};

export default useViewSwitching;