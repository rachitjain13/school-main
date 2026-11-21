import { z } from "zod";

export const updateMainAdminSchema = z
    .object({
        fullName: z.string().trim().min(2).max(100),
        email: z.string().trim().email().max(254),
        phone: z.string().trim().min(7).max(20).optional(),
    })
    .strict();

export type UpdateMainAdminInput = z.infer<
    typeof updateMainAdminSchema
>;
