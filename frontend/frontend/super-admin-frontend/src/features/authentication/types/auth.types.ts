export interface LoginCredentials {
  email: string;
  password: string;
}

export type UserRole = "super_admin" | "school_main_admin";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface LoginApiResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    accessToken: string;
  };
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: AuthUser, accessToken: string) => void;
  clearAuth: () => void;
}