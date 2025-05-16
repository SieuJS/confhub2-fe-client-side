// src/app/[locale]/chatbot/livechat/hooks/useInteractionState.ts
import { useState, useEffect } from 'react';

interface UseInteractionStateProps {
  connected: boolean;
  isConnecting: boolean;
  streamStartTime: number | null;
}

export function useInteractionState({
  connected,
  isConnecting,
  streamStartTime,
}: UseInteractionStateProps) {
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (connected || isConnecting || streamStartTime !== null) {
      setHasInteracted(true);
    }
  }, [connected, isConnecting, streamStartTime]);

  const recordInteraction = () => {
    setHasInteracted(true);
  };

  return {
    hasInteracted,
    recordInteraction,
  };
}