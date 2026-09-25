import mongoose from "mongoose";
import { Request, Response } from "express";
import { AuthRequest } from "../../../middleware/auth.middleware";
import { StockLedger } from "../../../models/stock/stockLedger/stockLedger.Model";
import { createStockOutSchema, } from "../../../validations/stock/stockOut/stockOut.Validation";
import { User } from "../../../models/user/user.model";
import { StockOut } from '../../../models/stock/stockOut/stockOut.Model';
import Item from '../../../models/item/item.Model'
import { Vendor } from "../../../models/vendor/vendor.Model";
import { Godown } from "../../../models/godown/godown.Model";


export const create = async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        if (!req.user?.id) {
            await session.abortTransaction();
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const user = await User.findById(req.user.id).session(session);

        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // ============================
        // ✅ HANDLE MULTIPART ITEMS
        // ============================
        if (req.body.items && typeof req.body.items === "string") {
            req.body.items = JSON.parse(req.body.items);
        }

        if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Items are required",
            });
        }

        const validatedData = createStockOutSchema.parse(req.body);

        const {
            godownId,
            vendorId,
            items,
            vehicleNumber,
            driverName,
            driverPhone,
        } = validatedData;

        const godownObjectId = new mongoose.Types.ObjectId(godownId);

        let invoiceFile = "";
        if (req.file) {
            invoiceFile = req.file.path;
        }

        const stockOutNumber = `SO-${Date.now()}`;

        for (const stockItem of items) {
            const item = await Item.findOne({
                _id: stockItem.itemId,
                skuCode: stockItem.sku,
                isActive: true,
            }).session(session);

            if (!item) {
                await session.abortTransaction();
                return res.status(404).json({
                    success: false,
                    message: `Item not found for SKU: ${stockItem.sku}`,
                });
            }
        }

        const stockOut = new StockOut({
            organizationId: user.organization,
            facilityId: user.facility,
            godownId,
            vendorId,
            items,
            vehicleNumber,
            driverName,
            driverPhone,
            invoiceFile,
            createdBy: user._id,
        });

        await stockOut.save({ session });



        for (const item of items) {
            const itemObjectId = new mongoose.Types.ObjectId(item.itemId);

            const lastLedger = await StockLedger.findOne({
                organizationId: user.organization,
                facilityId: user.facility,
                itemId: itemObjectId,
                godownId: godownObjectId,
            })
                .sort({ transactionDate: -1, _id: -1 })
                .session(session);

            const availableQty = lastLedger?.balanceQuantity || 0;

            if (item.quantity > availableQty) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: `${item.sku} insufficient stock`,
                });
            }

            const newBalance = availableQty - item.quantity;

            await StockLedger.create(
                [
                    {
                        organizationId: user.organization,
                        facilityId: user.facility,
                        itemId: itemObjectId,
                        sku: item.sku,
                        unitId: item.unitId,
                        godownId: godownObjectId,

                        transactionType: "STOCK_OUT",

                        referenceId: stockOut._id,
                        referenceModel: "StockOut",
                        referenceNumber: stockOut.stockOutNumber,

                        quantityIn: 0,
                        quantityOut: item.quantity,
                        balanceQuantity: newBalance,

                        transactionDate: new Date(),
                        createdBy: user._id,
                    },
                ],
                { session }
            );
        }
        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: "Stock Out created successfully",
            data: stockOut,
        });

    } catch (error: any) {
        await session.abortTransaction();

        console.log("CREATE STOCK OUT ERROR:", error);

        // ✅ ZOD ERROR
        if (error.name === "ZodError") {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: error.errors,
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: Object.values(error.errors).map((err: any) => ({
                    field: err.path,
                    message: err.message,
                })),
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });

    } finally {
        session.endSession();
    }
};


