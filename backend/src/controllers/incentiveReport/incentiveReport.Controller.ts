import { Schema, ZodError } from "zod";
import { Request, Response } from "express";
import { User } from "../../models/user/user.model";
import { AuthRequest } from '../../middleware/auth.middleware';
import { Scheme } from "../../models/scheme/scheme.Model";
import { IncentiveReport } from '../../models/incentiveReport/incentiveReport.Model';
import { createIncentiveReportSchema, updateIncentiveReportStatusSchema } from '../../validations/incentiveReport/incentiveReport.Validation';
import { IncentiveRule } from "../../models/incentive/incentive.Model";
import { Vendor } from "../../models/vendor/vendor.Model";
import { Employee } from "../../models/employee/employee.Model";


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

        const validatedData = createIncentiveReportSchema.parse(req.body);


        // Check duplicate report
        const existingReport =
            await IncentiveReport.findOne({
                organizationId:
                    user.organization,
                ruleId:
                    validatedData.ruleId,
                schemeId:
                    validatedData.schemeId,
                employeeId:
                    validatedData.employeeId,
                vendorId:
                    validatedData.vendorId,
            });

        if (existingReport) {
            return res.status(409).json({
                success: false,
                message: "Incentive report already exists",
            });
        }


        const incentive = await IncentiveRule.findById(validatedData.ruleId);
        if (!incentive) {
            return res.status(409).json({
                success: false,
                message: "Incentive rule does not exist",
            });
        }


        const today = new Date();

        const scheme = await Scheme.findOne({
            _id: validatedData.schemeId,
            ruleIds: incentive._id,
            status: "active",
            startDate: { $lte: today },
            endDate: { $gte: today },
        });

        if (!scheme) {
            return res.status(409).json({
                success: false,
                message:
                    "Scheme does not exist, is inactive, or has expired",
            });
        }


        const report = await IncentiveReport.create({
            ...validatedData,
            organizationId: user.organization,
            createdBy: user._id,
        });

        return res.status(201).json({
            success: true,
            message: "Incentive report created successfully",
            data: report
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
        const limit =
            Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [reports, total] =
            await Promise.all([
                IncentiveReport.find({
                    organizationId:
                        user.organization,
                })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),

                IncentiveReport.countDocuments({
                    organizationId:
                        user.organization,
                }),
            ]);

        return res.status(200).json({
            success: true,
            message:
                "Incentive reports fetched successfully",
            data: reports,
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
                "Server Error",
        });
    }
};


export const getById = async (req: AuthRequest, res: Response) => {
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

        const report = await IncentiveReport.findOne({
            _id: req.params.id,
            organizationId: user.organization,
        })
            .populate("employeeId")
            .populate("vendorId")
            .populate("schemeId")
            .populate("ruleId");

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Incentive report not found",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Incentive report fetched successfully",
            data: report,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Server Error",
        });
    }
};


export const upstatus = async (req: AuthRequest, res: Response) => {
    try {
        const { status } =
            updateIncentiveReportStatusSchema.parse(
                req.body
            );

        const report =
            await IncentiveReport.findOneAndUpdate(
                {
                    _id: req.params.id,
                    createdBy: req.user?.id,
                },
                { status },
                { new: true }
            );

        if (!report) {
            return res.status(404).json({
                success: false,
                message:
                    "Incentive report not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Incentive report status updated successfully",
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
                "Server Error",
        });
    }
};


export const vendorDropdown = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user?.id;
        const vendor = await Vendor.find({ userId: user, status: "active" }).select("_id vendorName");

        return res.status(200).json({
            success: true,
            message: "Vendors fetched successfully",
            data: vendor,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Server Error",
        });
    }
};

export const employeeDropdown = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user?.id;
        const employee = await Employee.find({ userId: user, status: "active" }).select("_id fullName");

        return res.status(200).json({
            success: true,
            message: "Employee fetched successfully",
            data: employee
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Server Error",
        });
    }
};

export const ruleDropdown = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user?.id;
        const rule = await IncentiveRule.find({
            createdBy: user
        }).select("_id ruleName");

        return res.status(200).json({
            success: true,
            message: "Incentive rules fetched successfully",
            data: rule
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Server Error",
        });
    }
};


export const schemeDropdown = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { ruleId } = req.params;

        const schemes = await Scheme.find({
            ruleIds: ruleId,
            status: "active",
        })
            .select("_id schemeName")
            .sort({ schemeName: 1 })
            .lean();

        return res.status(200).json({
            success: true,
            message: "Schemes fetched successfully",
            data: schemes,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Server Error",
        });
    }
};