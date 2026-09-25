import mongoose from "mongoose";
import { Request, Response } from "express";
import { ManualAdjustment } from "../../../models/stock/stockManual/stockmanual.Model";
import { StockLedger } from "../../../models/stock/stockLedger/stockLedger.Model";
import { createManualAdjustmentSchema } from '../../../validations/stock/stockManual/stockmanual.Validation';
import Item from "../../../models/item/item.Model";
import { User } from "../../../models/user/user.model";
import { AuthRequest } from "../../../middleware/auth.middleware";
import { Godown } from "../../../models/godown/godown.Model";


export const create = async (req: any, res: Response) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // ✅ AUTH CHECK
        if (!req.user?.id) {
            await session.abortTransaction();
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        // ✅ USER (WITH SESSION)
        const user = await User.findById(req.user.id).session(session);

        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // ✅ VALIDATION
        const validatedData = createManualAdjustmentSchema.parse(req.body);

        const { itemId, godownId, physicalQuantity, remark, sku } = validatedData;

        // ✅ FILE
        let attachment = "";
        if (req.file) {
            attachment = req.file.path;
        }

        const itemObjectId = new mongoose.Types.ObjectId(itemId);
        const godownObjectId = new mongoose.Types.ObjectId(godownId);

        // ✅ ITEM VALIDATION (SKU MATCH 🔥)
        const item = await Item.findOne({
            _id: itemObjectId,
            skuCode: sku,
            isActive: true,
        }).session(session);

        if (!item) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Item not found or SKU mismatch",
            });
        }

        // ✅ LAST LEDGER
        const lastLedger = await StockLedger.findOne({
            organizationId: user.organization,
            facilityId: user.facility,
            itemId: itemObjectId,
            godownId: godownObjectId,
        })
            .sort({ transactionDate: -1, _id: -1 })
            .session(session);

        const systemQuantity = lastLedger?.balanceQuantity || 0;

        // ✅ DIFFERENCE
        const difference = physicalQuantity - systemQuantity;

        if (difference === 0) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "No adjustment needed",
            });
        }

        const adjustmentType = difference > 0 ? "increase" : "decrease";
        const absDiff = Math.abs(difference);

        // ❌ NEGATIVE STOCK BLOCK
        if (adjustmentType === "decrease" && absDiff > systemQuantity) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Adjustment exceeds available stock",
            });
        }

        // ✅ CREATE ADJUSTMENT
        const adjustment = new ManualAdjustment({
            organizationId: user.organization,
            facilityId: user.facility,
            itemId: itemObjectId,
            sku, // 🔥 FIXED
            godownId: godownObjectId,

            systemQuantity,
            physicalQuantity,
            difference,
            adjustmentType,

            remark,
            attachment,

            createdBy: user._id,
        });

        await adjustment.save({ session });

        // ============================
        // 🔥 LEDGER ENTRY
        // ============================
        const newBalance =
            adjustmentType === "increase"
                ? systemQuantity + absDiff
                : systemQuantity - absDiff;

        await StockLedger.create(
            [
                {
                    organizationId: user.organization,
                    facilityId: user.facility,

                    itemId: itemObjectId,
                    sku: sku,
                    godownId: godownObjectId,
                    unitId: lastLedger?.unitId,

                    transactionType: "MANUAL_ADJUSTMENT",

                    referenceId: adjustment._id,
                    referenceModel: "ManualAdjustment",
                    referenceNumber: lastLedger?.referenceNumber,


                    quantityIn: adjustmentType === "increase" ? absDiff : 0,
                    quantityOut: adjustmentType === "decrease" ? absDiff : 0,

                    balanceQuantity: newBalance,

                    transactionDate: new Date(),
                    createdBy: user._id,
                },
            ],
            { session }
        );

        // ✅ COMMIT
        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: "Manual adjustment created successfully",
            data: adjustment,
        });

    } catch (error: any) {
        await session.abortTransaction();

        console.log("MANUAL ADJUSTMENT ERROR:", error);

        // ✅ ZOD ERROR
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


export const getAll = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, status } = req.query as any;

        const skip = (Number(page) - 1) * Number(limit);

        const filter: any = {};

        // ✅ Filter by adjustmentType (increase / decrease)
        if (status) {
            filter.status = status;
        }

        const [data, total] = await Promise.all([
            ManualAdjustment.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),

            ManualAdjustment.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            message: "Stock manual fetched successfully",
            data,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });

    } catch (error: any) {
        console.log("GET ALL MANUAL ADJUSTMENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
};


export const getById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ID",
            });
        }

        const data = await ManualAdjustment.findById(id)
            .populate("itemId")
            .populate("godownId")
            .populate("createdBy");

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Stock manual not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Stock manual fetched successfully",
            data,
        });

    } catch (error: any) {
        console.log("GET BY ID MANUAL ADJUSTMENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
};


export const cancel = async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const id = req.params.id as string;

        // ✅ Validate ID
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Invalid ID",
            });
        }

        // ✅ Fetch adjustment (FIXED _id)
        const adjustment = await ManualAdjustment.findOne({
            _id: id,
            createdBy: req.user?.id,
        }).session(session);

        if (!adjustment) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Stock manual not found",
            });
        }

        // ❌ Prevent double cancel
        if ((adjustment as any).status === "cancelled") {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Already cancelled",
            });
        }

        // ✅ Fetch item (for unitId)
        const item = await Item.findById(adjustment.itemId)
            .select("unitId")
            .session(session);

        if (!item) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Item not found",
            });
        }

        // ✅ Fetch last ledger (FIXED scope)
        const lastLedger = await StockLedger.findOne({
            organizationId: adjustment.organizationId,
            facilityId: adjustment.facilityId,
            itemId: adjustment.itemId,
            godownId: adjustment.godownId,
        })
            .sort({ transactionDate: -1, _id: -1 })
            .session(session);

        const currentBalance = lastLedger?.balanceQuantity || 0;

        const absDiff = Math.abs(adjustment.difference);

        // 🔄 Reverse logic
        const reverseType =
            adjustment.adjustmentType === "increase" ? "decrease" : "increase";

        const newBalance =
            reverseType === "increase"
                ? currentBalance + absDiff
                : currentBalance - absDiff;

        // ❌ Prevent negative stock
        if (newBalance < 0) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Cannot cancel, stock would go negative",
            });
        }

        // ============================
        // 🔥 CREATE REVERSAL LEDGER
        // ============================
        await StockLedger.create(
            [
                {
                    organizationId: adjustment.organizationId,
                    facilityId: adjustment.facilityId,

                    itemId: adjustment.itemId,
                    sku: adjustment.sku,
                    unitId: lastLedger?.unitId,
                    godownId: adjustment.godownId,

                    transactionType: "REVERSAL",
                    referenceId: adjustment._id,
                    referenceModel: "ManualAdjustment",
                    referenceNumber: lastLedger?.referenceNumber,

                    quantityIn: reverseType === "increase" ? absDiff : 0,
                    quantityOut: reverseType === "decrease" ? absDiff : 0,

                    balanceQuantity: newBalance,

                    transactionDate: new Date(),
                    createdBy: req.user?.id,
                },
            ],
            { session }
        );


        (adjustment as any).status = "cancelled";
        await adjustment.save({ session });

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Stock manual cancelled successfully",
        });

    } catch (error: any) {
        await session.abortTransaction();

        console.log("CANCEL MANUAL ADJUSTMENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });

    } finally {
        session.endSession();
    }
};


