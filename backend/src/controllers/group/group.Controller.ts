import mongoose from "mongoose";
import { ZodError } from "zod";
import { Request, Response } from "express";
import { AuthRequest } from '../../middleware/auth.middleware'
import { Group } from "../../models/group/group.Model";
import { createGroupSchema, updateGroupSchema } from "../../validations/group/group.validation";


export const createGroup = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const user = req.user;
        console.log(user);

        const validatedData = createGroupSchema.parse(req.body);

        const existingGroup = await Group.findOne({
            userId: user.id,
            groupName: validatedData.groupName,
        });

        if (existingGroup) {
            return res.status(400).json({
                success: false,
                message: "Group already exists",
            });
        }

        const group = await Group.create({
            userId: user.id,
            groupName: validatedData.groupName,
            description: validatedData.description,
            status: validatedData.status,
        });

        return res.status(201).json({
            success: true,
            message: "Group created successfully",
            data: group,
        });

    } catch (error: any) {

        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                errors: error.errors.map((err) => ({
                    field: err.path[0],
                    message: err.message,
                })),
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Group already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};


export const getAllGroups = async (req: Request, res: Response) => {
    try {

        // ── Query Params ───────────────────────────────────────
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const search = (req.query.search as string) || "";
        const status = (req.query.status as string) || "";

        // ── Pagination ─────────────────────────────────────────
        const skip = (page - 1) * limit;

        // ── Filter Object ──────────────────────────────────────
        const filter: any = {};

        // Search by groupName
        if (search) {
            filter.groupName = {
                $regex: search,
                $options: "i",
            };
        }

        // Filter by status
        if (status) {
            filter.status = status;
        }

        // ── Get Groups ─────────────────────────────────────────
        const groups = await Group.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        // ── Total Count ────────────────────────────────────────
        const totalGroups = await Group.countDocuments(filter);

        // ── Response ───────────────────────────────────────────
        return res.status(200).json({
            success: true,
            pagination: {
                total: totalGroups,
                page,
                limit,
                totalPages: Math.ceil(totalGroups / limit),
            },
            filters: {
                search,
                status,
            },
            data: groups,
        });

    } catch (error: any) {
        console.log("Error: ", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });

    }
};


export const updateGroup = async (req: Request, res: Response) => {
    try {

        // ── Get Group ID ───────────────────────────────────────
        const { id } = req.params;

        // ── Validate Request Body ──────────────────────────────
        const validatedData = updateGroupSchema.parse(req.body);

        // ── Check Group Exists ─────────────────────────────────
        const existingGroup = await Group.findById(id);

        if (!existingGroup) {
            return res.status(404).json({
                success: false,
                message: "Group not found",
            });
        }

        // ── Check Duplicate Group Name ─────────────────────────
        const duplicateGroup = await Group.findOne({
            _id: { $ne: id },
            groupName: validatedData.groupName,
        });

        if (duplicateGroup) {
            return res.status(400).json({
                success: false,
                message: "Group name already exists",
            });
        }

        // ── Update Group ───────────────────────────────────────
        const updatedGroup = await Group.findByIdAndUpdate(
            id,
            {
                groupName: validatedData.groupName,
                description: validatedData.description,
                status: validatedData.status,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        // ── Success Response ───────────────────────────────────
        return res.status(200).json({
            success: true,
            message: "Group updated successfully",
            data: updatedGroup,
        });

    } catch (error: any) {

        // ── Zod Validation Error ───────────────────────────────
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                errors: error.errors.map((err) => ({
                    field: err.path[0],
                    message: err.message,
                })),
            });
        }

        // ── Invalid MongoDB ObjectId ───────────────────────────
        if (error instanceof mongoose.Error.CastError) {
            return res.status(400).json({
                success: false,
                message: "Invalid group ID",
            });
        }

        // ── Duplicate Key Error ────────────────────────────────
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Group already exists",
            });
        }

        // ── Internal Server Error ──────────────────────────────
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });

    }
};


// ── Update Group Status ───────────────────────────────────
export const updateGroupStatus = async (req: Request, res: Response) => {
    try {

        const { id } = req.params;

        // ── Find Group ─────────────────────────────────────────
        const existingGroup = await Group.findById(id);

        if (!existingGroup) {
            return res.status(404).json({
                success: false,
                message: "Group not found",
            });
        }

        // ── Toggle Status ──────────────────────────────────────
        const status =
            existingGroup.status === "active"
                ? "inactive"
                : "active";

        // ── Update Status ──────────────────────────────────────
        existingGroup.status = status;

        await existingGroup.save();

        // ── Response ───────────────────────────────────────────
        return res.status(200).json({
            success: true,
            message: "Group status updated successfully",
            data: existingGroup,
        });

    } catch (error: any) {

        // ── Invalid MongoDB ID ─────────────────────────────────
        if (error instanceof mongoose.Error.CastError) {
            return res.status(400).json({
                success: false,
                message: "Invalid group ID",
            });
        }

        // ── Internal Server Error ──────────────────────────────
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });

    }
};



export const status = async (req: Request, res: Response) => {
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
            data: statuses,
        });

    } catch (error) {

        console.log("Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });

    }
};