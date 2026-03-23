import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeSettings, AccentColor } from '../types';
import { getTheme, saveTheme } from '../services/storage';

interface ThemeContextType {
  theme: ThemeSettings;
  updateTheme: (newTheme: ThemeSettings) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeSettings>(getTheme());

  useEffect(() => {
    // Apply theme settings to the document
    const root = window.document.documentElement;
    
    // Dark mode
    if (theme.isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Accent color
    root.setAttribute('data-theme', theme.accentColor);
    
    saveTheme(theme);
  }, [theme]);

  const updateTheme = (newTheme: ThemeSettings) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
