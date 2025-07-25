// stores/useAppStore.ts
import { create } from "zustand";

interface AppState {
  isLoading: boolean;
  setLoading: (val: boolean) => void;

  token: string | null;
  setToken: (token: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isLoading: false,
  setLoading: (val) => set({ isLoading: val }),

  token: null,
  setToken: (token) => set({ token }),
}));
