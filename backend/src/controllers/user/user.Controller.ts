import mongoose from "mongoose";
import { Request, Response } from "express";
import { User } from "../../models/user/user.model";
import { updateUserSchema } from '../../validations/user/user.Validation'

export const getAllUser = async (req: Request, res: Response) => {
    try {

        // Query Params
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        // Skip Calculation
        const skip = (page - 1) * limit;

        // Total Users Count
        const totalUsers = await User.countDocuments();

        // Fetch Users
        const users = await User.find()
            .select("-password -organization -facility")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        // Total Pages
        const totalPages = Math.ceil(totalUsers / limit);

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",

            pagination: {
                totalUsers,
                totalPages,
                currentPage: page,
                perPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },

            data: users,
        });

    } catch (error) {
        console.log("Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


export const getByIdUser = async (req: Request, res: Response) => {
    try {

        const id = req.params.id as string;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid User ID",
            });
        }

        // Find User
        const user = await User.findById(id).select("-password -organization -facility");

        // User Not Found
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: user,
        });

    } catch (error) {
        console.log("Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


export const updateUser = async (req: Request, res: Response) => {
    try {

        const id = req.params.id as string;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid User ID",
            });
        }

        // Validate Request Body
        const validatedData = updateUserSchema.safeParse(req.body);

        // Zod Validation Error
        if (!validatedData.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validatedData.error.errors,
            });
        }

        // Find User
        const user = await User.findById(id);

        // User Not Found
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check Duplicate Email
        if (validatedData.data.email) {

            const existingEmail = await User.findOne({
                email: validatedData.data.email,
                _id: { $ne: id },
            });

            if (existingEmail) {
                return res.status(409).json({
                    success: false,
                    message: "Email already exists",
                });
            }
        }

        // Check Duplicate Phone
        if (validatedData.data.phone) {

            const existingPhone = await User.findOne({
                phone: validatedData.data.phone,
                _id: { $ne: id },
            });

            if (existingPhone) {
                return res.status(409).json({
                    success: false,
                    message: "Phone number already exists",
                });
            }
        }

        // Update User
        const updatedUser = await User.findByIdAndUpdate(
            id,
            validatedData.data,
            {
                new: true,
                runValidators: true,
            }
        ).select("-password");

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser,
        });

    } catch (error) {

        console.log("Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


export const toggleStatusUser = async (req: Request, res: Response) => {
    try {

        const id = req.params.id as string;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid User ID",
            });
        }

        // Find User
        const user = await User.findById(id);

        // User Not Found
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Toggle Status
        user.status =
            user.status === "active"
                ? "inactive"
                : "active";

        // Save Updated Status
        await user.save();

        return res.status(200).json({
            success: true,
            message: `User ${user.status} successfully`,
            data: user,
        });

    } catch (error) {

        console.log("Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};