import { ThemeSettings } from '../types';

const THEME_KEY = 'edubuddy_theme';

export const saveTheme = (theme: ThemeSettings) => {
  localStorage.setItem(THEME_KEY, JSON.stringify(theme));
};

export const getTheme = (): ThemeSettings => {
  const themeJson = localStorage.getItem(THEME_KEY);
  if (!themeJson) return { accentColor: 'indigo', isDarkMode: false };
  try {
    return JSON.parse(themeJson);
  } catch (error) {
    console.error('Error parsing theme from localStorage:', error);
    return { accentColor: 'indigo', isDarkMode: false };
  }
};
