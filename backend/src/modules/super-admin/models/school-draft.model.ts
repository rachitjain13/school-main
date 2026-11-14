
import mongoose, { Schema, Model } from "mongoose";

export type SchoolDraftStatus = "draft" | "confirmed" | "discarded";

export interface ISchoolDraft {
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
  status: SchoolDraftStatus;
  createdBy: mongoose.Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

const schoolDraftSchema = new Schema<ISchoolDraft>(
  {
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
      enum: ["draft", "confirmed", "discarded"],
      default: "draft",
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
    collection: "school_drafts",
    versionKey: false,
    strict: "throw",
  }
);

schoolDraftSchema.index({ status: 1, createdAt: -1 });
schoolDraftSchema.index({ normalizedSchoolName: 1 });

export const SchoolDraft: Model<ISchoolDraft> =
  (mongoose.models.SchoolDraft as Model<ISchoolDraft>) ||
  mongoose.model<ISchoolDraft>("SchoolDraft", schoolDraftSchema);
