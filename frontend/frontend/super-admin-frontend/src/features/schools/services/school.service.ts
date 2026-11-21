
import api from "../../../services/api";
import { useAuthStore } from "../../../store/auth.store";
import type { CreateSchoolInput } from "../types/school.types";

interface CreateSchoolDraftPayload {
  schoolName: string;
  schoolType: string;
  registrationNumber?: string;
  officialEmail: string;
  phone: string;
  website?: string;
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  mainAdmin: {
    fullName: string;
    email: string;
    phone?: string;
  };
}

export interface CreatedSchoolDraft {
  _id: string;
  schoolName: string;
  officialEmail: string;
  status: string;
  [key: string]: unknown;
}

export interface ConfirmedSchool {
  schoolId: string;
  schoolName: string;
  status: string;
  [key: string]: unknown;
}

function getAuthHeaders() {
  const accessToken = useAuthStore.getState().accessToken;

  if (!accessToken) {
    throw new Error("Your session has expired. Please log in again.");
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

function mapSchoolFormToDraft(
  form: CreateSchoolInput
): CreateSchoolDraftPayload {
  if (
    !form.name?.trim() ||
    !form.schoolType ||
    !form.officialEmail?.trim() ||
    !form.contactNumber?.trim() ||
    !form.addressLine1?.trim() ||
    !form.city?.trim() ||
    !form.state?.trim() ||
    !form.pinCode?.trim() ||
    !form.country?.trim() ||
    !form.adminName?.trim() ||
    !form.adminEmail?.trim()
  ) {
    throw new Error("Please complete all required school details.");
  }

  const payload: CreateSchoolDraftPayload = {
    schoolName: form.name.trim(),
    schoolType: form.schoolType,
    officialEmail: form.officialEmail.trim().toLowerCase(),
    phone: form.contactNumber.trim(),

    address: {
      addressLine1: form.addressLine1.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.pinCode.trim(),
      country: form.country.trim(),
    },

    mainAdmin: {
      fullName: form.adminName.trim(),
      email: form.adminEmail.trim().toLowerCase(),
    },
  };

  if (form.registrationNumber?.trim()) {
    payload.registrationNumber = form.registrationNumber.trim();
  }

  if (form.website?.trim()) {
    payload.website = form.website.trim();
  }

  if (form.addressLine2?.trim()) {
    payload.address.addressLine2 = form.addressLine2.trim();
  }

  if (form.adminPhone?.trim()) {
    payload.mainAdmin.phone = form.adminPhone.trim();
  }

  return payload;
}

export async function createSchoolDraft(
  form: CreateSchoolInput
): Promise<CreatedSchoolDraft> {
  const response = await api.post(
    "/super-admin/schools/drafts",
    mapSchoolFormToDraft(form),
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.data?.success || !response.data?.data?.draft?._id) {
    throw new Error(
      response.data?.message || "School draft creation failed."
    );
  }

  return response.data.data.draft as CreatedSchoolDraft;
}

export async function confirmSchoolDraft(
  draftId: string
): Promise<ConfirmedSchool> {
  if (!draftId) {
    throw new Error("School draft ID is missing.");
  }

  const response = await api.post(
    `/super-admin/schools/drafts/${encodeURIComponent(draftId)}/confirm`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.data?.success || !response.data?.data?.school) {
    throw new Error(
      response.data?.message || "School confirmation failed."
    );
  }

  return response.data.data.school as ConfirmedSchool;
}

export type BackendSchoolStatus =
  | "provisioning"
  | "provisioning_failed"
  | "admin_invited"
  | "onboarding"
  | "active"
  | "suspended"
  | "archived";

export interface BackendSchool {
  _id: string;
  schoolId: string;
  schoolName: string;
  schoolType?: string;
  registrationNumber?: string;
  officialEmail?: string;
  phone?: string;
  address?: {
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  mainAdmin?: {
    fullName?: string;
    email?: string;
  };
  status: BackendSchoolStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface SchoolListResponse {
  schools: BackendSchool[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface GetSchoolsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: BackendSchoolStatus;
  sortOrder?: "asc" | "desc";
}

export async function getSchools(
  params: GetSchoolsParams = {}
): Promise<SchoolListResponse> {
  const accessToken = useAuthStore.getState().accessToken;

  if (!accessToken) {
    throw new Error("Your session has expired. Please log in again.");
  }

  const response = await api.get("/super-admin/schools", {
    params,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.data?.success) {
    throw new Error(
      response.data?.message || "Unable to retrieve schools."
    );
  }

  return response.data.data as SchoolListResponse;
}
