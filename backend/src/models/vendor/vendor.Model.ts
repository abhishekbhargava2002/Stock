import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVendor extends Document {
    vendorName: string;
    phoneNumber: string;
    email?: string;
    gstNumber?: string;
    status: "active" | "inactive";
    address: string;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const vendorSchema: Schema<IVendor> = new Schema(
    {
        vendorName: {
            type: String,
            required: [true, "Vendor name is required"],
            trim: true,
            minlength: [2, "Vendor name must be at least 2 characters"],
            maxlength: [100, "Vendor name cannot exceed 100 characters"],
        },

        phoneNumber: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            match: [/^[6-9]\d{9}$/, "Invalid phone number"],
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Invalid email address",
            ],
            default: undefined,
        },

        gstNumber: {
            type: String,
            trim: true,
            uppercase: true,
            match: [
                /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/,
                "Invalid GST number",
            ],
            default: undefined,
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            required: true,
            default: "active",
        },

        address: {
            type: String,
            required: [true, "Address is required"],
            trim: true,
            minlength: [5, "Address must be at least 5 characters"],
            maxlength: [500, "Address cannot exceed 500 characters"],
        },

        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);
vendorSchema.index({ vendorName: 1, phoneNumber: 1, userId: 1, }, { unique: true, });

export const Vendor: Model<IVendor> = mongoose.models.Vendor || mongoose.model<IVendor>("Vendor", vendorSchema);