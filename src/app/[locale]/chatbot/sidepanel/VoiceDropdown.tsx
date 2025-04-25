// src/components/layout/sidepanel/VoiceDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import { PrebuiltVoice } from '@/src/app/[locale]/chatbot/lib/live-chat.types';
import { ChevronDown } from 'lucide-react';

interface VoiceDropdownProps {
    currentVoice: PrebuiltVoice;
    availableVoices: PrebuiltVoice[];
    onVoiceChange: (voice: PrebuiltVoice) => void;
    disabled: boolean; // Controlled by parent logic
}

const VoiceDropdown: React.FC<VoiceDropdownProps> = ({
    currentVoice,
    availableVoices,
    onVoiceChange,
    disabled,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleSelect = (voice: PrebuiltVoice) => {
        onVoiceChange(voice);
        setIsOpen(false);
    };

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div> {/* No transition needed here, parent handles visibility */}
            <label id="voice-select-label" className="mb-2 block text-sm font-medium text-gray-700"> Voice </label>
            <div ref={dropdownRef} className="relative">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    aria-labelledby="voice-select-label"
                >
                    <span className="block truncate text-gray-900">{currentVoice}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                        <ChevronDown
                            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                        />
                    </span>
                </button>

                {isOpen && (
                    <div
                        role="listbox"
                        aria-labelledby="voice-select-label"
                        className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                    >
                        {availableVoices.map((voice) => (
                            <button
                                key={voice}
                                type="button"
                                role="option"
                                aria-selected={currentVoice === voice}
                                onClick={() => handleSelect(voice)}
                                disabled={disabled} // Keep disabled state consistent
                                className={`relative w-full cursor-default select-none py-2 pl-3 pr-9 text-left hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 ${currentVoice === voice ? 'bg-blue-50 font-semibold text-blue-700' : 'text-gray-900'
                                    }`}
                            >
                                <span className={`block truncate ${currentVoice === voice ? 'font-semibold' : 'font-normal'}`}>
                                    {voice}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceDropdown;