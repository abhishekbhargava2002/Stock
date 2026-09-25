import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { Category } from "../../models/category/category.Model";
import { createCategorySchema, updateCategorySchema } from "../../validations/category/category.Validation";
import { Group } from "../../models/group/group.Model";


export const createCategory = async (req: AuthRequest, res: Response) => {
    try {
        // Validate request body
        const validatedData = createCategorySchema.safeParse(req.body);

        if (!validatedData.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors:
                    validatedData.error.flatten().fieldErrors,
            });
        }

        const {
            categoryName,
            description,
            group,
            parentCategory,
            status,
        } = validatedData.data;

        const userId = req.user?.id;

        /*
        |--------------------------------------------------------------------------
        | Check duplicate category
        |--------------------------------------------------------------------------
        */

        const existingCategory =
            await Category.findOne({
                categoryName:
                    categoryName.toLowerCase(),
                group,
                parentCategory:
                    parentCategory || null,
                userId,
            });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message:
                    "Category already exists under this parent/group",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Validate parent category
        |--------------------------------------------------------------------------
        */

        if (parentCategory) {
            const parent =
                await Category.findById(
                    parentCategory
                );

            if (!parent) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Parent category not found",
                });
            }

            // Parent must belong to same group
            if (
                parent.group.toString() !==
                group
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Parent category must belong to same group",
                });
            }

            // Inactive parent cannot have active child
            if (
                parent.status === "inactive" &&
                status === "active"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Inactive parent category cannot have active child category",
                });
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Create category
        |--------------------------------------------------------------------------
        */

        const category =
            await Category.create({
                categoryName,
                description,
                group,
                parentCategory:
                    parentCategory || null,
                status,
                userId,
            });

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category,
        });
    } catch (error: any) {
        console.log("Create Category Error:", error);

        // Mongo duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Category already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


export const getAllCategory = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;
        const categories = await Category.find()
            .populate("group", "groupName")
            .populate(
                "parentCategory",
                "categoryName"
            )
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalCategories = await Category.countDocuments();

        const totalPages = Math.ceil(
            totalCategories / limit
        );

        return res.status(200).json({
            success: true,
            message: "Get All Categories",
            data: categories,

            pagination: {
                currentPage: page,
                totalPages,
                totalCategories,
                limit,
                hasNextPage:
                    page < totalPages,
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        console.log("Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


export const updateCategory = async (req: AuthRequest, res: Response) => {
    try {

        const validatedData = updateCategorySchema.safeParse(req.body);

        if (!validatedData.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors:
                    validatedData.error.flatten().fieldErrors,
            });
        }

        const categoryId = req.params.id;
        const userId = req.user?.id;

        const category = await Category.findOne({
            _id: categoryId,
            userId,
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message:
                    "Category not found",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Prepare Updated Data
        |--------------------------------------------------------------------------
        */

        const updatedData = {
            categoryName:
                validatedData.data
                    .categoryName ??
                category.categoryName,

            description:
                validatedData.data
                    .description ??
                category.description,

            group:
                validatedData.data.group ??
                category.group,

            parentCategory:
                validatedData.data
                    .parentCategory ??
                category.parentCategory,

            status:
                validatedData.data
                    .status ??
                category.status,
        };

        /*
        |--------------------------------------------------------------------------
        | Parent category cannot be itself
        |--------------------------------------------------------------------------
        */

        if (updatedData.parentCategory && updatedData.parentCategory.toString() === categoryId) {
            return res.status(400).json({
                success: false,
                message: "Parent category cannot be itself",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Parent Category
        |--------------------------------------------------------------------------
        */

        if (updatedData.parentCategory) {
            const parentCategory =
                await Category.findById(
                    updatedData.parentCategory
                );

            if (!parentCategory) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Parent category not found",
                });
            }

            // Parent must belong to same group
            if (
                parentCategory.group.toString() !==
                updatedData.group.toString()
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Parent category must belong to same group",
                });
            }

            // Inactive parent cannot have active child
            if (
                parentCategory.status ===
                "inactive" &&
                updatedData.status ===
                "active"
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Inactive parent category cannot have active child category",
                });
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Duplicate Check
        |--------------------------------------------------------------------------
        */

        const existingCategory =
            await Category.findOne({
                _id: { $ne: categoryId },

                categoryName:
                    updatedData.categoryName.toLowerCase(),

                group: updatedData.group,

                parentCategory:
                    updatedData.parentCategory ||
                    null,

                userId,
            });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message:
                    "Category already exists under this parent/group",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Update Category
        |--------------------------------------------------------------------------
        */

        const updatedCategory =
            await Category.findByIdAndUpdate(
                categoryId,
                updatedData,
                {
                    new: true,
                    runValidators: true,
                }
            );

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: updatedCategory,
        });
    } catch (error: any) {
        console.log(
            "Update Category Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


export const dropDownCategoryParent = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        const parentcategories = await Category.find({ status: "active", userId })
            .select("_id categoryName")
            .sort({ categoryName: 1 })
            .lean();

        return res.status(200).json({
            success: true,
            message:
                "Get all parent categories",
            data: parentcategories,
        });
    } catch (error) {
        console.log(
            "Category Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Internal server error",
        });
    }
};


export const dropDownGroup = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        const group = await Group.find({ status: "active", userId })
            .select("_id groupName")
            .sort({ groupName: 1 })
            .lean();

        return res.status(200).json({
            success: true,
            message: "Get all groups",
            data: group,
        });

    } catch (error) {
        console.log("Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
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