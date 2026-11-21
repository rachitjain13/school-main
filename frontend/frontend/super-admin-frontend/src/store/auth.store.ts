
import { create } from "zustand";

import type {
  AuthState,
  AuthUser,
} from "../features/authentication/types/auth.types";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,

  setAuth: (
    user: AuthUser,
    accessToken: string | null
  ) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
    }),

  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));

