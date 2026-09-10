import { ThemeColorName, ThemeMode } from '../types';

export interface MaterialPalette {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  surface: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
  accentLight: string;
  accentDark: string;
  hoverTint: string;
}

export const PRESET_THEMES: Record<
  Exclude<ThemeColorName, 'custom'>,
  { light: MaterialPalette; dark: MaterialPalette; name: string; hex: string }
> = {
  blue: {
    name: 'Ocean Blue',
    hex: '#4382ec',
    light: {
      primary: '#1d63d8',
      onPrimary: '#ffffff',
      primaryContainer: '#dbe8fe',
      onPrimaryContainer: '#0d3274',
      surface: '#f3f7fd',
      surfaceContainer: '#ffffff',
      surfaceContainerHigh: '#e5eeff',
      onSurface: '#192639',
      onSurfaceVariant: '#4d5d74',
      outline: '#cbd9ee',
      accentLight: '#bbd6fd',
      accentDark: '#3569b2',
      hoverTint: 'rgba(29, 99, 216, 0.08)',
    },
    dark: {
      primary: '#9ec4ff',
      onPrimary: '#002f6c',
      primaryContainer: '#004396',
      onPrimaryContainer: '#d7e3ff',
      surface: '#0f1724',
      surfaceContainer: '#172234',
      surfaceContainerHigh: '#213047',
      onSurface: '#e1e8f5',
      onSurfaceVariant: '#a0afc5',
      outline: '#3a4b64',
      accentLight: '#21385c',
      accentDark: '#4382ec',
      hoverTint: 'rgba(158, 196, 255, 0.12)',
    },
  },
  red: {
    name: 'Crimson Red',
    hex: '#ec4343',
    light: {
      primary: '#ba1a1a',
      onPrimary: '#ffffff',
      primaryContainer: '#ffdad6',
      onPrimaryContainer: '#410002',
      surface: '#fef3f3',
      surfaceContainer: '#ffffff',
      surfaceContainerHigh: '#ffe8e8',
      onSurface: '#351c1c',
      onSurfaceVariant: '#684545',
      outline: '#ecc9c9',
      accentLight: '#fdbdbd',
      accentDark: '#b23535',
      hoverTint: 'rgba(186, 26, 26, 0.08)',
    },
    dark: {
      primary: '#ffb4ab',
      onPrimary: '#690005',
      primaryContainer: '#93000a',
      onPrimaryContainer: '#ffdad6',
      surface: '#1c1111',
      surfaceContainer: '#281717',
      surfaceContainerHigh: '#372020',
      onSurface: '#f5dede',
      onSurfaceVariant: '#cbb6b6',
      outline: '#5b3a3a',
      accentLight: '#471d1d',
      accentDark: '#ec4343',
      hoverTint: 'rgba(255, 180, 171, 0.12)',
    },
  },
  yellow: {
    name: 'Sun Yellow',
    hex: '#d1a93d',
    light: {
      primary: '#765b00',
      onPrimary: '#ffffff',
      primaryContainer: '#ffe086',
      onPrimaryContainer: '#241a00',
      surface: '#fefcf0',
      surfaceContainer: '#ffffff',
      surfaceContainerHigh: '#fef7cf',
      onSurface: '#2e2714',
      onSurfaceVariant: '#655e4b',
      outline: '#e5dcc0',
      accentLight: '#ffed80',
      accentDark: '#ae9502',
      hoverTint: 'rgba(118, 91, 0, 0.08)',
    },
    dark: {
      primary: '#f3c243',
      onPrimary: '#3e2e00',
      primaryContainer: '#594400',
      onPrimaryContainer: '#ffe086',
      surface: '#18150d',
      surfaceContainer: '#241f12',
      surfaceContainerHigh: '#332c18',
      onSurface: '#f1e7cb',
      onSurfaceVariant: '#c7bfa9',
      outline: '#534931',
      accentLight: '#403310',
      accentDark: '#d1a93d',
      hoverTint: 'rgba(243, 194, 67, 0.12)',
    },
  },
  green: {
    name: 'Forest Green',
    hex: '#5cba5c',
    light: {
      primary: '#1f6c2c',
      onPrimary: '#ffffff',
      primaryContainer: '#c5ecc7',
      onPrimaryContainer: '#002206',
      surface: '#f3fbf4',
      surfaceContainer: '#ffffff',
      surfaceContainerHigh: '#e1f4e3',
      onSurface: '#162b1a',
      onSurfaceVariant: '#4b614f',
      outline: '#c3dbca',
      accentLight: '#c7e4c7',
      accentDark: '#458245',
      hoverTint: 'rgba(31, 108, 44, 0.08)',
    },
    dark: {
      primary: '#8bd992',
      onPrimary: '#00390f',
      primaryContainer: '#005319',
      onPrimaryContainer: '#a6f5ad',
      surface: '#0f1811',
      surfaceContainer: '#162319',
      surfaceContainerHigh: '#1e3223',
      onSurface: '#dfede2',
      onSurfaceVariant: '#9eb4a3',
      outline: '#38503e',
      accentLight: '#183a21',
      accentDark: '#5cba5c',
      hoverTint: 'rgba(139, 217, 146, 0.12)',
    },
  },
  cyan: {
    name: 'Aqua Cyan',
    hex: '#09b2b4',
    light: {
      primary: '#00696e',
      onPrimary: '#ffffff',
      primaryContainer: '#9cf4fb',
      onPrimaryContainer: '#002022',
      surface: '#f0fbfb',
      surfaceContainer: '#ffffff',
      surfaceContainerHigh: '#def5f6',
      onSurface: '#102728',
      onSurfaceVariant: '#465f61',
      outline: '#bddbdb',
      accentLight: '#9cefef',
      accentDark: '#07787f',
      hoverTint: 'rgba(0, 105, 110, 0.08)',
    },
    dark: {
      primary: '#4ddad5',
      onPrimary: '#00373a',
      primaryContainer: '#004f53',
      onPrimaryContainer: '#9cf4fb',
      surface: '#0d1718',
      surfaceContainer: '#132324',
      surfaceContainerHigh: '#1c3233',
      onSurface: '#dcefee',
      onSurfaceVariant: '#9ab3b4',
      outline: '#334e50',
      accentLight: '#12393a',
      accentDark: '#09b2b4',
      hoverTint: 'rgba(77, 218, 213, 0.12)',
    },
  },
  pink: {
    name: 'Blossom Pink',
    hex: '#ec5e78',
    light: {
      primary: '#9c2443',
      onPrimary: '#ffffff',
      primaryContainer: '#ffd9df',
      onPrimaryContainer: '#3f0015',
      surface: '#fff2f5',
      surfaceContainer: '#ffffff',
      surfaceContainerHigh: '#ffe5eb',
      onSurface: '#341a20',
      onSurfaceVariant: '#68454c',
      outline: '#eac6cc',
      accentLight: '#f9c8d6',
      accentDark: '#b24b64',
      hoverTint: 'rgba(156, 36, 67, 0.08)',
    },
    dark: {
      primary: '#ffb1c1',
      onPrimary: '#5f0022',
      primaryContainer: '#7e0832',
      onPrimaryContainer: '#ffd9df',
      surface: '#1c1014',
      surfaceContainer: '#28161b',
      surfaceContainerHigh: '#371e25',
      onSurface: '#f5dee2',
      onSurfaceVariant: '#caa7af',
      outline: '#5a3740',
      accentLight: '#431924',
      accentDark: '#ec5e78',
      hoverTint: 'rgba(255, 177, 193, 0.12)',
    },
  },
  orange: {
    name: 'Sunset Orange',
    hex: '#ea8335',
    light: {
      primary: '#904d00',
      onPrimary: '#ffffff',
      primaryContainer: '#ffdcc2',
      onPrimaryContainer: '#2f1500',
      surface: '#fff6ef',
      surfaceContainer: '#ffffff',
      surfaceContainerHigh: '#ffe8d7',
      onSurface: '#332014',
      onSurfaceVariant: '#664e40',
      outline: '#e7ccbb',
      accentLight: '#ffd8b2',
      accentDark: '#b26d3e',
      hoverTint: 'rgba(144, 77, 0, 0.08)',
    },
    dark: {
      primary: '#ffb77c',
      onPrimary: '#4d2600',
      primaryContainer: '#6e3800',
      onPrimaryContainer: '#ffdcc2',
      surface: '#1b120c',
      surfaceContainer: '#281a11',
      surfaceContainerHigh: '#382417',
      onSurface: '#f3ded3',
      onSurfaceVariant: '#c8aea0',
      outline: '#593f31',
      accentLight: '#442310',
      accentDark: '#ea8335',
      hoverTint: 'rgba(255, 183, 124, 0.12)',
    },
  },
  purple: {
    name: 'Lavender Purple',
    hex: '#884de6',
    light: {
      primary: '#6b32b8',
      onPrimary: '#ffffff',
      primaryContainer: '#edd8ff',
      onPrimaryContainer: '#260058',
      surface: '#f9f3ff',
      surfaceContainer: '#ffffff',
      surfaceContainerHigh: '#f3e5ff',
      onSurface: '#241b31',
      onSurfaceVariant: '#5c526d',
      outline: '#d8c8ea',
      accentLight: '#e3d0ff',
      accentDark: '#622fa3',
      hoverTint: 'rgba(107, 50, 184, 0.08)',
    },
    dark: {
      primary: '#d6baff',
      onPrimary: '#3d007e',
      primaryContainer: '#54159f',
      onPrimaryContainer: '#edd8ff',
      surface: '#15101c',
      surfaceContainer: '#1f172a',
      surfaceContainerHigh: '#2b2039',
      onSurface: '#ece1f6',
      onSurfaceVariant: '#baa9cc',
      outline: '#4d3d61',
      accentLight: '#321952',
      accentDark: '#884de6',
      hoverTint: 'rgba(214, 186, 255, 0.12)',
    },
  },
  teal: {
    name: 'Mint Teal',
    hex: '#14b8a6',
    light: {
      primary: '#006a60',
      onPrimary: '#ffffff',
      primaryContainer: '#9ef2e6',
      onPrimaryContainer: '#00201c',
      surface: '#effaf8',
      surfaceContainer: '#ffffff',
      surfaceContainerHigh: '#dcf4ef',
      onSurface: '#122724',
      onSurfaceVariant: '#465f5b',
      outline: '#bddbd6',
      accentLight: '#a4ece1',
      accentDark: '#076b61',
      hoverTint: 'rgba(0, 106, 96, 0.08)',
    },
    dark: {
      primary: '#50dbcc',
      onPrimary: '#003731',
      primaryContainer: '#005048',
      onPrimaryContainer: '#9ef2e6',
      surface: '#0d1716',
      surfaceContainer: '#132321',
      surfaceContainerHigh: '#1c322f',
      onSurface: '#dcefed',
      onSurfaceVariant: '#9ab3ae',
      outline: '#334e4a',
      accentLight: '#113934',
      accentDark: '#14b8a6',
      hoverTint: 'rgba(80, 219, 204, 0.12)',
    },
  },
};

