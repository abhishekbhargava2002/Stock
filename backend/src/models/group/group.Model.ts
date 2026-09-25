import { Schema, model, Types } from "mongoose";

const GroupSchema = new Schema(
    {
        userId: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        groupName: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

GroupSchema.index(
    { userId: 1, groupName: 1 },
    { unique: true }
);

export const Group = model("Group", GroupSchema);