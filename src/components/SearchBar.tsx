import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Mic,
  MicOff,
  ChevronDown,
  ArrowRight,
  History,
  TrendingUp,
} from 'lucide-react';
import { AppSettings, SearchEngineKey } from '../types';
import { SEARCH_ENGINES } from '../data/defaultData';

interface SearchBarProps {
  settings: AppSettings;
  onUpdateEngine: (engine: SearchEngineKey) => void;
}

// Built-in common queries for instant suggestion feedback
const POPULAR_TOPICS = [
  'Material You design guidelines',
  'GitHub trending repositories',
  'Latest AI model announcements',
  'Weather forecast this week',
  'React 19 release notes',
  'Tailwind CSS v4 documentation',
  'Open source web extensions',
];

export const SearchBar: React.FC<SearchBarProps> = ({
  settings,
  onUpdateEngine,
}) => {
  const [query, setQuery] = useState('');
  const [selectedEngine, setSelectedEngine] = useState<SearchEngineKey>(
    settings.defaultSearchEngine || 'google'
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sync with settings default
  useEffect(() => {
    setSelectedEngine(settings.defaultSearchEngine);
  }, [settings.defaultSearchEngine]);

  // Click outside to close dropdown and suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions when typing
  useEffect(() => {
    if (!settings.showSuggestions || !query.trim()) {
      setFilteredSuggestions([]);
      return;
    }

    const matches = POPULAR_TOPICS.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    );
    // Also include dynamic query extension suggestions
    const dynamic = [
      `${query.trim()} tutorial`,
      `${query.trim()} official website`,
      `${query.trim()} vs alternatives`,
    ];

    setFilteredSuggestions(Array.from(new Set([...matches, ...dynamic])).slice(0, 5));
  }, [query, settings.showSuggestions]);

  // Voice Search setup
  const toggleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setQuery(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleExecuteSearch = (searchQuery: string = query) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    // Check if input is a valid direct URL
    const isUrl =
      /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/.test(trimmed) &&
      !trimmed.includes(' ');

    if (isUrl) {
      const finalUrl = trimmed.startsWith('http')
        ? trimmed
        : `https://${trimmed}`;
      window.location.href = finalUrl;
      return;
    }

    const engineObj = SEARCH_ENGINES[selectedEngine] || SEARCH_ENGINES.google;
    window.location.href = `${engineObj.searchUrl}${encodeURIComponent(trimmed)}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (
        selectedSuggestionIndex >= 0 &&
        filteredSuggestions[selectedSuggestionIndex]
      ) {
        handleExecuteSearch(filteredSuggestions[selectedSuggestionIndex]);
      } else {
        handleExecuteSearch();
      }
      setShowSuggestions(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setIsDropdownOpen(false);
    }
  };

  const currentEngineConfig =
    SEARCH_ENGINES[selectedEngine] || SEARCH_ENGINES.google;

  return (
    <div id="searchbar-section" className="w-full max-w-2xl mx-auto z-10 px-4">
      {/* Search Input Bar */}
      <div
        id="searchbar"
        className="glass-surface relative flex items-center w-full h-14 sm:h-16 px-3 rounded-full border border-[var(--md-sys-color-outline)] shadow-lg hover:shadow-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-[var(--md-sys-color-primary)] focus-within:border-transparent"
      >
        {/* Search Engine Selector Dropdown */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            id="default-dropdown-item"
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-[var(--md-sys-color-hover-tint)] text-[var(--md-sys-color-primary)] font-medium text-sm transition-colors cursor-pointer"
            title="Change search engine"
          >
            <span className="font-semibold text-xs sm:text-sm">
              {currentEngineConfig.name}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Engine Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute left-0 mt-3 w-48 py-2 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] shadow-2xl border border-[var(--md-sys-color-outline)] z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1 text-[11px] font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                Select Engine
              </div>
              {(Object.keys(SEARCH_ENGINES) as SearchEngineKey[]).map((key) => {
                const item = SEARCH_ENGINES[key];
                const isSelected = selectedEngine === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedEngine(key);
                      onUpdateEngine(key);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-semibold'
                        : 'text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-hover-tint)]'
                    }`}
                  >
                    <span>{item.name}</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-primary)]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Input */}
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
            setSelectedSuggestionIndex(-1);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={currentEngineConfig.placeholder}
          className="flex-1 min-w-0 bg-transparent px-2 sm:px-3 text-sm sm:text-base text-[var(--md-sys-color-on-surface)] placeholder-[var(--md-sys-color-on-surface-variant)]/70 outline-none font-normal"
        />

        {/* Action icons: Voice, Search */}
        <div className="flex items-center gap-0.5 sm:gap-2 pr-1 shrink-0">
          {/* Voice Search */}
          {settings.showVoiceSearch && (
            <button
              id="micIcon"
              type="button"
              onClick={toggleVoiceSearch}
              title={isListening ? 'Listening...' : 'Voice Search'}
              className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-md'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-hover-tint)]'
              }`}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Enter / Search Button */}
          <button
            id="enterBtn"
            type="button"
            onClick={() => handleExecuteSearch()}
            title="Search"
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="sr-only">Search</span>
          </button>
        </div>

        {/* Suggestions Autocomplete Panel */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            id="resultBox"
            className="glass-surface-high absolute top-full left-0 right-0 mt-2 py-2 rounded-3xl border border-[var(--md-sys-color-outline)] shadow-2xl z-40 overflow-hidden"
          >
            <div className="px-4 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">
              <TrendingUp className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
              <span>Suggestions</span>
            </div>
            {filteredSuggestions.map((item, idx) => (
              <div
                key={item}
                onClick={() => {
                  setQuery(item);
                  handleExecuteSearch(item);
                  setShowSuggestions(false);
                }}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  idx === selectedSuggestionIndex
                    ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-medium'
                    : 'text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-hover-tint)]'
                }`}
              >
                <Search className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)]" />
                <span className="flex-1 truncate">{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
