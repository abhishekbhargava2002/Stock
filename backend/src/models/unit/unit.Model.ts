import mongoose, { Schema, Types } from "mongoose";

const unitSchema = new Schema(
    {
        userId: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },

        unitName: {
            type: String,
            required: true,
            trim: true,
        },

        shortCode: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Unique shortCode per user
unitSchema.index({ userId: 1, shortCode: 1 }, { unique: true });

export const Unit = mongoose.model("Unit", unitSchema);