export const lastLedger = async (req: AuthRequest, res: Response) => {
    try {
        const { page = 1, limit = 10 } = req.query as any;

        const skip = (Number(page) - 1) * Number(limit);

        const filter = {
            referenceModel: "ManualAdjustment",
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
            referenceModel: "ManualAdjustment",
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



export const itemDropDown = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user?.id;

        const items = await Item.find({
            userId: user,
            isActive: true,
        }).select("_id itemName");

        const data = items.map((item) => ({
            label: item.itemName,
            value: item._id,
        }));

        return res.status(200).json({
            success: true,
            message: "Item dropdown fetched successfully",
            data,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


export const godownDropDown = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user?.id;
        const godown = await Godown.find({
            status: "active",
            userId: user,
        });


        const data = godown.map((godown) => ({
            label: godown.godownName,
            value: godown._id,
        }));

        return res.status(200).json({
            success: true,
            message: "Godown dropdown fetched successfully",
            data: data,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};



export const status = async (req: Request, res: Response) => {
    try {
        const dataStatus = [
            {
                label: "ACTIVE",
                value: "active",
            },
            {
                label: "CANCELLED",
                value: "cancelled",
            }
        ]

        return res.status(200).json({
            success: true,
            message: "status dropdown fetched successfully",
            data: dataStatus,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}