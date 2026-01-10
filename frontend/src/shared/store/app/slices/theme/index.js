export const createThemeSlice = (set) => ({
  theme: localStorage.getItem('theme') || 'dark',
  settings: {
    notifications: true,
    emailUpdates: true,
    marketingEmails: false,
  },

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      return { theme: newTheme };
    }),

  updateSettings: (updates) =>
    set((state) => ({
      settings: { ...state.settings, ...updates },
    })),
});
