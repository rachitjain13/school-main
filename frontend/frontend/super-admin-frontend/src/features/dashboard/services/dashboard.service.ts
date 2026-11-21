
import api from "../../../services/api";
import { useAuthStore } from "../../../store/auth.store";

export type SchoolStatus =
  | "provisioning"
  | "provisioning_failed"
  | "admin_invited"
  | "onboarding"
  | "active"
  | "suspended"
  | "archived";

export interface DashboardSchool {
  _id: string;
  schoolId: string;
  schoolName: string;
  schoolType?: string;
  registrationNumber?: string;
  officialEmail?: string;
  address?: {
    city?: string;
    state?: string;
  };
  mainAdmin?: {
    fullName?: string;
    email?: string;
  };
  status: SchoolStatus;
  createdAt: string;
  updatedAt?: string;
}

interface SchoolsApiResponse {
  success: boolean;
  message: string;
  data: {
    schools: DashboardSchool[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export interface DashboardData {
  totalSchools: number;
  activeSchools: number;
  pendingOnboarding: number;
  suspendedSchools: number;
  recentSchools: DashboardSchool[];
}

const onboardingStatuses: SchoolStatus[] = [
  "provisioning",
  "provisioning_failed",
  "admin_invited",
  "onboarding",
];

async function getSchools(
  params: {
    page: number;
    limit: number;
    sortOrder: "asc" | "desc";
    status?: SchoolStatus;
  }
) {
  const accessToken = useAuthStore.getState().accessToken;

  if (!accessToken) {
    throw new Error("Your session has expired. Please log in again.");
  }

  const response = await api.get<SchoolsApiResponse>(
    "/super-admin/schools",
    {
      params,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.data?.success || !response.data?.data?.pagination) {
    throw new Error(
      response.data?.message || "Unable to retrieve school records."
    );
  }

  return response.data.data;
}

export async function getDashboardData(): Promise<DashboardData> {
  const [
    allSchools,
    activeSchools,
    suspendedSchools,
    ...onboardingResults
  ] = await Promise.all([
    getSchools({
      page: 1,
      limit: 5,
      sortOrder: "desc",
    }),

    getSchools({
      page: 1,
      limit: 1,
      sortOrder: "desc",
      status: "active",
    }),

    getSchools({
      page: 1,
      limit: 1,
      sortOrder: "desc",
      status: "suspended",
    }),

    ...onboardingStatuses.map((status) =>
      getSchools({
        page: 1,
        limit: 1,
        sortOrder: "desc",
        status,
      })
    ),
  ]);

  const pendingOnboarding = onboardingResults.reduce(
    (total, result) => total + result.pagination.total,
    0
  );

  return {
    totalSchools: allSchools.pagination.total,
    activeSchools: activeSchools.pagination.total,
    suspendedSchools: suspendedSchools.pagination.total,
    pendingOnboarding,
    recentSchools: allSchools.schools,
  };
}