export const getAll = async (req: AuthRequest, res: Response) => {
    try {
        const { page = 1, limit = 10, status } = req.query as any;

        const skip = (Number(page) - 1) * Number(limit);

        const filter: any = {};

        if (status && ["completed", "cancelled"].includes(status)) {
            filter.status = status;
        }

        const [data, total] = await Promise.all([
            StockOut.find(filter)
                .populate("godownId", "name")
                .populate("vendorId", "vendorName")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),

            StockOut.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            message: "Stock Out fetched successfully",
            data,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const getById = async (req: AuthRequest, res: Response) => {
    try {
        const stockOut = await StockOut.findById(req.params.id)
            .populate("godownId", "godownName address")
            .populate("vendorId", "vendorName phoneNumber email")
            .populate("items.itemId", "name skuCode")
            .populate("items.unitId", "name");

        if (!stockOut) {
            return res.status(404).json({
                success: false,
                message: "Stock Out not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Stock Out fetched successfully",
            data: stockOut,
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const cancel = async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const stockOut = await StockOut.findById(req.params.id).session(session);

        if (!stockOut) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Stock Out not found",
            });
        }

        if (stockOut.status === "cancelled") {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Already cancelled",
            });
        }

        for (const item of stockOut.items) {
            const lastLedger = await StockLedger.findOne({
                itemId: item.itemId,
                godownId: stockOut.godownId,
            }).sort({ createdAt: -1 }).session(session);

            const currentBalance = lastLedger?.balanceQuantity || 0;
            const newBalance = currentBalance + item.quantity;

            await StockLedger.create([{
                organizationId: stockOut.organizationId,
                facilityId: stockOut.facilityId,
                itemId: item.itemId,
                sku: item.sku,
                unitId: item.unitId,
                godownId: stockOut.godownId,

                transactionType: "REVERSAL",
                referenceId: stockOut._id,
                referenceModel: "StockOut",
                referenceNumber: stockOut.stockOutNumber,

                quantityIn: item.quantity,
                quantityOut: 0,
                balanceQuantity: newBalance,

                transactionDate: new Date(),
                createdBy: req.user!.id,
            }], { session });
        }

        stockOut.status = "cancelled";
        await stockOut.save({ session });

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Stock Out cancelled successfully",
        });

    } catch (error: any) {
        await session.abortTransaction();

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    } finally {
        session.endSession();
    }
};


export const vendorDropDown = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user?.id;

        const vendors = await Vendor.find({
            status: "active",
            userId: user,
        })
            .select("_id vendorName")
            .sort({ vendorName: 1 });

        return res.status(200).json({
            success: true,
            message: "Vendors fetched successfully",
            data: vendors,
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch vendors",
        });
    }
};


export const godownDropDown = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user?.id;

        const godowns = await Godown.find({
            status: "active",
            userId: user,
        })
            .select("_id godownName")
            .sort({ name: 1 });

        return res.status(200).json({
            success: true,
            message: "Godowns fetched successfully",
            data: godowns,
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch godowns",
        });
    }
};


export const lastLedger = async (req: AuthRequest, res: Response) => {
    try {
        const { page = 1, limit = 10 } = req.query as any;

        const skip = (Number(page) - 1) * Number(limit);

        const filter = {
            referenceModel: "StockOut",
            createdBy: req.user?.id,
        };


        const data = await StockLedger.find(filter)
            .sort({ transactionDate: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await StockLedger.countDocuments(filter);

        const totalPages = Math.ceil(total / Number(limit));


        return res.status(200).json({
            success: true,
            message: "Ledger history fetched successfully",
            data,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages,
            },
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Server Error",
        });
    }
};


export const stockOutLastLedger = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const lastLedger = await StockLedger.find({
            referenceId: id,
            referenceModel: "StockOut",
            createdBy: user?.id,
        })
            .sort({ transactionDate: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            message: "Last ledger fetched successfully",
            data: lastLedger || null,
        });

    } catch (error: any) {
        console.log("GET LAST LEDGER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};


export const status = async (req: AuthRequest, res: Response) => {
    try {
        const STATUS_OPTIONS = [
            { label: "Completed", value: "completed" },
            { label: "Cancelled", value: "cancelled" },
        ];

        return res.status(200).json({
            success: true,
            message: "Status fetched successfully",
            data: STATUS_OPTIONS,
        });
    } catch (error) {
        console.log("GET LAST LEDGER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}