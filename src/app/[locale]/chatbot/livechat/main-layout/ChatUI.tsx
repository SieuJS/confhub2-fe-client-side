// src/components/ChatUI.tsx (Adjusted)
'use client';

import { useState } from 'react';
import MainLayout from './MainLayout';
import { Altair } from '../altair/Altair'; // Adjust path if needed

// Import hooks and components needed for connection status/restart
import useConnection from '../hooks/useConnection'; // Adjust path if needed
import useTimer from '../hooks/useTimer'; // Adjust path if needed
import ConnectionStatus from './ConnectionStatus';
import RestartStreamButton from './RestartStreamButton';

// Import shared types (adjust path if needed)
// Make sure this path points to where your types are defined
import { OutputModality, PrebuiltVoice, Language } from '../multimodal-live-types'; // Or maybe just '../page' or '../types' depending on your structure

// Import system instructions (adjust path if needed)
// Make sure this path points to where instructions are defined
import { englishSystemInstructions, vietnameseSystemInstructions, chineseSystemInstructions } from '../altair/functionDeclaration';

// --- Constants ---
// List of available voices (can be moved to a config file)
const AVAILABLE_VOICES: PrebuiltVoice[] = ["Puck", "Charon", "Kore", "Fenrir", "Aoede", "Orus", "Zephyr"];
// List of available languages
const AVAILABLE_LANGUAGES: { code: Language; name: string, flagCode: string }[] = [

  { code: 'en', name: 'English', flagCode: 'gb' }, // Added flagCode
  { code: 'vi', name: 'Tiếng Việt', flagCode: 'vn' }, // Added flagCode
  // { code: 'de', name: 'Deutsch', flagCode: 'de' },
  // { code: 'fr', name: 'Français', flagCode: 'fr' },
  // { code: 'es', name: 'Español', flagCode: 'es' },
  // { code: 'ru', name: 'Русский', flagCode: 'ru' },
  { code: 'zh', name: '中文', flagCode: 'cn' },
  // { code: 'ja', name: '日本語', flagCode: 'jp' },
  // { code: 'ko', name: '한국어', flagCode: 'kr' },
  // { code: 'ar', name: 'العربية', flagCode: 'sa' },
  // { code: 'fa', name: 'فارسی', flagCode: 'ir' }
  // ... map other languages similarly
];
// Default language (you can change this)
const DEFAULT_LANGUAGE: Language = 'vi';
// Default voice
const DEFAULT_VOICE: PrebuiltVoice = 'Puck';
// Default modality
const DEFAULT_MODALITY: OutputModality = 'audio'; // Or 'text' if you prefer

// --- Component Definition ---
export default function ChatUI() {
  // --- State for output settings ---
  const [currentModality, setCurrentModality] = useState<OutputModality>(DEFAULT_MODALITY);
  const [currentVoice, setCurrentVoice] = useState<PrebuiltVoice>(DEFAULT_VOICE);
  // Add language state
  const [currentLanguage, setCurrentLanguage] = useState<Language>(DEFAULT_LANGUAGE);

  // --- Manage Connection State and Timer centrally ---
  const {
    connected,
    isConnecting,
    streamStartTime,
    connectionStatusMessage,
    connectWithPermissions,
    handleDisconnect,
    handleReconnect
  } = useConnection(); // Assuming useConnection provides these from LiveAPIContext implicitly

  const { elapsedTime, showTimer, handleCloseTimer } = useTimer(
    isConnecting,
    connected,
    streamStartTime
  );

  // --- Handlers for Settings ---
  const handleModalityChange = (modality: OutputModality) => {
    if (!connected) { // Prevent changes while connected
      setCurrentModality(modality);
    }
  };

  const handleVoiceChange = (voice: PrebuiltVoice) => {
    if (!connected) { // Prevent changes while connected
      setCurrentVoice(voice);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    if (!connected) { // Prevent changes while connected
      setCurrentLanguage(lang);
    }
  };

  // --- Determine System Instructions based on Language ---
  let systemInstructions = vietnameseSystemInstructions;


  if (currentLanguage === 'en') {
    systemInstructions = englishSystemInstructions;
  } else if (currentLanguage === 'zh') {
    systemInstructions = chineseSystemInstructions;
  }

  // --- Determine Connection Status Display Logic ---
  let connectionStatusType: 'connected' | 'error' | 'info' | 'connecting' = 'info';
  if (isConnecting) {
    connectionStatusType = 'connecting';
  } else if (connected) {
    connectionStatusType = 'connected';
  } else if (connectionStatusMessage) {
    // Show error if disconnected AFTER a stream attempt, otherwise info
    connectionStatusType = streamStartTime !== null ? 'error' : 'info';
  }

  const shouldShowExternalStatus = showTimer || (connectionStatusMessage && connectionStatusType !== 'connected');
  const shouldShowRestartButton = connectionStatusType === 'error'; // Show restart only on actual error after connection attempt

  return (
    // Main layout div
    <div className='relative flex h-screen flex-col'>

      {/* --- External Connection Status & Restart --- */}
      {shouldShowExternalStatus && (
        <div className='fixed top-4 z-50 flex w-full justify-center px-4'> {/* Added padding */}
          <ConnectionStatus
            status={connectionStatusType}
            message={connectionStatusMessage}
            elapsedTime={
              connectionStatusType === 'connected' ? elapsedTime : undefined
            }
            onClose={handleCloseTimer} // Allow closing the timer/status manually
          />
        </div>
      )}

      {shouldShowRestartButton && (
        <div className='fixed bottom-24 z-50 flex w-full justify-center px-4'> {/* Adjusted margin-top based on design */}
          <RestartStreamButton onRestart={handleReconnect} />
        </div>
      )}
      {/* --- END External Status --- */}


      {/* --- Main Layout Component --- */}
      {/* Pass all necessary state and handlers */}
      <MainLayout
        // Connection props
        connected={connected}
        isConnecting={isConnecting}
        streamStartTime={streamStartTime}
        connectionStatusMessage={connectionStatusMessage} // May not be needed inside MainLayout/SidePanel directly now
        connectWithPermissions={connectWithPermissions}
        handleDisconnect={handleDisconnect}

        // Output settings props
        currentModality={currentModality}
        onModalityChange={handleModalityChange} // Use the handler
        currentVoice={currentVoice}
        onVoiceChange={handleVoiceChange}     // Use the handler
        availableVoices={AVAILABLE_VOICES}

        // Language settings props
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange} // Use the handler
        availableLanguages={AVAILABLE_LANGUAGES}
      />

      {/* --- Altair Component (for API configuration) --- */}
      {/* Pass settings required by Altair */}
      <Altair
        outputModality={currentModality}
        selectedVoice={currentVoice}
        language={currentLanguage}          // Pass language
        systemInstructions={systemInstructions} // Pass derived instructions
      />

    </div>
  );
}