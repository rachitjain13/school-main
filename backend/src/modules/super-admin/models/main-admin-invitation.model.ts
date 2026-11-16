
import mongoose, { Schema, Model, Types } from "mongoose";

export type MainAdminInvitationStatus =
  | "pending"
  | "accepted"
  | "expired"
  | "revoked";

export interface IMainAdminInvitation {
  schoolId: string;
  email: string;
  fullName: string;
  tokenHash: string;
  status: MainAdminInvitationStatus;
  expiresAt: Date;
  invitedBy: Types.ObjectId;
  acceptedAt?: Date;
  revokedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const mainAdminInvitationSchema =
  new Schema<IMainAdminInvitation>(
    {
      schoolId: {
        type: String,
        required: true,
        trim: true,
        immutable: true,
      },

      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        maxlength: 254,
      },

      fullName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },

      tokenHash: {
        type: String,
        required: true,
        unique: true,
        select: false,
      },

      status: {
        type: String,
        enum: ["pending", "accepted", "expired", "revoked"],
        default: "pending",
        required: true,
      },

      expiresAt: {
        type: Date,
        required: true,
      },

      invitedBy: {
        type: Schema.Types.ObjectId,
        ref: "PlatformUser",
        required: true,
        immutable: true,
      },

      acceptedAt: Date,
      revokedAt: Date,
    },
    {
      timestamps: true,
      collection: "main_admin_invitations",
      versionKey: false,
      strict: "throw",
    }
  );

mainAdminInvitationSchema.index(
  { schoolId: 1, status: 1, createdAt: -1 },
  { name: "school_invitation_status" }
);

mainAdminInvitationSchema.index(
  { expiresAt: 1 },
  { name: "invitation_expiry" }
);

export const MainAdminInvitation: Model<IMainAdminInvitation> =
  (mongoose.models.MainAdminInvitation as Model<IMainAdminInvitation>) ||
  mongoose.model<IMainAdminInvitation>(
    "MainAdminInvitation",
    mainAdminInvitationSchema
  );
