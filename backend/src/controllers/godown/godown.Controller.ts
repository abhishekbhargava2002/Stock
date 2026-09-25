import { Request, Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from '../../middleware/auth.middleware'
import { Godown } from "../../models/godown/godown.Model";
import { createGodownValidation, updateGodownValidation } from "../../validations/godown/godown.Validation";

export class GodownController {
    //Create
    static async create(req: AuthRequest, res: Response) {
        try {
            const user = req.user?.id;

            const validatedData = createGodownValidation.parse(req.body);
            const existingGodown = await Godown.findOne({
                godownName: validatedData.godownName,
                userId: user,
            });

            if (existingGodown) {
                return res.status(409).json({
                    success: false,
                    message: "Godown already exists",
                });
            }
            const godown = await Godown.create({
                godownName: validatedData.godownName,
                description: validatedData.description,
                address: validatedData.address,
                isDefault: validatedData.isDefault,
                status: validatedData.status,
                userId: user,
            });


            return res.status(201).json({
                success: true,
                message: "Godown created successfully",
                data: godown,
            });

        } catch (error: any) {
            if (error.name === "ZodError") {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: error.errors,
                });
            }

            if (error instanceof mongoose.Error.ValidationError) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }

            if (error.code === 11000) {

                return res.status(409).json({
                    success: false,
                    message: "Godown name already exists",
                });
            }

            return res.status(500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    //GetAllDown
    static async getAll(req: Request, res: Response) {
        try {

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const total = await Godown.countDocuments();

            const godowns = await Godown.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            return res.status(200).json({
                success: true,
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                data: godowns,
            });

        } catch (error: any) {

            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    //Get By Id
    static async getById(req: Request, res: Response) {
        try {
            const id = req.params.id as string;

            if (!mongoose.Types.ObjectId.isValid(id)) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid Godown ID",
                });
            }

            const godown = await Godown.findById(id);

            if (!godown) {

                return res.status(404).json({
                    success: false,
                    message: "Godown not found",
                });
            }

            return res.status(200).json({
                success: true,
                data: godown,
            });

        } catch (error: any) {

            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    //Update
    static async update(req: AuthRequest, res: Response) {
        try {

            const userId = req.user?.id;
            const id = req.params.id as string;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Godown ID",
                });
            }

            // Validate Data
            const validatedData = updateGodownValidation.parse(req.body);

            const updatedGodown = await Godown.findOneAndUpdate(
                {
                    _id: id,
                    userId: userId, // only creator can update
                },
                validatedData,
                {
                    new: true,
                    runValidators: true,
                }
            );

            if (!updatedGodown) {
                return res.status(404).json({
                    success: false,
                    message: "Godown not found or unauthorized",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Godown updated successfully",
                data: updatedGodown,
            });

        } catch (error: any) {

            // Zod Validation Error
            if (error.errors) {
                return res.status(400).json({
                    success: false,
                    message: error.errors[0].message,
                });
            }

            // Duplicate Key Error
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "Godown already exists",
                });
            }

            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    /* =====================================================
       UPDATE STATUS
    ===================================================== */
    static async updateStatus(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const id = req.params.id as string;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Godown ID",
                });
            }

            const updatedStatusGodown = await Godown.findOne({
                _id: id,
                userId: userId, // only creator can update
            });

            if (!updatedStatusGodown) {
                return res.status(404).json({
                    success: false,
                    message: "Godown not found",
                });
            }

            // Toggle Status
            updatedStatusGodown.status = updatedStatusGodown.status === "active" ? "inactive" : "active";

            await updatedStatusGodown.save();

            return res.status(200).json({
                success: true,
                message: "Status updated successfully",
                data: updatedStatusGodown,
            });

        } catch (error: any) {

            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    static async status(req: Request, res: Response) {
        try {

            const statuses = [
                {
                    label: "ACTIVE",
                    value: "active",
                },
                {
                    label: "INACTIVE",
                    value: "inactive",
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
                message: error.message || "Server Error",
            });
        }
    }
}