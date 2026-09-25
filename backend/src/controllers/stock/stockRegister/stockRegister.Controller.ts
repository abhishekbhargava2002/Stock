import mongoose from "mongoose";
import { Request, Response } from "express";
import { AuthRequest } from "../../../middleware/auth.middleware";
import { StockLedger } from '../../../models/stock/stockLedger/stockLedger.Model';
import { Godown } from "../../../models/godown/godown.Model";
import { Facility } from "../../../models/facilities/facilities.model";
import { User } from '../../../models/user/user.model';
import Item from "../../../models/item/item.Model";


export const dashBoard = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user?.id;

        const ledger = await StockLedger.find({
            createdBy: user,
        });

        const dashboard = ledger.reduce(
            (acc, item) => {
                acc[item.referenceModel] = (acc[item.referenceModel] || 0) + 1;

                return acc;
            },
            {
                StockIn: 0,
                StockOut: 0,
                StockTransfer: 0,
                ManualAdjustment: 0,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Dashboard fetched successfully",
            data: dashboard,
        });
    } catch (error: any) {
        console.log("DASHBOARD ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
};



export const getAllStockLedgers = async (req: AuthRequest, res: Response) => {
    try {
        const {
            page = 1,
            limit = 10,
            godownId,
            facilityId,
            transactionType,
            search,
        } = req.query as any;

        const skip = (Number(page) - 1) * Number(limit);

        const filter: any = {
            createdBy: req.user?.id,
        };

        if (godownId) filter.godownId = godownId;
        if (facilityId) filter.facilityId = facilityId;
        if (transactionType) filter.transactionType = transactionType;

        // 🔥 SEARCH BY ITEM NAME / SKU
        if (search) {
            const items = await Item.find({
                $or: [
                    { itemName: { $regex: search, $options: "i" } },
                    { skuCode: { $regex: search, $options: "i" } },
                ],
            }).select("_id");

            const itemIds = items.map((item) => item._id);

            filter.itemId = { $in: itemIds };
        }

        const [data, total] = await Promise.all([
            StockLedger.find(filter)
                .populate("itemId", "_id itemName skuCode")
                .populate("godownId", "_id godownName")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),

            StockLedger.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(total / Number(limit));

        return res.status(200).json({
            success: true,
            message: "Stock ledger fetched successfully",
            data,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages,
            },
        });

    } catch (error: any) {
        console.log("GET STOCK LEDGER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
};


export const getStockLedgerById = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ID",
            });
        }

        const data = await StockLedger.findOne({
            _id: id,
            createdBy: req.user?.id,

        })
            .populate("itemId")
            .populate("godownId")
            .populate("createdBy");

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Stock ledger not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Stock ledger fetched successfully",
            data,
        });

    } catch (error: any) {
        console.log("GET STOCK LEDGER BY ID ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
};


export const godownDropDown = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user?.id;
        const godown = await Godown.find({
            status: "active",
            userId: user
        }).select("_id godownName");
        return res.status(200).json({
            success: true,
            message: "Godown dropdown fetched successfully",
            data: godown,
        });
    } catch (error) {
        console.log("Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


export const facilitiesDropDown = async (req: AuthRequest, res: Response) => {
    try {
        // const user = req.user?.id;
        const user = await User.findById(req.user?.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "user not found",
            })
        }
        const organizationId = user.organization;

        const facilities = await Facility.find({
            organization: organizationId,
            status: "active",
        }).select("_id name");

        return res.status(200).json({
            success: true,
            message: "Facilities dropdown fetched successfully",
            data: facilities,
        });
    } catch (error) {
        console.log("Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


export const transactionTypeDropDown = async (req: Request, res: Response) => {
    try {
        const data = [
            { label: "Stock In", value: "STOCK_IN" },
            { label: "Stock Out", value: "STOCK_OUT" },
            { label: "Transfer In", value: "TRANSFER_IN" },
            { label: "Transfer Out", value: "TRANSFER_OUT" },
            { label: "Adjustment", value: "ADJUSTMENT" },
            { label: "Sale", value: "SALE" },
            { label: "Purchase Return", value: "PURCHASE_RETURN" },
            { label: "Reversal", value: "REVERSAL" },
            { label: "Manual Adjustment", value: "MANUAL_ADJUSTMENT" },
        ];

        return res.status(200).json({
            success: true,
            message: "Stock model dropdown fetched successfully",
            data,
        });

    } catch (error) {
        console.log("Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};