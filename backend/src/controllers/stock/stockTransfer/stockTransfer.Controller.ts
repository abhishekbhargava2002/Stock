import mongoose from "mongoose";
import { Request, Response } from "express";
import { AuthRequest } from "../../../middleware/auth.middleware";
import StockTransfer from '../../../models/stock/stockTransfer/stockTransfer.Model';
import { StockLedger } from '../../../models/stock/stockLedger/stockLedger.Model';
import { Godown } from "../../../models/godown/godown.Model";
import Item from "../../../models/item/item.Model";
import { Unit } from "../../../models/unit/unit.Model";
import { User } from '../../../models/user/user.model'
import { createStockTransferSchema } from '../../../validations/stock/stockTransfer/stockTransfer.Validation';


export const create = async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // ============================
        // ✅ USER CHECK
        // ============================
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
        // ✅ VALIDATION
        // ============================
        const validatedData = createStockTransferSchema.parse(req.body);

        const {
            sourceGodownId,
            destinationGodownId,
            items,
            vehicleNumber,
            driverName,
            driverPhone,
        } = validatedData;


        if (sourceGodownId === destinationGodownId) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Source and destination godown cannot be same",
            });
        }

        // ============================
        // ✅ ITEM VALIDATION
        // ============================
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

        // ============================
        // ✅ CREATE TRANSFER
        // ============================
        const transferDocs = await StockTransfer.create(
            [
                {
                    organizationId: user.organization,
                    facilityId: user.facility,
                    sourceGodownId,
                    destinationGodownId,
                    vehicleNumber,
                    driverName,
                    driverPhone,
                    items,
                    createdBy: user._id,
                },
            ],
            { session }
        );

        const transfer = transferDocs[0];

        for (const item of items) {
            const lastSource = await StockLedger.findOne({
                organizationId: user.organization,
                facilityId: user.facility,
                itemId: item.itemId,
                godownId: sourceGodownId, // ✅ FIXED
            })
                .sort({ createdAt: -1 })
                .session(session);

            const availableQty = lastSource?.balanceQuantity || 0;

            console.log(item.transferQty, " ", availableQty)

            if (item.transferQty > availableQty) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: `${item.sku} insufficient stock`,
                });
            }

            const newSourceBalance = availableQty - item.transferQty;

            // ============================
            // 🔴 LEDGER OUT
            // ============================
            await StockLedger.create(
                [
                    {
                        organizationId: user.organization,
                        facilityId: user.facility,
                        itemId: item.itemId,
                        sku: item.sku,
                        unitId: item.unit,
                        godownId: sourceGodownId,

                        transactionType: "TRANSFER_OUT",

                        referenceId: transfer._id,
                        referenceModel: "StockTransfer",
                        referenceNumber: transfer.stockTransferNumber,

                        quantityIn: 0,
                        quantityOut: item.transferQty,
                        balanceQuantity: newSourceBalance,

                        transactionDate: new Date(),
                        createdBy: user._id,
                    },
                ],
                { session }
            );

            // ============================
            // 🟢 DESTINATION BALANCE
            // ============================
            const lastDest = await StockLedger.findOne({
                organizationId: user.organization,
                facilityId: user.facility,
                itemId: item.itemId,
                godownId: destinationGodownId,
            })
                .sort({ createdAt: -1 })
                .session(session);

            const destBalance = lastDest?.balanceQuantity || 0;
            const newDestBalance = destBalance + item.transferQty;

            // ============================
            // 🟢 LEDGER IN
            // ============================
            await StockLedger.create(
                [
                    {
                        organizationId: user.organization,
                        facilityId: user.facility,
                        itemId: item.itemId,
                        sku: item.sku,
                        unitId: item.unit,
                        godownId: destinationGodownId,

                        transactionType: "TRANSFER_IN",

                        referenceId: transfer._id,
                        referenceModel: "StockTransfer",
                        referenceNumber: transfer.stockTransferNumber,

                        quantityIn: item.transferQty,
                        quantityOut: 0,
                        balanceQuantity: newDestBalance,

                        transactionDate: new Date(),
                        createdBy: user._id,
                    },
                ],
                { session }
            );
        }

        // ============================
        // ✅ COMMIT
        // ============================
        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: "Stock Transfer created successfully",
            data: transfer,
        });

    } catch (error: any) {
        await session.abortTransaction();

        console.log("CREATE STOCK TRANSFER ERROR:", error);

        if (error.name === "ZodError") {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: error.errors,
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

        if (status) {
            if (Array.isArray(status)) {
                filter.status = { $in: status };
            } else {
                filter.status = status;
            }
        }

        const [data, total] = await Promise.all([
            StockTransfer.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),

            StockTransfer.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            message: "Stock Transfer fetched successfully",
            data,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });

    } catch (error: any) {
        console.log("GET ALL STOCK TRANSFER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};


export const getById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const transfer = await StockTransfer.findById(id)
            .populate("sourceGodownId", "name")
            .populate("destinationGodownId", "name")
            .populate("createdBy", "name");

        if (!transfer) {
            return res.status(404).json({
                success: false,
                message: "Stock Transfer not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Stock Transfer fetched successfully",
            data: transfer,
        });

    } catch (error: any) {
        console.log("GET BY ID ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};


export const cancel = async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { id } = req.params;

        if (!req.user?.id) {
            await session.abortTransaction();
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const transfer = await StockTransfer.findOne({
            _id: id,
            createdBy: req.user?.id,
        }).session(session);

        if (!transfer) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Stock Transfer not found",
            });
        }

        if (transfer.status === "cancelled") {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Already cancelled",
            });
        }

        // ============================
        // 🔁 REVERSE STOCK
        // ============================
        for (const item of transfer.items) {

            // 👉 SOURCE (ADD BACK)
            const lastSource = await StockLedger.findOne({
                itemId: item.itemId,
                godownId: transfer.sourceGodownId,
                createdBy: req.user?.id,
            }).sort({ createdAt: -1 }).session(session);

            const sourceBalance = lastSource?.balanceQuantity || 0;
            const newSourceBalance = sourceBalance + item.transferQty;

            await StockLedger.create([{
                organizationId: transfer.organizationId,
                facilityId: transfer.facilityId,
                itemId: item.itemId,
                sku: item.sku,
                unitId: item.unit,
                godownId: transfer.sourceGodownId,

                transactionType: "REVERSAL",

                referenceId: transfer._id,
                referenceModel: "StockTransfer",
                referenceNumber: transfer.stockTransferNumber,

                quantityIn: item.transferQty,
                quantityOut: 0,
                balanceQuantity: newSourceBalance,

                transactionDate: new Date(),
                createdBy: req.user.id,
            }], { session });


            // 👉 DESTINATION (REMOVE)
            const lastDest = await StockLedger.findOne({
                itemId: item.itemId,
                godownId: transfer.destinationGodownId,
            }).sort({ createdAt: -1 }).session(session);

            const destBalance = lastDest?.balanceQuantity || 0;

            if (item.transferQty > destBalance) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: `Cannot cancel, insufficient stock in destination`,
                });
            }

            const newDestBalance = destBalance - item.transferQty;

            await StockLedger.create([{
                organizationId: transfer.organizationId,
                facilityId: transfer.facilityId,
                itemId: item.itemId,
                sku: item.sku,
                unitId: item.unit,
                godownId: transfer.destinationGodownId,

                transactionType: "REVERSAL",

                referenceId: transfer._id,
                referenceModel: "StockTransfer",
                referenceNumber: transfer.stockTransferNumber,


                quantityIn: 0,
                quantityOut: item.transferQty,
                balanceQuantity: newDestBalance,

                transactionDate: new Date(),
                createdBy: req.user.id,
            }], { session });
        }

        // ============================
        // ✅ UPDATE STATUS
        // ============================
        transfer.status = "cancelled";
        transfer.cancellationReason = "Cancelled by user";
        await transfer.save({ session });

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Stock Transfer cancelled successfully",
        });

    } catch (error: any) {
        await session.abortTransaction();

        console.log("CANCEL ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });

    } finally {
        session.endSession();
    }
};


