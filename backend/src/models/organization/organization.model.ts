import { Schema, model, Types } from "mongoose";

const organizationSchema = new Schema(
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

        phone: {
            type: String,
            required: true,
            unique: true,
        },

        gstNumber: {
            type: String,
        },

        address: {
            type: String,
            required: true,
        },

        facilityLimit: {
            type: Number,
            default: 1,
        },

        userLimit: {
            type: Number,
            default: 5,
        },

        facilities: [
            {
                type: Types.ObjectId,
                ref: "Facility",
            },
        ],

        createdBy: {
            type: Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);


export const Organization = model("Organization", organizationSchema);