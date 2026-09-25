import { Schema, model, Types } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["super_admin", "admin", "user"],
      default: "user",
    },

    organization: {
      type: Types.ObjectId,
      ref: "Organization",
    },

    facility: {
      type: Types.ObjectId,
      ref: "Facility",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

userSchema.index({ organization: 1, phone: 1 });

export const User = model("User", userSchema);