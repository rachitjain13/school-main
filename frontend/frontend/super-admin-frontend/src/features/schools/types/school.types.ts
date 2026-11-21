export type SchoolStatus = "ACTIVE" | "PENDING" | "SUSPENDED";

export type SubscriptionPlan =
  | "BASIC"
  | "PROFESSIONAL"
  | "ENTERPRISE";

export type SchoolType =
  | "PRIMARY"
  | "HIGH_SCHOOL"
  | "INTER_COLLEGE"
  | "COLLEGE"
  | "OTHER";

export type BoardingType =
  | "DAY"
  | "BOARDING"
  | "BOTH";

export type InvitationStatus =
  | "NOT_SENT"
  | "PENDING"
  | "ACCEPTED"
  | "EXPIRED";

export interface School {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  students: number;
  teachers: number;
  plan: SubscriptionPlan;
  status: SchoolStatus;
  createdAt: string;

  schoolType?: SchoolType;
  boardingType?: BoardingType;
  registrationNumber?: string;
  officialEmail?: string;
  contactNumber?: string;
  website?: string;
  establishedYear?: string;

  addressLine1?: string;
  addressLine2?: string;
  country?: string;
  pinCode?: string;

  adminName?: string;
  adminEmail?: string;
  adminPhone?: string;

  description?: string;
  logo?: string;
  invitationStatus?: InvitationStatus;
}

export interface CreateSchoolInput {
  name: string;
  code: string;
  city: string;
  state: string;
  plan: SubscriptionPlan;

  schoolType?: SchoolType;
  boardingType?: BoardingType;
  registrationNumber?: string;
  officialEmail?: string;
  contactNumber?: string;
  website?: string;
  establishedYear?: string;

  addressLine1?: string;
  addressLine2?: string;
  country?: string;
  pinCode?: string;

  adminName?: string;
  adminEmail?: string;
  adminPhone?: string;

  description?: string;
  logo?: string;
}