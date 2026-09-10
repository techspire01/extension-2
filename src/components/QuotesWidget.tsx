import React, { useState } from 'react';
import { Quote, RefreshCw } from 'lucide-react';
import { MOTIVATIONAL_QUOTES } from '../data/defaultData';
import { AppSettings } from '../types';

interface QuotesWidgetProps {
  settings: AppSettings;
}

export const QuotesWidget: React.FC<QuotesWidgetProps> = ({ settings }) => {
  const [quoteIndex, setQuoteIndex] = useState(() => {
    if (settings.dailyQuoteOnly) {
      // Pick quote based on day of year
      const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
          1000 /
          60 /
          60 /
          24
      );
      return dayOfYear % MOTIVATIONAL_QUOTES.length;
    }
    return Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  });

  const [isRotating, setIsRotating] = useState(false);

  if (!settings.showQuotes) {
    return null;
  }

  const currentQuote = MOTIVATIONAL_QUOTES[quoteIndex] || MOTIVATIONAL_QUOTES[0];

  const handleNextQuote = () => {
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 300);
    setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
  };

  return (
    <div
      id="motivationalQuotesCont"
      className="group relative max-w-xl mx-auto my-3 px-6 py-2 rounded-2xl text-center select-none"
    >
      <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] italic">
        <Quote className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)] shrink-0 inline-block opacity-70" />
        <span>"{currentQuote.quote}"</span>
        <span className="not-italic text-xs font-semibold text-[var(--md-sys-color-primary)]">
          — {currentQuote.author}
        </span>

        {!settings.dailyQuoteOnly && (
          <button
            onClick={handleNextQuote}
            title="Next quote"
            className="opacity-0 group-hover:opacity-100 p-1 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] transition-all cursor-pointer"
          >
            <RefreshCw
              className={`w-3 h-3 ${isRotating ? 'animate-spin' : ''}`}
            />
          </button>
        )}
      </div>
    </div>
  );
};
