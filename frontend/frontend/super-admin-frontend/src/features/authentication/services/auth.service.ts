import api from "../../../services/api";

import type {
  LoginApiResponse,
  LoginCredentials,
} from "../types/auth.types";

export async function loginSuperAdmin(
  credentials: LoginCredentials
) {
  const response = await api.post<LoginApiResponse>(
    "/auth/super-admin/login",
    credentials
  );

  if (!response.data.success || !response.data.data?.accessToken) {
    throw new Error(response.data.message || "Login failed");
  }

  return response.data.data;
}

export async function logoutSuperAdmin() {
  await api.post("/auth/logout");
}