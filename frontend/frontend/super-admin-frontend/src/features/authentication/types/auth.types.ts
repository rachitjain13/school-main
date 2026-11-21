
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  accessToken?: string;
  user: AuthUser;
  message?: string;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (
    user: AuthUser,
    accessToken: string | null
  ) => void;

  clearAuth: () => void;
}
