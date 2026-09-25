import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import Item from "../../models/item/item.Model";
import { Vendor } from "../../models/vendor/vendor.Model";


export const getAllMasters = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user?.id;

        const page = Math.max(Number(req.query.page) || 1, 1);

        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

        const search = (req.query.search as string)?.trim() || "";

        const type = (req.query.type as string)?.toUpperCase() || "ITEM";

        const status = (req.query.status as string)?.toUpperCase() || "ALL";

        const skip = (page - 1) * limit;


        const validTypes = ["ITEM", "VENDOR"];

        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid type. Use ITEM or VENDOR",
            });
        }


        let statusFilter = {};

        if (status === "ACTIVE") {
            statusFilter = { isActive: true };
        }

        if (status === "INACTIVE") {
            statusFilter = { isActive: false };
        }

        let Model: any;
        let searchFilter = {};


        if (type === "ITEM") {
            Model = Item;

            searchFilter = search
                ? {
                    $or: [
                        {
                            itemName: {
                                $regex: search,
                                $options: "i",
                            },
                        },
                        {
                            skuCode: {
                                $regex: search,
                                $options: "i",
                            },
                        },
                    ],
                }
                : {};
        }

        if (type === "VENDOR") {
            Model = Vendor;

            searchFilter = search
                ? {
                    $or: [
                        {
                            vendorName: {
                                $regex: search,
                                $options: "i",
                            },
                        },
                        {
                            phoneNumber: {
                                $regex: search,
                                $options: "i",
                            },
                        },
                    ],
                }
                : {};
        }

        const filter = {
            userId: user,
            ...statusFilter,
            ...searchFilter,
        };

        const totalItems = await Model.countDocuments(filter);
        
        const data = await Model.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            message: `${type} fetched successfully`,

            filters: {
                type,
                status,
                search,
            },

            pagination: {
                currentPage: page,
                totalPages: Math.ceil(
                    totalItems / limit
                ),
                totalItems,
                limit,
            },

            data,
        });
    } catch (error) {
        console.log("Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
