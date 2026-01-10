export const createUserSlice = (set, get) => ({
  user: null,
  company: null,

  setUser: (user) => set({ user }),
  setCompany: (company) => set({ company }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  clearUser: () => set({ user: null, company: null }),
});
