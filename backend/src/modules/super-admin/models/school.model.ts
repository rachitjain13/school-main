
import mongoose, { Schema, Model } from "mongoose";

export type SchoolStatus =
  | "provisioning"
  | "provisioning_failed"
  | "admin_invited"
  | "onboarding"
  | "active"
  | "suspended"
  | "archived";

export interface ISchool {
  schoolId: string;
  schoolName: string;
  normalizedSchoolName: string;
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

  subscriptionPlanId?: string;
  status: SchoolStatus;
  createdBy: mongoose.Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

const schoolSchema = new Schema<ISchool>(
  {
    schoolId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      match: /^SCH-[0-9]{6}$/,
    },

    schoolName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    normalizedSchoolName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    schoolType: {
      type: String,
      required: true,
      trim: true,
    },

    registrationNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    officialEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },

    address: {
      addressLine1: { type: String, required: true, trim: true },
      addressLine2: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
    },

    mainAdmin: {
      fullName: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, trim: true },
    },

    subscriptionPlanId: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "provisioning",
        "provisioning_failed",
        "admin_invited",
        "onboarding",
        "active",
        "suspended",
        "archived",
      ],
      default: "provisioning",
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "PlatformUser",
      immutable: true,
    },
  },
  {
    timestamps: true,
    collection: "schools",
    versionKey: false,
    strict: "throw",
  }
);

schoolSchema.index({ status: 1, createdAt: -1 });
schoolSchema.index({
  normalizedSchoolName: 1,
  "address.city": 1,
  "address.state": 1,
});

export const School: Model<ISchool> =
  (mongoose.models.School as Model<ISchool>) ||
  mongoose.model<ISchool>("School", schoolSchema);