/**
 * Generate a dynamic Material 3 palette from any custom hex color.
 */
export function generateCustomPalette(hex: string, mode: 'light' | 'dark'): MaterialPalette {
  // Simple RGB extraction
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2) || '43', 16);
  const g = parseInt(cleanHex.substring(2, 4) || '82', 16);
  const b = parseInt(cleanHex.substring(4, 6) || 'ec', 16);

  if (mode === 'dark') {
    return {
      primary: `rgb(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)})`,
      onPrimary: '#000000',
      primaryContainer: `rgb(${Math.max(15, Math.floor(r * 0.4))}, ${Math.max(15, Math.floor(g * 0.4))}, ${Math.max(15, Math.floor(b * 0.4))})`,
      onPrimaryContainer: '#ffffff',
      surface: '#12151b',
      surfaceContainer: '#1a1f28',
      surfaceContainerHigh: '#242b38',
      onSurface: '#f0f3f8',
      onSurfaceVariant: '#a9b3c4',
      outline: '#384252',
      accentLight: `rgba(${r}, ${g}, ${b}, 0.25)`,
      accentDark: hex,
      hoverTint: `rgba(${r}, ${g}, ${b}, 0.15)`,
    };
  }

  return {
    primary: hex,
    onPrimary: '#ffffff',
    primaryContainer: `rgb(${Math.min(255, Math.floor(r * 0.3 + 180))}, ${Math.min(255, Math.floor(g * 0.3 + 180))}, ${Math.min(255, Math.floor(b * 0.3 + 180))})`,
    onPrimaryContainer: `rgb(${Math.max(0, Math.floor(r * 0.4))}, ${Math.max(0, Math.floor(g * 0.4))}, ${Math.max(0, Math.floor(b * 0.4))})`,
    surface: `rgb(${Math.min(255, Math.floor(r * 0.08 + 245))}, ${Math.min(255, Math.floor(g * 0.08 + 245))}, ${Math.min(255, Math.floor(b * 0.08 + 245))})`,
    surfaceContainer: '#ffffff',
    surfaceContainerHigh: `rgb(${Math.min(255, Math.floor(r * 0.15 + 230))}, ${Math.min(255, Math.floor(g * 0.15 + 230))}, ${Math.min(255, Math.floor(b * 0.15 + 230))})`,
    onSurface: '#19232d',
    onSurfaceVariant: '#4d5968',
    outline: `rgb(${Math.min(255, Math.floor(r * 0.3 + 200))}, ${Math.min(255, Math.floor(g * 0.3 + 200))}, ${Math.min(255, Math.floor(b * 0.3 + 200))})`,
    accentLight: `rgba(${r}, ${g}, ${b}, 0.2)`,
    accentDark: hex,
    hoverTint: `rgba(${r}, ${g}, ${b}, 0.08)`,
  };
}

