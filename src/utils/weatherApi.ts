import { WeatherData } from '../types';

export interface LocationSuggestion {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
}

const WMO_CODE_MAP: Record<number, { condition: string; isRain: boolean }> = {
  0: { condition: 'Clear Sky', isRain: false },
  1: { condition: 'Mainly Clear', isRain: false },
  2: { condition: 'Partly Cloudy', isRain: false },
  3: { condition: 'Overcast', isRain: false },
  45: { condition: 'Foggy', isRain: false },
  48: { condition: 'Depositing Rime Fog', isRain: false },
  51: { condition: 'Light Drizzle', isRain: true },
  53: { condition: 'Moderate Drizzle', isRain: true },
  55: { condition: 'Dense Drizzle', isRain: true },
  61: { condition: 'Slight Rain', isRain: true },
  63: { condition: 'Moderate Rain', isRain: true },
  65: { condition: 'Heavy Rain', isRain: true },
  71: { condition: 'Slight Snow', isRain: true },
  73: { condition: 'Moderate Snow', isRain: true },
  75: { condition: 'Heavy Snow', isRain: true },
  77: { condition: 'Snow Grains', isRain: true },
  80: { condition: 'Slight Rain Showers', isRain: true },
  81: { condition: 'Moderate Rain Showers', isRain: true },
  82: { condition: 'Violent Rain Showers', isRain: true },
  95: { condition: 'Thunderstorm', isRain: true },
  96: { condition: 'Thunderstorm with Slight Hail', isRain: true },
  99: { condition: 'Thunderstorm with Heavy Hail', isRain: true },
};

export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length < 2) return [];

  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      trimmedQuery
    )}&count=8&language=en&format=json`
  );
  if (!response.ok) throw new Error('Location search unavailable');

  const data = await response.json();
  return (data.results ?? []).map((result: any) => ({
    id: result.id,
    name: result.name,
    admin1: result.admin1,
    country: result.country,
    countryCode: result.country_code,
    latitude: result.latitude,
    longitude: result.longitude,
  }));
}

const formatLocationName = (location: LocationSuggestion) => {
  const region = location.admin1 && location.admin1 !== location.name
    ? location.admin1
    : location.countryCode?.toUpperCase() || location.country;
  return [location.name, region].filter(Boolean).join(', ');
};

async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (!response.ok) return 'Current location';
    const data = await response.json();
    const city = data.city || data.locality || data.principalSubdivision;
    const countryCode = data.countryCode?.toUpperCase();
    return [city, countryCode].filter(Boolean).join(', ') || 'Current location';
  } catch {
    return 'Current location';
  }
}

async function getApproximateLocation() {
  const response = await fetch('https://ipwho.is/');
  if (!response.ok) throw new Error('Approximate location unavailable');
  const data = await response.json();
  if (!data.success || typeof data.latitude !== 'number' || typeof data.longitude !== 'number') {
    throw new Error('Approximate location unavailable');
  }
  return {
    latitude: data.latitude as number,
    longitude: data.longitude as number,
    cityName: [data.city, data.country_code?.toUpperCase()].filter(Boolean).join(', '),
  };
}

export async function fetchWeather(
  useGPS: boolean,
  customLocation: string
): Promise<WeatherData> {
  let lat = 40.7128; // Default NY
  let lon = -74.006;
  let cityName = 'New York';

  // 1. Try Custom location if specified
  if (customLocation && customLocation.trim().length > 0) {
    const [location] = await searchLocations(customLocation);
    if (!location) throw new Error(`Location not found: ${customLocation}`);
    lat = location.latitude;
    lon = location.longitude;
    cityName = formatLocationName(location);
  } else if (useGPS && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    // 2. Try GPS
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 7000,
          maximumAge: 600000,
        });
      });
      lat = pos.coords.latitude;
      lon = pos.coords.longitude;
      cityName = await reverseGeocode(lat, lon);
    } catch {
      const approximateLocation = await getApproximateLocation();
      lat = approximateLocation.latitude;
      lon = approximateLocation.longitude;
      cityName = approximateLocation.cityName || 'Approximate location';
    }
  }

  // 3. Fetch current weather from Open-Meteo
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Weather service unavailable');
  }

  const data = await res.json();
  const current = data.current;
  const daily = data.daily;
  const code = current.weather_code ?? 0;
  const conditionInfo = WMO_CODE_MAP[code] || { condition: 'Clear Sky', isRain: false };

  return {
    city: cityName,
    temperature: Math.round(current.temperature_2m),
    condition: conditionInfo.condition,
    conditionCode: code,
    humidity: Math.round(current.relative_humidity_2m),
    windSpeed: Math.round(current.wind_speed_10m),
    feelsLike: Math.round(current.apparent_temperature),
    minTemp: Math.round(daily?.temperature_2m_min?.[0] ?? current.temperature_2m - 4),
    maxTemp: Math.round(daily?.temperature_2m_max?.[0] ?? current.temperature_2m + 4),
    isDay: Boolean(current.is_day),
    lastUpdated: Date.now(),
  };
}
