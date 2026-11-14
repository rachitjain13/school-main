
import mongoose, { Schema, Model } from "mongoose";

export interface ISchoolCounter {
  _id: string;
  sequence: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const schoolCounterSchema = new Schema<ISchoolCounter>(
  {
    _id: {
      type: String,
      required: true,
    },
    sequence: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: "counters",
    versionKey: false,
    strict: "throw",
  }
);

export const SchoolCounter: Model<ISchoolCounter> =
  (mongoose.models.SchoolCounter as Model<ISchoolCounter>) ||
  mongoose.model<ISchoolCounter>("SchoolCounter", schoolCounterSchema);
