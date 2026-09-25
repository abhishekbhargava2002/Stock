import mongoose, { Schema, model, Types } from "mongoose";

const GodownSchema = new Schema(
    {
        godownName: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
        },

        address: {
            type: String,
            required: true,
            default: "",
        },

        isDefault: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },

        userId: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
    },
    { timestamps: true }
);


GodownSchema.pre("save", async function (next) {
    if (this.isDefault) {
        await mongoose.model("Godown").updateMany(
            {
                _id: { $ne: this._id },
                userId: this.userId,   // ✅ IMPORTANT FIX
            },
            {
                isDefault: false,
            }
        );
    }

    next();
});


GodownSchema.index({ userId: 1, godownName: 1 }, { unique: true });

export const Godown = model("Godown", GodownSchema);