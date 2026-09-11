import React, { useEffect, useState } from 'react';
import { AppSettings } from '../types';

interface ClockWidgetProps {
  settings: AppSettings;
  onUpdateCustomText: (text: string) => void;
  onUpdateUserName: (name: string) => void;
}

export const ClockWidget: React.FC<ClockWidgetProps> = ({
  settings,
  onUpdateCustomText,
  onUpdateUserName,
}) => {
  const [time, setTime] = useState(new Date());
  const [isEditingUserText, setIsEditingUserText] = useState(false);
  const [userTextDraft, setUserTextDraft] = useState(settings.customText);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(settings.userName);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setUserTextDraft(settings.customText);
  }, [settings.customText]);

  useEffect(() => {
    setNameDraft(settings.userName);
  }, [settings.userName]);

  if (!settings.showClock) {
    return null;
  }

  // Calculate analog hand angles
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;

  // Greeting determination
  let greetingWord = 'Hello';
  if (hours >= 4 && hours < 12) greetingWord = 'Good morning';
  else if (hours >= 12 && hours < 17) greetingWord = 'Good afternoon';
  else if (hours >= 17 && hours < 22) greetingWord = 'Good evening';
  else greetingWord = 'Good night';

  // Digital time formatting
  let displayHours = hours;
  let ampm = '';
  if (settings.is12Hour) {
    ampm = hours >= 12 ? 'PM' : 'AM';
    displayHours = hours % 12 || 12;
  }
  const formattedHours = String(displayHours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  // Dedicated 12-hour digital time for analog clock sub-display
  const hours12 = hours % 12 || 12;
  const formatted12Hours = String(hours12).padStart(2, '0');
  const ampm12 = hours >= 12 ? 'PM' : 'AM';

  // Date formatting
  const formattedDate = time.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const handleSaveText = () => {
    setIsEditingUserText(false);
    onUpdateCustomText(userTextDraft.trim() || 'Click here to edit text');
  };

  const handleSaveName = () => {
    setIsEditingName(false);
    onUpdateUserName(nameDraft.trim() || 'Friend');
  };

  return (
    <div
      id="clock-widget-container"
      className="flex flex-col items-center md:items-start justify-center select-none"
    >
      {/* Clock display */}
      {settings.clockType === 'analog' ? (
        <>
          <div
            id="analogClock"
          className="glass-surface relative w-36 h-36 sm:w-44 sm:h-44 rounded-full border-4 border-[var(--md-sys-color-outline)] shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105"
        >
          {/* Hour tick marks */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
            (deg, index) => {
              const isMajor = index % 3 === 0;
              return (
                <div
                  key={deg}
                  className="absolute w-full h-full flex justify-center pt-2 pointer-events-none"
                  style={{ transform: `rotate(${deg}deg)` }}
                >
                  <div
                    className={`rounded-full ${
                      isMajor
                        ? 'w-1.5 h-3.5 bg-[var(--md-sys-color-primary)]'
                        : 'w-1 h-2 bg-[var(--md-sys-color-outline)]'
                    }`}
                  />
                </div>
              );
            }
          )}

          {/* Hour Hand */}
          <div
            id="hour"
            className="absolute w-2 h-14 sm:h-16 rounded-full bg-[var(--md-sys-color-on-surface)] origin-bottom transition-transform duration-150 shadow-sm"
            style={{
              bottom: '50%',
              transform: `rotate(${hourDeg}deg)`,
            }}
          />

          {/* Minute Hand */}
          <div
            id="minute"
            className="absolute w-1.5 h-20 sm:h-22 rounded-full bg-[var(--md-sys-color-on-surface-variant)] origin-bottom transition-transform duration-150 shadow-sm"
            style={{
              bottom: '50%',
              transform: `rotate(${minuteDeg}deg)`,
            }}
          />

          {/* Second Hand */}
          <div
            id="second"
            className="absolute w-0.5 h-22 sm:h-24 rounded-full bg-[var(--md-sys-color-accent-dark)] origin-bottom shadow"
            style={{
              bottom: '50%',
              transform: `rotate(${secondDeg}deg)`,
            }}
          />

          {/* Center Hub */}
          <div className="absolute w-4 h-4 rounded-full bg-[var(--md-sys-color-primary)] border-2 border-white shadow-md z-10" />
        </div>

        {/* 12-hr Digital Time including seconds below analog clock */}
        <div
          id="analog-digital-time"
          className="glass-surface mt-2.5 px-3.5 py-1 rounded-2xl border border-[var(--md-sys-color-outline)]/40 shadow-xs flex items-center gap-1.5 text-sm sm:text-base font-bold text-[var(--md-sys-color-on-surface)] tracking-wide"
        >
          <span>
            {formatted12Hours}:{formattedMinutes}:{formattedSeconds}
          </span>
          <span className="text-[11px] font-semibold text-[var(--md-sys-color-primary)]">
            {ampm12}
          </span>
        </div>
        </>
      ) : (
        <div
          id="digitalClock"
          className="flex items-baseline gap-2 font-bold tracking-tight text-[var(--md-sys-color-on-surface)]"
        >
          <span className="text-5xl sm:text-6xl md:text-7xl font-black drop-shadow-sm">
            {formattedHours}:{formattedMinutes}
          </span>
          {settings.showSeconds && (
            <span className="text-2xl sm:text-3xl text-[var(--md-sys-color-primary)] font-semibold">
              :{formattedSeconds}
            </span>
          )}
          {settings.is12Hour && (
            <span className="ml-1 text-sm sm:text-base font-semibold px-2 py-0.5 rounded-lg bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] self-center">
              {ampm}
            </span>
          )}
        </div>
      )}

      {/* Greeting */}
      {settings.showGreeting && (
        <div
          id="greeting-text"
          className="mt-3 text-lg sm:text-xl font-medium text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5"
        >
          <span>{greetingWord},</span>
          {isEditingName ? (
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              autoFocus
              className="px-2 py-0.5 rounded-lg bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-primary)] font-semibold border border-[var(--md-sys-color-primary)] outline-none text-base"
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="font-semibold text-[var(--md-sys-color-primary)] hover:underline cursor-pointer"
              title="Click to edit name"
            >
              {settings.userName || 'Friend'}
            </button>
          )}
        </div>
      )}

      {/* Date Pill */}
      <div
        id="date"
        className="glass-surface mt-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-medium tracking-wide text-[var(--md-sys-color-on-surface-variant)] shadow-sm border border-[var(--md-sys-color-outline)]/40"
      >
        {formattedDate}
      </div>

      {/* Customizable Text / Affirmation */}
      {settings.showCustomText && (
        <div className="mt-2 text-center max-w-md">
          {isEditingUserText ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={userTextDraft}
                onChange={(e) => setUserTextDraft(e.target.value)}
                onBlur={handleSaveText}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveText()}
                autoFocus
                className="w-64 sm:w-80 px-3 py-1 text-center rounded-xl bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] text-sm border border-[var(--md-sys-color-primary)] outline-none shadow-inner"
              />
            </div>
          ) : (
            <p
              id="userText"
              onClick={() => setIsEditingUserText(true)}
              title="Click to customize text"
              className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] cursor-pointer transition-colors px-3 py-0.5 rounded-lg hover:bg-[var(--md-sys-color-hover-tint)]"
            >
              {settings.customText || 'Click here to edit text'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
