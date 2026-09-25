import { Request, Response } from "express";
import Item from '../../models/item/item.Model';
import { AuthRequest } from '../../middleware/auth.middleware'
import { createItemSchema, updateItemSchema } from '../../validations/item/item.Validation';
import { Group } from '../../models/group/group.Model';
import { Unit } from '../../models/unit/unit.Model';
import { Category } from '../../models/category/category.Model';
import { Godown } from '../../models/godown/godown.Model';
import mongoose from 'mongoose';


// ================= CREATE ITEM =================
export const createItem = async (req: AuthRequest, res: Response) => {
    try {
        // ================= GET USER =================
        const user = req.user?.id;

        // ================= VALIDATE DATA =================
        const validationResult =
            createItemSchema.safeParse(req.body);

        // ================= VALIDATION ERROR =================
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors:
                    validationResult.error.errors.map(
                        (err) => ({
                            field: err.path[0],
                            message: err.message,
                        })
                    ),
            });
        }

        // ================= VALIDATED DATA =================
        const validationData = validationResult.data;

        // ================= CHECK SKU EXISTS =================
        const existingItem =
            await Item.findOne({
                userId: user,
                skuCode:
                    validationData.skuCode,
            });

        if (existingItem) {
            return res.status(409).json({
                success: false,
                message:
                    "Item with this SKU already exists",
            });
        }

        // ================= IMAGE =================
        let image = "";

        if (req.file?.path) {
            image = req.file.path;
        }

        // ================= PREPARE ITEM DATA =================
        const itemData = {
            ...validationData,
            userId: user,
            itemPhoto: image,
        };

        // ================= CREATE ITEM =================
        const item = await Item.create(
            itemData
        );

        // ================= SUCCESS RESPONSE =================
        return res.status(201).json({
            success: true,
            message: "Item created successfully",
            data: item,
        });
    } catch (error: any) {
        console.log(
            "Create Item Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Internal Server Error",
        });
    }
};


// ================= GET ITEMS =================
export const getItems = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user?.id;

        // ================= QUERY PARAMS =================
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const search = (req.query.search as string)?.trim();
        const sortBy = (req.query.sortBy as string) || "createdAt";
        const sortDir = (req.query.sortDir as string) === "asc" ? 1 : -1;
        const groupId = (req.query.groupId as string)?.trim(); // optional group filter

        // ================= SEARCH FILTER =================
        // Matches against itemName or skuCode (case-insensitive)
        const searchFilter = search
            ? {
                $or: [
                    { itemName: { $regex: search, $options: "i" } },
                    { skuCode: { $regex: search, $options: "i" } },
                ],
            }
            : {};

        // ================= GROUP FILTER =================
        const groupFilter = groupId
            ? { group: new mongoose.Types.ObjectId(groupId) }
            : {};

        // ================= LOW STOCK FILTER =================
        // sortBy=lowStock → surface items where openingQuantity <= lowStockQuantity
        // Uses $expr so the comparison is between two document fields
        const lowStockFilter =
            sortBy === "lowStock"
                ? {
                    lowStockNotification: true,
                    $expr: {
                        $and: [
                            { $gt: ["$lowStockQuantity", 0] },
                            { $lte: ["$openingQuantity", "$lowStockQuantity"] },
                        ],
                    },
                }
                : {};

        // ================= SORT =================
        const SORT_MAP: Record<string, string> = {
            createdAt: "createdAt",
            itemName: "itemName",
            skuCode: "skuCode",
            group: "group",            // groups items by ObjectId
            lowStock: "openingQuantity",  // asc → lowest stock first
        };

        const sortField = SORT_MAP[sortBy] ?? "createdAt";
        const sortOptions: Record<string, 1 | -1> = {
            [sortField]: sortBy === "lowStock" ? 1 : sortDir, // low stock is always asc
        };

        // Stable secondary sort within the same rank
        if (sortField !== "createdAt") {
            sortOptions["createdAt"] = -1;
        }

        // ================= FINAL QUERY =================
        const query = {
            userId: user,
            isActive: true,
            ...searchFilter,
            ...groupFilter,
            ...lowStockFilter,
        };

        const [items, totalItems] = await Promise.all([
            Item.find(query)
                .skip(skip)
                .limit(limit)
                .sort(sortOptions),
            Item.countDocuments(query),
        ]);

        // ================= RESPONSE =================
        res.status(200).json({
            success: true,
            message: "Items fetched successfully",
            data: items,
            pagination: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                pageSize: limit,
            },
        });

    } catch (error) {
        console.log("Get Items Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


// ================= UPDATE ITEMS =================
export const updateItem = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user?.id;

        // ================= VALIDATE BODY =================
        const validationResult = updateItemSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: validationResult.error.format(),
            });
        }

        // ================= BUILD UPDATE PAYLOAD =================
        const updateData: any = {
            ...validationResult.data,
        };

        // ================= HANDLE IMAGE =================
        if (req.file?.path) {
            updateData.itemPhoto = req.file.path;
        }

        // ================= UPDATE =================
        const updatedItem = await Item.findOneAndUpdate(
            {
                _id: id,
                userId: user,
            },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedItem) {
            return res.status(404).json({
                success: false,
                message: "Item not found or unauthorized",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Item updated successfully",
            data: updatedItem,
        });

    } catch (error) {
        console.log("Update Item Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


// ================= UPDATE ITEM STATUS =================
export const updateItemStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user?.id;

        // ================= FIND ITEM =================
        const item = await Item.findOne({
            _id: id,
            userId: user,
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found",
            });
        }

        // ================= TOGGLE STATUS =================
        item.isActive = !item.isActive;

        // ================= SAVE =================
        await item.save();

        // ================= RESPONSE =================
        return res.status(200).json({
            success: true,
            message: "Item status updated successfully",
            data: item.isActive,
        });

    } catch (error) {
        console.log("Update Status Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


export const group = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user?.id;

        const allGroup = await Group.find({
            status: "active",
            userId: user,
        });

        return res.status(200).json({
            success: true,
            message: allGroup.length
                ? "Groups fetched successfully"
                : "No groups found",
            data: allGroup,
        });

    } catch (error) {
        console.log("Group Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


export const categories = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user?.id;

        const allCategories = await Category.find({
            status: "active",
            userId: user,
        });

        return res.status(200).json({
            success: true,
            message: allCategories.length
                ? "Categories fetched successfully"
                : "No categories found",
            data: allCategories,

        });

    } catch (error) {
        console.log("Category Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


export const godown = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user?.id;

        const allGodown = await Godown.find({
            status: "active",
            userId: user,
        });

        return res.status(200).json({
            success: true,
            message: allGodown.length
                ? "Godown fetched successfully"
                : "No godown found",
            data: allGodown,
        });

    } catch (error) {
        console.log("Godown Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


export const unit = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user?.id;

        const allUnits = await Unit.find({
            status: "active",
            userId: user,
        });

        return res.status(200).json({
            success: true,
            message: allUnits.length
                ? "Units fetched successfully"
                : "No units found",
            data: allUnits,
        });

    } catch (error) {
        console.log("Unit Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};
