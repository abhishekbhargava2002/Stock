import { ZodError } from "zod";
import { Request, Response } from "express";
import { User } from '../../models/user/user.model';
import { AuthRequest } from '../../middleware/auth.middleware';
import { IncentiveRule } from "../../models/incentive/incentive.Model";
import Item from '../../models/item/item.Model';
import { Group } from '../../models/group/group.Model';
import { Vendor } from '../../models/vendor/vendor.Model';
import { Category } from '../../models/category/category.Model';
import { createIncentiveRuleSchema, updateIncentiveRuleSchema } from "../../validations/incentive/incentive.Validation";


export const create = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(
            req.user?.id
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const validatedData = createIncentiveRuleSchema.parse(req.body);

        // Duplicate Rule Name Check
        const existingRule =
            await IncentiveRule.findOne({
                organizationId:
                    user.organization,
                ruleName: {
                    $regex: new RegExp(
                        `^${validatedData.ruleName}$`,
                        "i"
                    ),
                },
            });

        if (existingRule) {
            return res.status(400).json({
                success: false,
                message:
                    "Incentive rule name already exists",
            });
        }

        await IncentiveRule.create({
            ...validatedData,
            organizationId:
                user.organization,
            createdBy: user._id,
        });

        return res.status(201).json({
            success: true,
            message: "Incentive rule created successfully",
        });
    } catch (error: any) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: error.errors,
            });
        }

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Internal Server Error",
        });
    }
};


export const getAll = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(
            req.user?.id
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {
            organizationId: user.organization,
        };

        const [incentiveRules, total] =
            await Promise.all([
                IncentiveRule.find(filter)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),

                IncentiveRule.countDocuments(filter),
            ]);

        return res.status(200).json({
            success: true,
            message:
                "Incentive rules fetched successfully",
            data: incentiveRules,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(
                    total / limit
                ),
            },
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Internal Server Error",
        });
    }
};


export const getById = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { id } = req.params;

        const incentiveRule =
            await IncentiveRule.findById(id);

        if (!incentiveRule) {
            return res.status(404).json({
                success: false,
                message:
                    "Incentive rule not found",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Incentive rule fetched successfully",
            data: incentiveRule,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Internal Server Error",
        });
    }
};


export const update = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { id } = req.params;

        const user = await User.findById(
            req.user?.id
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const validatedData =
            updateIncentiveRuleSchema.parse(req.body);

        // Duplicate Rule Name Check
        const existingRule =
            await IncentiveRule.findOne({
                organizationId:
                    user.organization,
                ruleName: {
                    $regex: new RegExp(
                        `^${validatedData.ruleName}$`,
                        "i"
                    ),
                },
            });

        if (existingRule) {
            return res.status(400).json({
                success: false,
                message:
                    "Incentive rule name already exists",
            });
        }

        const incentiveRule =
            await IncentiveRule.findOne({
                _id: id,
                organizationId:
                    user.organization,
            });

        if (!incentiveRule) {
            return res.status(404).json({
                success: false,
                message:
                    "Incentive rule not found",
            });
        }

        Object.assign(
            incentiveRule,
            validatedData
        );

        await incentiveRule.save();

        return res.status(200).json({
            success: true,
            message:
                "Incentive rule updated successfully",
        });
    } catch (error: any) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: error.errors,
            });
        }

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Internal Server Error",
        });
    }
};


export const status = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const incentiveRule = await IncentiveRule.findById(id);

        if (!incentiveRule) {
            return res.status(404).json({
                success: false,
                message: "Incentive rule not found",
            });
        }

        incentiveRule.status =
            incentiveRule.status === "active"
                ? "inactive"
                : "active";

        await incentiveRule.save();

        return res.status(200).json({
            success: true,
            message: "Incentive rule status updated successfully",
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Internal Server Error",
        });
    }
};


export const groupDropdown = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const user = req.user?.id;

        const groups = await Group.find({ userId: user, status: "active" })
            .select("_id groupName")
            .lean();

        return res.status(200).json({
            success: true,
            message: "Groups fetched successfully",
            data: groups,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



export const categoryDropdown = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const user = req.user?.id;

        const categories = await Category.find({ userId: user, status: "active" })
            .select("_id categoryName")
            .lean();

        return res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            data: categories,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



export const itemDropdown = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const user = req.user?.id;

        const items = await Item.find({ userId: user, isActive: true })
            .select("_id itemName")
            .lean();

        return res.status(200).json({
            success: true,
            message: "Items fetched successfully",
            data: items,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



export const vendorDropdown = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const user = req.user?.id;

        const vendors = await Vendor.find({ userId: user, status: "active" })
            .select("_id vendorName")
            .lean();

        return res.status(200).json({
            success: true,
            message: "Vendors fetched successfully",
            data: vendors,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};