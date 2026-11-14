
import mongoose, { Schema, Model, Types } from "mongoose";

export type SchoolMembershipStatus = "active" | "suspended";

export interface ISchoolMembership {
  userId: Types.ObjectId;
  schoolId: string;
  role: "school_main_admin";
  status: SchoolMembershipStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

const schoolMembershipSchema = new Schema<ISchoolMembership>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "PlatformUser",
      required: true,
      immutable: true,
    },

    schoolId: {
      type: String,
      required: true,
      trim: true,
      immutable: true,
    },

    role: {
      type: String,
      enum: ["school_main_admin"],
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "school_memberships",
    versionKey: false,
    strict: "throw",
  }
);

// One platform user can belong to only one school.
schoolMembershipSchema.index(
  { userId: 1 },
  { unique: true, name: "one_school_per_user_unique" }
);

// Helps find memberships belonging to a school.
schoolMembershipSchema.index(
  { schoolId: 1, status: 1 },
  { name: "school_membership_status" }
);

export const SchoolMembership: Model<ISchoolMembership> =
  (mongoose.models.SchoolMembership as Model<ISchoolMembership>) ||
  mongoose.model<ISchoolMembership>(
    "SchoolMembership",
    schoolMembershipSchema
  );
