// src/hooks/useAudioEngine.ts
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { base64ToAudioBuffer } from '../utils/audioPlayerUtils'; // Giả sử đường dẫn đúng

interface UseAudioEngineProps {
  audioData: string;
  sampleRate: number;
  autoPlay?: boolean;
}

export interface AudioEngineControls {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isMuted: boolean;
  error: string | null;
  canPlay: boolean;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  toggleMute: () => void;
  audioBuffer: AudioBuffer | null;
}

export const useAudioEngine = ({
  audioData,
  sampleRate,
  autoPlay = false,
}: UseAudioEngineProps): AudioEngineControls => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const lastVolumeRef = useRef(1);

  const animationFrameIdRef = useRef<number | null>(null);
  const audioStartTimeRef = useRef(0);
  const bufferOffsetRef = useRef(0);
  const initialAutoPlayDoneRef = useRef(false);

  // Refs for stable values in callbacks
  const currentTimeRef = useRef(currentTime);
  const durationRef = useRef(duration);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => { currentTimeRef.current = currentTime; }, [currentTime]);
  useEffect(() => { durationRef.current = duration; }, [duration]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);


  useEffect(() => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;
      const gainNode = context.createGain();
      gainNodeRef.current = gainNode;
      gainNode.gain.value = isMuted ? 0 : lastVolumeRef.current;
      gainNode.connect(context.destination);
    } catch (e) {
      console.error("Failed to create AudioContext:", e);
      setError("Audio playback is not supported on this browser.");
    }
    return () => {
      audioContextRef.current?.close().catch(console.error);
    };
  }, []); // isMuted không cần ở đây, sẽ xử lý riêng

  useEffect(() => {
    if (gainNodeRef.current) {
      if (isMuted) {
        lastVolumeRef.current = gainNodeRef.current.gain.value;
        gainNodeRef.current.gain.value = 0;
      } else {
        gainNodeRef.current.gain.value = lastVolumeRef.current > 0 ? lastVolumeRef.current : 1;
      }
    }
  }, [isMuted]);

  const stopPlayback = useCallback((resetTime = false) => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.onended = null;
        sourceNodeRef.current.stop();
      } catch (e) { /* Ignore */ }
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
    if (resetTime) {
      setCurrentTime(0);
      bufferOffsetRef.current = 0;
    }
  }, []); // Thêm các setters làm dependency nếu cần (setIsPlaying, setCurrentTime)
          // Tuy nhiên, setters từ useState thường ổn định.

  const playInternal = useCallback((offset: number) => {
    const context = audioContextRef.current;
    const buffer = audioBufferRef.current;
    const gainNode = gainNodeRef.current;

    if (!context || !buffer || !gainNode) {
      console.warn("Cannot play: Audio resources not ready.");
      setIsPlaying(false); // Ensure isPlaying is false if we can't play
      return;
    }
    if (context.state === 'suspended') {
      context.resume().catch(console.error);
    }

    stopPlayback(); // Stop existing, preserve currentTime & bufferOffsetRef

    const actualBufferDuration = buffer.duration;

    if (actualBufferDuration === 0) {
        console.warn("Cannot play: Audio buffer duration is zero.");
        setCurrentTime(0); // Ensure time is at 0 for zero duration
        bufferOffsetRef.current = 0;
        setIsPlaying(false);
        return;
    }
    
    // Clamp offset to be within [0, actualBufferDuration]
    let playOffset = Math.max(0, Math.min(offset, actualBufferDuration));

    // Web Audio API's source.start(when, offset) requires offset < buffer.duration
    // If trying to play exactly at or after the end, treat as "seek to end"
    if (playOffset >= actualBufferDuration) {
        setCurrentTime(actualBufferDuration);
        bufferOffsetRef.current = actualBufferDuration;
        setIsPlaying(false); // Already set by stopPlayback, but make sure
        // console.log('Seeked to end, not starting playback.');
        return;
    }

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(gainNode);
    sourceNodeRef.current = source;
    
    bufferOffsetRef.current = playOffset; // This is where playback will start from within the buffer
    audioStartTimeRef.current = context.currentTime; // Context time when playback actually begins

    source.onended = () => {
      if (sourceNodeRef.current === source) {
        // Use refs for latest values
        const currentTrackTime = currentTimeRef.current;
        const trackDuration = durationRef.current;
        // A small tolerance for floating point inaccuracies
        const isEndOfTrack = trackDuration > 0 && currentTrackTime >= trackDuration - 0.02;

        stopPlayback(isEndOfTrack);
        if (isEndOfTrack) {
          setCurrentTime(trackDuration); // Ensure displayed time is exactly duration
        }
      }
    };

    try {
      source.start(0, playOffset);
      setIsPlaying(true);
    } catch (e) {
      console.error("Failed to start playback:", e);
      setError(`Could not play audio: ${(e as Error).message}`);
      stopPlayback(true); // Reset fully on error
    }
  }, [stopPlayback, setError]); // Dependencies: stable callbacks and refs

  // Decode audio data
  useEffect(() => {
    if (!audioData || !audioContextRef.current) {
      if (!audioData) {
        stopPlayback(true);
        setDuration(0);
        setCurrentTime(0); // also reset currentTime
        audioBufferRef.current = null;
        setError(null);
      }
      return;
    }
    initialAutoPlayDoneRef.current = false; // Reset for new audioData

    const decode = async () => {
      stopPlayback(true); // Reset time and everything before decoding new audio
      audioBufferRef.current = null;
      setDuration(0);
      // setCurrentTime(0); // stopPlayback(true) already does this
      setError(null);

      try {
        const buffer = await base64ToAudioBuffer(audioData, audioContextRef.current!, sampleRate);
        if (buffer) {
          audioBufferRef.current = buffer;
          setDuration(buffer.duration);
          // setCurrentTime(0); // Already reset, bufferOffsetRef is 0
          if (autoPlay && !initialAutoPlayDoneRef.current && buffer.duration > 0) {
            playInternal(0);
            initialAutoPlayDoneRef.current = true;
          }
        } else {
            setError("Failed to decode audio: buffer is null.");
        }
      } catch (e: any) {
        console.error("Error decoding audio:", e);
        setError(e.message || "Failed to process audio.");
        setDuration(0);
        setCurrentTime(0);
        audioBufferRef.current = null;
      }
    };
    decode();
  }, [audioData, sampleRate, autoPlay, stopPlayback, playInternal]); // playInternal added as it's used for autoPlay

  // Update currentTime using requestAnimationFrame
  useEffect(() => {
    if (isPlaying) {
      const update = () => {
        if (!isPlayingRef.current || !audioContextRef.current || !sourceNodeRef.current) { // Use isPlayingRef
          return;
        }
        // elapsed time since playback started (or resumed after seek)
        const elapsedTimeInContext = audioContextRef.current.currentTime - audioStartTimeRef.current;
        // new time is the point where we started in buffer + elapsed time
        let newCurrentTime = bufferOffsetRef.current + elapsedTimeInContext;

        // Clamp to [0, duration]
        newCurrentTime = Math.max(0, Math.min(newCurrentTime, durationRef.current)); // Use durationRef

        setCurrentTime(newCurrentTime);

        // Continue animation if still playing and not past duration
        if (newCurrentTime < durationRef.current) { // Use durationRef
          animationFrameIdRef.current = requestAnimationFrame(update);
        } else {
          // If we've reached or passed duration, let onended handle proper stop and state update
          // This rAF loop should stop updating currentTime past duration.
          // (onended will set it precisely to duration if it's a natural end)
        }
      };
      animationFrameIdRef.current = requestAnimationFrame(update);
    } else {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    }
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isPlaying /*, durationRef, isPlayingRef */]); // Dependencies should be minimal for rAF loop itself
                                                     // isPlaying is the trigger. Refs are read inside.


  const play = useCallback(() => {
    const currentBuffer = audioBufferRef.current;
    if (!currentBuffer || currentBuffer.duration === 0) return;

    // Use refs for up-to-date values
    const trackDuration = durationRef.current;
    const currentTrackTime = currentTimeRef.current;

    if (trackDuration > 0 && currentTrackTime >= trackDuration - 0.02) {
      playInternal(0); // If at end, play from start
    } else {
      playInternal(currentTrackTime); // Play from current (paused) time
    }
  }, [playInternal]); // playInternal is stable, refs are used inside it or play()

  const pause = useCallback(() => {
    // currentTime is already preserved by the rAF loop stopping.
    // bufferOffsetRef is also preserved because stopPlayback is called with false.
    // When playInternal is called next, it will use the current currentTime.
    stopPlayback(false);
  }, [stopPlayback]);


  const debouncedSeekHandler = useCallback((time: number) => {
    const currentBuffer = audioBufferRef.current;
    // Use refs for most up-to-date state inside debounced function
    const currentTrackDuration = durationRef.current;

    if (!currentBuffer || currentTrackDuration === 0) return;

    const newTime = Math.max(0, Math.min(time, currentTrackDuration));

    if (isPlayingRef.current) {
      playInternal(newTime); // This will stop current, set new offset, and start
    } else {
      // If paused, just update the internal offset and visual time
      bufferOffsetRef.current = newTime;
      setCurrentTime(newTime); // Manually update currentTime when paused and seeking
    }
  }, [playInternal, setCurrentTime /*, isPlayingRef, durationRef */]); // playInternal and setCurrentTime are stable enough.
                                                                    // Refs are read inside.

  // Create the debounced function once, or when its handler changes
  const debouncedSeekInternal = useMemo(() => debounce(debouncedSeekHandler, 50), [debouncedSeekHandler]); // 50ms debounce

  const seek = useCallback((time: number) => {
    const currentTrackDuration = durationRef.current; // Use ref for up-to-date value
    if (currentTrackDuration > 0) {
      // Optimistic update for slider responsiveness
      // This setCurrentTime will also update currentTimeRef.current via its useEffect
      setCurrentTime(Math.max(0, Math.min(time, currentTrackDuration)));
    }
    debouncedSeekInternal(time);
  }, [debouncedSeekInternal, setCurrentTime /*, durationRef */]);

  const toggleMute = useCallback(() => {
    setIsMuted(prevMuted => !prevMuted);
  }, []);

  const canPlay = audioBufferRef.current != null && duration > 0;

  return {
    isPlaying,
    currentTime,
    duration,
    isMuted,
    error,
    canPlay,
    play,
    pause,
    seek,
    toggleMute,
    audioBuffer: audioBufferRef.current,
  };
};