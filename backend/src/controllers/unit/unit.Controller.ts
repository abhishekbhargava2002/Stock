import { Request, Response } from "express";
import mongoose from "mongoose";
import { Unit } from "../../models/unit/unit.Model";
import { createUnitSchema, updateUnitSchema, } from "../../validations/unit/unit.Validation";

interface AuthRequest extends Request {
    user?: {
        id: string;
    };
}

// CREATE UNIT
export const createUnit = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // VALIDATE DATA
        const validatedData = createUnitSchema.safeParse(req.body);

        if (!validatedData.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validatedData.error.errors.map((err) => ({
                    field: err.path[0],
                    message: err.message,
                })),
            });
        }

        // CHECK DUPLICATE SHORT CODE
        const existingUnit = await Unit.findOne({
            userId: req.user?.id,
            shortCode: validatedData.data.shortCode,
        });

        if (existingUnit) {
            return res.status(400).json({
                success: false,
                message: "Short code already exists",
            });
        }

        // CREATE UNIT
        const unit = await Unit.create({
            ...validatedData.data,
            userId: req.user?.id,
        });

        return res.status(201).json({
            success: true,
            message: "Unit created successfully",
            data: unit,
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};


// GET ALL UNITS
export const getAllUnits = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // PAGINATION
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        // TOTAL COUNT
        const totalUnits = await Unit.countDocuments({
            userId: req.user?.id,
        });

        // GET UNITS
        const units = await Unit.find({
            userId: req.user?.id,
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // NO DATA FOUND
        if (units.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No units found",
                data: [],
            });
        }

        return res.status(200).json({
            success: true,
            message: "Units fetched successfully",

            pagination: {
                total: totalUnits,
                page,
                limit,
                totalPages: Math.ceil(totalUnits / limit),
            },

            data: units,
        });

    } catch (error: any) {

        // SERVER ERROR
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};


export const updateUnit = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const id = req.params.id as string;
        // VALIDATE ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid unit ID",
            });
        }

        // VALIDATE BODY
        const validated = updateUnitSchema.safeParse(req.body);

        if (!validated.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validated.error.errors.map((err) => ({
                    field: err.path[0],
                    message: err.message,
                })),
            });
        }

        const data = validated.data;

        // FIND UNIT
        const unit = await Unit.findOne({
            _id: id,
            userId: req.user?.id,
        });

        if (!unit) {
            return res.status(404).json({
                success: false,
                message: "Unit not found",
            });
        }

        // DUPLICATE SHORT CODE CHECK
        if (data.shortCode) {
            const existingUnit = await Unit.findOne({
                _id: { $ne: id },
                userId: req.user?.id,
                shortCode: data.shortCode,
            });

            if (existingUnit) {
                return res.status(400).json({
                    success: false,
                    message: "Short code already exists",
                });
            }
        }

        // UPDATE UNIT
        const updatedUnit = await Unit.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Unit updated successfully",
            data: updatedUnit,
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const status = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const statuses = [
            {
                label: "ACTIVE",
                value: "Active",
            },
            {
                label: "INACTIVE",
                value: "Inactive",
            },
        ];

        return res.status(200).json({
            success: true,
            message: "Status fetched successfully",
            count: statuses.length,
            data: statuses,
        });

    } catch (error: any) {
        console.log("Status Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch status",
        });
    }
};