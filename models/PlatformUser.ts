import mongoose, { Schema, models } from "mongoose";

const PlatformUserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    plan: {
      type: String,
      enum: ["Free", "Pro", "Enterprise"],
      default: "Free",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Pending"],
      default: "Pending",
    },
    accessExpiresAt: {
      type: Date,
      required: true,
    },
    lastActive: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export default models.PlatformUser ||
  mongoose.model("PlatformUser", PlatformUserSchema);