export function getPalette(
  themeColor: ThemeColorName,
  customHex: string,
  mode: ThemeMode
): { palette: MaterialPalette; isDark: boolean } {
  const isDark =
    mode === 'dark' ||
    (mode === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (themeColor === 'custom') {
    return {
      palette: generateCustomPalette(customHex || '#4382ec', isDark ? 'dark' : 'light'),
      isDark,
    };
  }

  const preset = PRESET_THEMES[themeColor] || PRESET_THEMES.blue;
  return {
    palette: isDark ? preset.dark : preset.light,
    isDark,
  };
}

/**
 * Apply the Material You theme variables to document documentElement
 */
export function applyThemeVariables(
  themeColor: ThemeColorName,
  customHex: string,
  mode: ThemeMode,
  opacity: number = 0.95
) {
  if (typeof document === 'undefined') return;

  const { palette, isDark } = getPalette(themeColor, customHex, mode);
  const root = document.documentElement;

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Set CSS variables
  root.style.setProperty('--md-sys-color-primary', palette.primary);
  root.style.setProperty('--md-sys-color-on-primary', palette.onPrimary);
  root.style.setProperty('--md-sys-color-primary-container', palette.primaryContainer);
  root.style.setProperty('--md-sys-color-on-primary-container', palette.onPrimaryContainer);
  root.style.setProperty('--md-sys-color-surface', palette.surface);
  root.style.setProperty('--md-sys-color-surface-container', palette.surfaceContainer);
  root.style.setProperty('--md-sys-color-surface-container-high', palette.surfaceContainerHigh);
  root.style.setProperty('--md-sys-color-on-surface', palette.onSurface);
  root.style.setProperty('--md-sys-color-on-surface-variant', palette.onSurfaceVariant);
  root.style.setProperty('--md-sys-color-outline', palette.outline);
  root.style.setProperty('--md-sys-color-accent-light', palette.accentLight);
  root.style.setProperty('--md-sys-color-accent-dark', palette.accentDark);
  root.style.setProperty('--md-sys-color-hover-tint', palette.hoverTint);
  root.style.setProperty('--card-opacity', `${opacity}`);
}
