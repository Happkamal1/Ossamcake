import { createSlice } from '@reduxjs/toolkit';
import { themes } from '../../config/themes';
import { applyTheme } from '../../utils/applyTheme';

// Try to load persisted theme, fallback to light
const loadInitialTheme = () => {
  try {
    const savedTheme = localStorage.getItem('cake_theme');
    if (savedTheme && themes[savedTheme]) {
      return savedTheme;
    }
  } catch (e) {
    console.error("Could not read theme from localStorage", e);
  }
  return 'light';
};

const initialState = {
  activeTheme: loadInitialTheme(),
  availableThemes: Object.values(themes).map(theme => ({
    id: theme.id,
    name: theme.name,
    type: theme.type
  }))
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      const themeId = action.payload;
      if (themes[themeId]) {
        state.activeTheme = themeId;
        try {
          localStorage.setItem('cake_theme', themeId);
        } catch (e) {
          console.error("Could not save theme to localStorage", e);
        }
        // Immediately apply the theme when state changes
        applyTheme(themeId);
      }
    }
  }
});

export const { setTheme } = themeSlice.actions;

export default themeSlice.reducer;
