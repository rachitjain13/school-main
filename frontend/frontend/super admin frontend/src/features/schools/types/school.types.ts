
export type SchoolStatus = "ACTIVE" | "PENDING" | "SUSPENDED";

export type SubscriptionPlan = "BASIC" | "PROFESSIONAL" | "ENTERPRISE";

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
}

export interface CreateSchoolInput {
  name: string;
  code: string;
  city: string;
  state: string;
  plan: SubscriptionPlan;
}
