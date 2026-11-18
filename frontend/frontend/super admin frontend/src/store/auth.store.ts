
import { create } from "zustand";
import type { AuthUser } from "../types/auth.types";

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;

  setUser: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
    }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}));
