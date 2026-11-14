import mongoose, { Schema, Types, Model } from "mongoose";

export type PlatformRole = "super_admin" | "school_main_admin";

export type PlatformUserStatus =
  | "invited"
  | "active"
  | "suspended"
  | "disabled";

export interface IPlatformUser {
  fullName: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  role: PlatformRole;
  status: PlatformUserStatus;
  emailVerifiedAt?: Date;
  passwordChangedAt?: Date;
  lastLoginAt?: Date;
  failedLoginAttempts: number;
  lockUntil?: Date;
  createdBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const platformUserSchema = new Schema<IPlatformUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 20
    },

    passwordHash: {
      type: String,
      select: false
    },

    role: {
      type: String,
      enum: ["super_admin", "school_main_admin"],
      required: true
    },

    status: {
      type: String,
      enum: ["invited", "active", "suspended", "disabled"],
      default: "invited",
      required: true
    },

    emailVerifiedAt: Date,

    passwordChangedAt: Date,

    lastLoginAt: Date,

    failedLoginAttempts: {
      type: Number,
      default: 0,
      min: 0
    },

    lockUntil: Date,

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "PlatformUser"
    }
  },
  {
    timestamps: true,
    collection: "platform_users",
    versionKey: false,
    strict: "throw"
  }
);

// Email must be unique across the entire platform.
platformUserSchema.index(
  { email: 1 },
  { unique: true, name: "platform_user_email_unique" }
);

// Helps platform-level user administration.
platformUserSchema.index(
  { role: 1, status: 1 },
  { name: "platform_user_role_status" }
);

export const PlatformUser: Model<IPlatformUser> =
  (mongoose.models.PlatformUser as Model<IPlatformUser>) ||
  mongoose.model<IPlatformUser>("PlatformUser", platformUserSchema);
