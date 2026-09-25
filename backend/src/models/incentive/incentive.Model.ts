import { Schema, model, Types } from "mongoose";

const incentiveSlabSchema = new Schema(
    {
        fromValue: {
            type: Number,
            required: true,
            min: 0,
        },

        toValue: {
            type: Number,
            default: null,
        },

        incentiveValue: {
            type: Number,
            required: true,
            min: 0,
        },

        maximumIncentiveLimit: {
            type: Number,
            default: 0,
        },
    },
    { _id: false }
);

const incentiveRuleSchema = new Schema(
    {
        organizationId: {
            type: Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true,
        },

        //STEP 1 : RULE DETAILS

        ruleName: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },

        effectiveFrom: {
            type: Date,
            required: true,
        },

        effectiveTo: {
            type: Date,
        },

        /*
        =====================
        STEP 2 : APPLICABILITY
        =====================
        */

        applicability: {
            type: String,
            enum: ["group", "category", "item"],
            required: true,
        },

        groupId: {
            type: Types.ObjectId,
            ref: "Group",
        },

        categoryId: {
            type: Types.ObjectId,
            ref: "Category",
        },

        itemId: {
            type: Types.ObjectId,
            ref: "Item",
        },

        vendorId: {
            type: Types.ObjectId,
            ref: "Vendor",
        },

        /*
        Main Component / Sub Component
        */

        mainComponent: {
            type: String,
            default: "",
        },

        subComponent: {
            type: String,
            default: "",
        },

        /*
        =====================
        STEP 3 & 4 : CALCULATION
        =====================
        */

        incentiveType: {
            type: String,
            enum: ["amount", "percentage"],
            required: true,
        },

        applicableOn: {
            type: String,
            enum: ["quantity", "amount"],
            required: true,
        },

        ruleType: {
            type: String,
            enum: ["singular", "slabwise"],
            required: true,
        },

        operator: {
            type: String,
            enum: ["=", ">", "<", ">=", "<="],
            default: ">=",
        },

        /*
        Singular Rule Fields
        */

        threshold: {
            type: Number,
            default: 0,
        },

        incentiveValue: {
            type: Number,
            default: 0,
        },

        /*
        Common Limits
        */

        minimumSaleValue: {
            type: Number,
            default: 0,
        },

        maximumIncentiveLimit: {
            type: Number,
            default: 0,
        },

        /*Slabwise Rules*/

        slabs: [incentiveSlabSchema],

        remarks: {
            type: String,
            default: "",
            trim: true,
        },

        createdBy: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

incentiveRuleSchema.index(
    {
        organizationId: 1,
        ruleName: 1,
    },
    {
        unique: true,
        collation: {
            locale: "en",
            strength: 2,
        },
    }
);


export const IncentiveRule = model("IncentiveRule", incentiveRuleSchema);