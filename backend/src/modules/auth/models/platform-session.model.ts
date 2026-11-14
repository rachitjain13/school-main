
import mongoose, { Schema, Types, Model } from "mongoose";

export interface IPlatformSession {
  userId: Types.ObjectId;
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  userAgent?: string;
  ipAddress?: string;
  lastUsedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const platformSessionSchema = new Schema<IPlatformSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "PlatformUser",
      required: true
    },

    refreshTokenHash: {
      type: String,
      required: true,
      select: false
    },

    expiresAt: {
      type: Date,
      required: true
    },

    revokedAt: {
      type: Date,
      default: null
    },

    userAgent: {
      type: String,
      maxlength: 500
    },

    ipAddress: {
      type: String,
      maxlength: 100
    },

    lastUsedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: "platform_sessions",
    versionKey: false,
    strict: "throw"
  }
);

// Find all sessions belonging to a particular user.
platformSessionSchema.index(
  { userId: 1, revokedAt: 1 },
  { name: "platform_session_user_status" }
);

// Automatically clean up expired sessions.
platformSessionSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
    name: "platform_session_expiry"
  }
);

export const PlatformSession: Model<IPlatformSession> =
  (mongoose.models.PlatformSession as Model<IPlatformSession>) ||
  mongoose.model<IPlatformSession>(
    "PlatformSession",
    platformSessionSchema
  );