export const dropDownGodown = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user?.id;
        const godown = await Godown.find({ status: "active", userId: user }).select("_id godownName");

        return res.status(200).json({
            success: true,
            message: "Godown dropdown fetched successfully",
            data: godown,
        });

    } catch (error: any) {
        console.log("DROPDOWN GODOWN ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};


export const dropDownItem = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user?.id;
        const item = await Item.find({ userId: user, isActive: true }).select("_id itemName skuCode");

        return res.status(200).json({
            success: true,
            message: "Item dropdown fetched successfully",
            data: item,
        });

    } catch (error: any) {
        console.log("DROPDOWN ITEM ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};


export const dropDownUnit = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user?.id;
        const unit = await Unit.find({ status: "active", userId: user }).select("_id unitName shortCode");

        return res.status(200).json({
            success: true,
            message: "Unit dropdown fetched successfully",
            data: unit,
        });

    } catch (error: any) {
        console.log("DROPDOWN UNIT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};


export const lastLedger = async (req: AuthRequest, res: Response) => {
    try {
        const { page = 1, limit = 10 } = req.query as any;

        const skip = (Number(page) - 1) * Number(limit);

        const filter = {
            referenceModel: "StockTransfer",
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
            referenceModel: "StockTransfer",
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




export const getStatusList = async (req: Request, res: Response) => {
    try {

        const STOCK_TRANSFER_STATUS = [
            { label: "Draft", value: "draft" },
            { label: "In Transit", value: "in_transit" },
            { label: "Completed", value: "completed" },
            { label: "Cancelled", value: "cancelled" },
        ];
        return res.status(200).json({
            success: true,
            message: "Status list fetched successfully",
            data: STOCK_TRANSFER_STATUS,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};