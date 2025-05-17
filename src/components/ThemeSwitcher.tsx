// src/components/ThemeSwitcher.tsx
import React from 'react';
import { useTheme, Theme } from '../contexts/ThemeContext'; // Adjust path

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(event.target.value as Theme);
  };

  return (
    <div className="p-4">
      <label htmlFor="theme-select" className="block text-sm font-medium text-theme-text mr-2">
        Select Theme:
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={handleThemeChange}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-theme-secondary-1 focus:outline-none focus:ring-theme-primary-accent1 focus:border-theme-primary-accent1 sm:text-sm rounded-md bg-input-bg text-input-text"
      >
        <option value="default">Default Light</option>
        <option value="light-cyberpunk">Light Cyberpunk</option>
        {/* Add other themes here if any */}
      </select>
    </div>
  );
};

export default ThemeSwitcher;