import { themes } from '../config/themes';

/**
 * Applies the CSS variables of the requested theme to the document root.
 * @param {string} themeId - The identifier of the theme (e.g., 'light', 'dark', 'ocean')
 */
export const applyTheme = (themeId) => {
  const theme = themes[themeId] || themes['light'];
  const root = document.documentElement;

  // Add the base class so any global specific targeting based on light/dark mode still works
  // Remove existing light/dark classes
  root.classList.remove('light', 'dark');
  root.classList.add(theme.type || 'light');

  // Inject CSS variables directly to :root
  Object.entries(theme.variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};
