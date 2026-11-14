
import { z } from "zod";

export const createSchoolDraftSchema = z
  .object({
    schoolName: z.string().trim().min(2).max(150),

    schoolType: z.string().trim().min(2).max(50),

    registrationNumber: z.string().trim().max(100).optional(),

    officialEmail: z.string().trim().email().max(254),

    phone: z.string().trim().min(7).max(20),

    website: z.string().trim().url().optional(),

    address: z
      .object({
        addressLine1: z.string().trim().min(3).max(200),
        addressLine2: z.string().trim().max(200).optional(),
        city: z.string().trim().min(2).max(100),
        state: z.string().trim().min(2).max(100),
        postalCode: z.string().trim().min(3).max(20),
        country: z.string().trim().min(2).max(100),
      })
      .strict(),

    mainAdmin: z
      .object({
        fullName: z.string().trim().min(2).max(100),
        email: z.string().trim().email().max(254),
        phone: z.string().trim().min(7).max(20).optional(),
      })
      .strict(),

    subscriptionPlanId: z.string().trim().max(100).optional(),
  })
  .strict();

export type CreateSchoolDraftInput = z.infer<
  typeof createSchoolDraftSchema
>;
