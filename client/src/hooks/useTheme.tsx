
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check if theme is stored in localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    
    // Check if there's a preferred color scheme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Return the stored theme if available, otherwise use system preference
    return savedTheme || (prefersDark ? 'dark' : 'light');
  });

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem('theme', theme);
    
    // Apply theme to document root and body
    const root = document.documentElement;
    const body = document.body;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return { theme, setTheme, toggleTheme };
}
