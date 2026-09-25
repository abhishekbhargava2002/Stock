import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface ICategory extends Document {
    categoryName: string;
    description?: string;
    group: Types.ObjectId;
    parentCategory?: Types.ObjectId | null;
    status: "active" | "inactive";
    userId: Types.ObjectId;
}

const categorySchema = new Schema<ICategory>(
    {
        categoryName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        group: {
            type: Schema.Types.ObjectId,
            ref: "Group",
            required: true,
        },

        parentCategory: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
            required: true,
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

// Unique category name under same parent + group + user
categorySchema.index({ categoryName: 1, group: 1, parentCategory: 1, userId: 1, }, { unique: true, });


categorySchema.pre("save", async function (next) {
    try {
        // Parent category cannot be itself
        if (
            this.parentCategory &&
            this.parentCategory.toString() ===
            this._id.toString()
        ) {
            return next(
                new Error(
                    "Parent category cannot be itself"
                )
            );
        }

        // Validate parent category
        if (this.parentCategory) {
            const parentCategory = await mongoose
                .model<ICategory>("Category")
                .findById(this.parentCategory);

            if (!parentCategory) {
                return next(
                    new Error(
                        "Parent category not found"
                    )
                );
            }

            // Parent must belong to same group
            if (
                parentCategory.group.toString() !==
                this.group.toString()
            ) {
                return next(
                    new Error(
                        "Parent category must belong to same group"
                    )
                );
            }

            // Inactive parent cannot have active child
            if (
                parentCategory.status === "inactive" &&
                this.status === "active"
            ) {
                return next(
                    new Error(
                        "Inactive parent category cannot have active child category"
                    )
                );
            }
        }

        next();
    } catch (error: any) {
        next(error);
    }
});

export const Category = model<ICategory>(
    "Category",
    categorySchema
);