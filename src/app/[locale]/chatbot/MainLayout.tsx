 // src/components/layout/MainLayout.tsx
 'use client';

 import React, { useState } from 'react';
 import SidePanel from './SidePanel'; // Adjust path if needed
 import useConnection from '../chatbot/livechat/hooks/useConnection'; // Adjust path if needed
 import { LanguageOption, OutputModality, PrebuiltVoice, Language, ChatMode } from '../chatbot/lib/types'; // Adjusted path assumption
 import { AlignJustify } from 'lucide-react';

 interface MainLayoutProps {
     children: React.ReactNode;
     currentChatMode: ChatMode;
     onChatModeChange: (mode: ChatMode) => void;
     currentModality: OutputModality;
     onModalityChange: (modality: OutputModality) => void;
     currentVoice: PrebuiltVoice;
     onVoiceChange: (voice: PrebuiltVoice) => void;
     availableVoices: PrebuiltVoice[];
     currentLanguage: Language;
     onLanguageChange: (lang: Language) => void;
     availableLanguages: LanguageOption[];
 }

 export default function MainLayout({
     children,
     currentChatMode,
     onChatModeChange,
     currentModality,
     onModalityChange,
     currentVoice,
     onVoiceChange,
     availableVoices,
     currentLanguage,
     onLanguageChange,
     availableLanguages
 }: MainLayoutProps) {
     const [isOutputSettingsOpen, setIsOutputSettingsOpen] = useState(true); // Panel state
     const { connected } = useConnection();


     return (
         // Main flex container
         <div className="flex h-screen bg-gray-100 overflow-hidden">

             {/* --- Open Settings Button (Remains Fixed) --- */}
             {!isOutputSettingsOpen && (
                 <button
                     onClick={() => setIsOutputSettingsOpen(true)}
                     className="fixed left-6 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 shadow-lg hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" // Keep fixed position
                     title="Open settings"
                     aria-label="Open settings"
                     aria-expanded={isOutputSettingsOpen}
                     aria-controls="sidepanel-content" // Can point to fieldset inside SidePanel now
                 >
                     <AlignJustify className="h-5 w-5" />
                     <span className="sr-only">Open settings</span>
                 </button>
             )}

             {/* --- Side Panel (Now part of the flex flow) --- */}
             <SidePanel
                 isOpen={isOutputSettingsOpen}
                 onClose={() => setIsOutputSettingsOpen(false)}
                 currentChatMode={currentChatMode}
                 onChatModeChange={onChatModeChange}
                 currentModality={currentModality}
                 onModalityChange={onModalityChange}
                 currentVoice={currentVoice}
                 onVoiceChange={onVoiceChange}
                 availableVoices={availableVoices}
                 currentLanguage={currentLanguage}
                 onLanguageChange={onLanguageChange}
                 availableLanguages={availableLanguages}
                 isLiveConnected={connected} // Pass connection status
             />

             {/* --- Main Content Area --- */}
             {/*
               `flex-1`: Takes remaining space.
               `transition-all`: Smooths resizing when SidePanel width changes.
             */}
             <main className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
                
                 {/* Chat Content */}
                 <div className="flex-1 overflow-y-auto py-2 px-4">
                     {children}
                 </div>
             </main>
         </div>
     );
 }