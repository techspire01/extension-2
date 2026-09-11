import React, { useEffect, useState } from 'react';
import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudLightning,
  Snowflake,
  Wind,
  Droplets,
  RotateCw,
  MapPin,
} from 'lucide-react';
import { AppSettings, WeatherData } from '../types';
import { fetchWeather } from '../utils/weatherApi';

interface WeatherWidgetProps {
  settings: AppSettings;
  onOpenSettingsWeather?: () => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  settings,
  onOpenSettingsWeather,
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(settings.useGPS, settings.customLocation);
      setWeather(data);
    } catch {
      setError('Weather info currently unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!settings.showWeather) return;
    const delay = !settings.useGPS && settings.customLocation ? 600 : 0;
    const timeoutId = window.setTimeout(loadWeather, delay);
    return () => window.clearTimeout(timeoutId);
  }, [settings.showWeather, settings.useGPS, settings.customLocation]);

  if (!settings.showWeather) {
    return null;
  }

  // Convert temp based on settings.tempUnit
  const formatTemp = (celsius: number) => {
    if (settings.tempUnit === 'F') {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${celsius}°C`;
  };

  const getWeatherIcon = (code: number, isDay: boolean) => {
    if (code === 0 || code === 1) {
      return isDay ? (
        <Sun className="w-6 h-6 text-amber-500 animate-spin-slow" />
      ) : (
        <CloudSun className="w-6 h-6 text-indigo-400" />
      );
    }
    if (code === 2 || code === 3) {
      return <CloudSun className="w-6 h-6 text-sky-400" />;
    }
    if (code >= 51 && code <= 65) {
      return <CloudRain className="w-6 h-6 text-blue-400" />;
    }
    if (code >= 71 && code <= 77) {
      return <Snowflake className="w-6 h-6 text-cyan-300" />;
    }
    if (code >= 95) {
      return <CloudLightning className="w-6 h-6 text-yellow-500" />;
    }
    return <Cloud className="w-6 h-6 text-slate-400" />;
  };

  // If Minimal pill only
  if (settings.weatherCardOnly && weather) {
    return (
      <div
        id="hideWeather"
        className="glass-surface flex items-center gap-2 px-3.5 py-1.5 rounded-full shadow-sm border border-[var(--md-sys-color-outline)]/40 text-sm font-medium text-[var(--md-sys-color-on-surface)] cursor-pointer hover:shadow transition-all"
        onClick={onOpenSettingsWeather}
        title={`${weather.city}: ${weather.condition}`}
      >
        {getWeatherIcon(weather.conditionCode, weather.isDay)}
        <span className="font-bold text-[var(--md-sys-color-primary)]">
          {formatTemp(weather.temperature)}
        </span>
        <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] hidden sm:inline">
          {weather.city}
        </span>
      </div>
    );
  }

  return (
    <div
      id="hideWeather"
      className="glass-surface p-4 rounded-3xl shadow-md border border-[var(--md-sys-color-outline)]/40 text-[var(--md-sys-color-on-surface)] transition-all duration-200 hover:shadow-lg w-full max-w-xs"
    >
      {loading && !weather ? (
        <div className="flex items-center justify-center py-6 gap-2 text-sm text-[var(--md-sys-color-on-surface-variant)]">
          <RotateCw className="w-4 h-4 animate-spin text-[var(--md-sys-color-primary)]" />
          <span>Updating weather...</span>
        </div>
      ) : error && !weather ? (
        <div className="flex flex-col items-center py-3 text-center">
          <p className="text-xs text-red-500 mb-2">{error}</p>
          <button
            onClick={loadWeather}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : weather ? (
        <div className="space-y-2.5">
          {/* Top header with city & refresh */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] truncate">
              <MapPin className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)] shrink-0" />
              <span className="truncate">{weather.city}</span>
            </div>
            <button
              onClick={loadWeather}
              title="Refresh weather"
              className="p-1 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-hover-tint)] transition-colors cursor-pointer"
            >
              <RotateCw
                className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
              />
            </button>
          </div>

          {/* Main temp and condition */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-primary-container)] flex items-center justify-center shadow-inner">
                {getWeatherIcon(weather.conditionCode, weather.isDay)}
              </div>
              <div>
                <div
                  id="temp"
                  className="text-2xl sm:text-3xl font-black text-[var(--md-sys-color-on-surface)] leading-none tracking-tight"
                >
                  {formatTemp(weather.temperature)}
                </div>
                <div
                  id="conditionText"
                  className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] mt-1"
                >
                  {weather.condition}
                </div>
              </div>
            </div>

            {/* Feels like or Min-Max */}
            <div className="text-right">
              {settings.showMinMaxTemp ? (
                <div className="text-xs font-semibold text-[var(--md-sys-color-on-surface)]">
                  <div className="text-emerald-600 dark:text-emerald-400">
                    H: {formatTemp(weather.maxTemp)}
                  </div>
                  <div className="text-sky-600 dark:text-sky-400">
                    L: {formatTemp(weather.minTemp)}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                  Feels like
                  <div className="font-bold text-[var(--md-sys-color-on-surface)]">
                    {formatTemp(weather.feelsLike)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Humidity Slider & Wind */}
          <div className="pt-2 border-t border-[var(--md-sys-color-outline)]/30 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3 text-sky-500" />
                Humidity
              </span>
              <span id="humidityLevel" className="font-semibold">
                {weather.humidity}%
              </span>
            </div>
            {/* Slider bar */}
            <div
              id="slider"
              className="w-full h-1.5 rounded-full bg-[var(--md-sys-color-outline)]/30 overflow-hidden"
            >
              <div
                className="h-full rounded-full bg-[var(--md-sys-color-primary)] transition-all duration-500"
                style={{ width: `${weather.humidity}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[var(--md-sys-color-on-surface-variant)] pt-0.5">
              <span className="flex items-center gap-1">
                <Wind className="w-3 h-3 text-teal-500" />
                Wind
              </span>
              <span className="font-semibold">{weather.windSpeed} km/h</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
