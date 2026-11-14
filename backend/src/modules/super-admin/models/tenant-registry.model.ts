
import mongoose, { Schema, Model } from "mongoose";

export type TenantStatus =
  | "provisioning"
  | "provisioning_failed"
  | "active"
  | "suspended"
  | "archived";

export interface ITenantRegistry {
  schoolId: string;
  databaseName: string;
  status: TenantStatus;
  provisioningAttempts: number;
  lastProvisioningError?: string;
  lastProvisionedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const tenantRegistrySchema = new Schema<ITenantRegistry>(
  {
    schoolId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      trim: true,
    },

    databaseName: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      trim: true,
      match: /^school_[a-z0-9_]+$/,
    },

    status: {
      type: String,
      enum: [
        "provisioning",
        "provisioning_failed",
        "active",
        "suspended",
        "archived",
      ],
      default: "provisioning",
      required: true,
    },

    provisioningAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastProvisioningError: {
      type: String,
      maxlength: 1000,
    },

    lastProvisionedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "tenant_registry",
    versionKey: false,
    strict: "throw",
  }
);

export const TenantRegistry: Model<ITenantRegistry> =
  (mongoose.models.TenantRegistry as Model<ITenantRegistry>) ||
  mongoose.model<ITenantRegistry>(
    "TenantRegistry",
    tenantRegistrySchema
  );
