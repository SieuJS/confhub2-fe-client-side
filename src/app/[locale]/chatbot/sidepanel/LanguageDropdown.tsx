// src/components/layout/sidepanel/LanguageDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Language, LanguageOption } from '@/src/app/[locale]/chatbot/lib/live-chat.types';
import { ChevronDown } from 'lucide-react';

interface LanguageDropdownProps {
    currentLanguage: Language;
    availableLanguages: LanguageOption[];
    onLanguageChange: (lang: Language) => void;
    disabled: boolean;
}

const getFlagUrl = (flagCode: string) => `/country_flags/${flagCode}.svg`;

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
    currentLanguage,
    availableLanguages,
    onLanguageChange,
    disabled,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedLanguage = availableLanguages.find(lang => lang.code === currentLanguage);

    const handleSelect = (langCode: Language) => {
        onLanguageChange(langCode);
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
        <div className="mb-6">
            <label id="language-select-label" className="mb-2 block text-sm font-medium text-gray-700">
                Language
            </label>
            <div ref={dropdownRef} className="relative">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    aria-labelledby="language-select-label"
                >
                    <span className="flex items-center">
                        {selectedLanguage ? (
                            <>
                                <Image
                                    src={getFlagUrl(selectedLanguage.flagCode)}
                                    alt={`${selectedLanguage.name} flag`}
                                    width={20}
                                    height={15}
                                    className="mr-2 h-auto w-[20px] flex-shrink-0 rounded-sm"
                                    loading="lazy"
                                />
                                <span className="block truncate text-gray-900">{selectedLanguage.name}</span>
                            </>
                        ) : (
                            <span className="block truncate text-gray-500">Select language...</span>
                        )}
                    </span>
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
                        aria-labelledby="language-select-label"
                        className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                    >
                        {availableLanguages.map((lang) => (
                            <button
                                key={lang.code}
                                type="button"
                                role="option"
                                aria-selected={currentLanguage === lang.code}
                                onClick={() => handleSelect(lang.code)}
                                disabled={disabled} // Keep disabled state consistent
                                className={`relative w-full cursor-default select-none py-2 pl-3 pr-9 text-left hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 ${currentLanguage === lang.code ? 'bg-blue-50 font-semibold text-blue-700' : 'text-gray-900'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <Image
                                        src={getFlagUrl(lang.flagCode)}
                                        alt={`${lang.name} flag`}
                                        width={20}
                                        height={15}
                                        className="mr-2 h-auto w-[20px] flex-shrink-0 rounded-sm"
                                        loading="lazy"
                                    />
                                    <span className={`block truncate ${currentLanguage === lang.code ? 'font-semibold' : 'font-normal'}`}>
                                        {lang.name}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LanguageDropdown;