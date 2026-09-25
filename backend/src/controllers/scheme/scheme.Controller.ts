import { Response } from "express";
import { ZodError } from "zod";

import { AuthRequest } from "../../middleware/auth.middleware";
import { User } from "../../models/user/user.model";
import { Scheme } from "../../models/scheme/scheme.Model";
import { IncentiveRule } from "../../models/incentive/incentive.Model";
import { createSchemeSchema, updateSchemeSchema } from "../../validations/scheme/scheme.Validation";


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

        const validatedData =
            createSchemeSchema.parse(req.body);


        // Check duplicate scheme name
        const existingScheme =
            await Scheme.findOne({
                organizationId:
                    user.organization,
                schemeName: {
                    $regex: new RegExp(
                        `^${validatedData.schemeName}$`,
                        "i"
                    ),
                },
            });

        if (existingScheme) {
            return res.status(400).json({
                success: false,
                message:
                    "Scheme name already exists",
            });
        }


        await Scheme.create({
            ...validatedData,
            organizationId: user.organization,
            createdBy: user._id,
        });

        return res.status(201).json({
            success: true,
            message:
                "Incentive scheme created successfully",
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


export const getAll = async (
    req: AuthRequest,
    res: Response
) => {
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

        const [schemeData, total] =
            await Promise.all([
                Scheme.find(filter)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),

                Scheme.countDocuments(filter),
            ]);

        return res.status(200).json({
            success: true,
            message:
                "Incentive schemes fetched successfully",
            data: schemeData,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(
                    total / limit
                ),
                hasNextPage:
                    page <
                    Math.ceil(total / limit),
                hasPreviousPage: page > 1,
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

        const user = await User.findById(
            req.user?.id
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const scheme = await Scheme.findOne({
            _id: id,
            organizationId: user.organization,
        })
            .populate("ruleIds")
            .lean();

        if (!scheme) {
            return res.status(404).json({
                success: false,
                message:
                    "Incentive scheme not found",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Incentive scheme fetched successfully",
            data: scheme,
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
            updateSchemeSchema.parse(req.body);
            
        // Check duplicate scheme name
        const existingScheme =
            await Scheme.findOne({
                organizationId:
                    user.organization,
                schemeName: {
                    $regex: new RegExp(
                        `^${validatedData.schemeName}$`,
                        "i"
                    ),
                },
            });

        if (existingScheme) {
            return res.status(400).json({
                success: false,
                message:
                    "Scheme name already exists",
            });
        }


        const scheme = await Scheme.findOne({
            _id: id,
            organizationId: user.organization,
        });

        if (!scheme) {
            return res.status(404).json({
                success: false,
                message:
                    "Incentive scheme not found",
            });
        }

        // Optional validation for ruleIds
        if (
            validatedData.ruleIds &&
            validatedData.ruleIds.length > 0
        ) {
            const rulesCount =
                await IncentiveRule.countDocuments({
                    _id: {
                        $in: validatedData.ruleIds,
                    },
                    organizationId:
                        user.organization,
                });

            if (
                rulesCount !==
                validatedData.ruleIds.length
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "One or more incentive rules are invalid",
                });
            }
        }

        Object.assign(
            scheme,
            validatedData
        );

        const updateStatus = await scheme.save();

        return res.status(200).json({
            success: true,
            message:
                "Incentive scheme updated successfully",
            data: updateStatus
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


export const ruleDropDown = async (
    req: AuthRequest,
    res: Response
) => {
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

        const rules = await IncentiveRule.find({
            organizationId: user.organization,
            status: "active",
        })
            .select("_id ruleName")
            .sort({ ruleName: 1 })
            .lean();

        return res.status(200).json({
            success: true,
            message:
                "Incentive rule dropdown fetched successfully",
            data: rules,
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