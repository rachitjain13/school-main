
import mongoose, { Schema, Types, Model } from "mongoose";

export interface IRefreshTokenHistory {
  sessionId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  createdAt?: Date;
}

const schema = new Schema<IRefreshTokenHistory>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "PlatformSession",
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
      select: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "platform_refresh_token_history",
    versionKey: false,
    strict: "throw",
  }
);

schema.index(
  { tokenHash: 1 },
  { unique: true, name: "refresh_history_token_hash_unique" }
);

schema.index(
  { sessionId: 1 },
  { name: "refresh_history_session_id" }
);

schema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, name: "refresh_history_expiry" }
);

export const RefreshTokenHistory: Model<IRefreshTokenHistory> =
  (mongoose.models.RefreshTokenHistory as Model<IRefreshTokenHistory>) ||
  mongoose.model<IRefreshTokenHistory>(
    "RefreshTokenHistory",
    schema
  );
