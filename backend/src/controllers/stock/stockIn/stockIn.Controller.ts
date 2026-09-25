import mongoose from "mongoose";
import { Request, Response } from "express";
import { AuthRequest } from "../../../middleware/auth.middleware";
import { StockIn } from "../../../models/stock/stockIn/stockIn.Model";
import { StockLedger } from "../../../models/stock/stockLedger/stockLedger.Model";
import { createStockInSchema, } from "../../../validations/stock/stockIn/stockIn.Validation";
import { User } from "../../../models/user/user.model";
import Item from "../../../models/item/item.Model";
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

        const user = await User.findById(
            req.user.id
        ).session(session);

        if (!user) {
            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // ✅ Parse multipart form-data array
        if (req.body.items) {
            req.body.items = JSON.parse(
                req.body.items
            );
        }

        const validatedData = createStockInSchema.parse(req.body);

        for (const stockItem of validatedData.items) {
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

        let image = "";
        if (req.file) {
            image = req.file.path;
        }

        const stockInDocs = await StockIn.create(
            [
                {
                    organizationId:
                        user.organization,

                    facilityId:
                        user.facility,

                    invoiceFile: image,

                    ...validatedData,

                    createdBy: user._id,
                },
            ],
            { session }
        );

        const stockIn = stockInDocs[0];

        for (const stockItem of stockIn.items) {

            const previousBalance =
                await StockLedger.aggregate([
                    {
                        $match: {
                            organizationId:
                                new mongoose.Types.ObjectId(
                                    String(
                                        stockIn.organizationId
                                    )
                                ),

                            facilityId:
                                new mongoose.Types.ObjectId(
                                    String(
                                        stockIn.facilityId
                                    )
                                ),

                            itemId:
                                new mongoose.Types.ObjectId(
                                    String(
                                        stockItem.itemId
                                    )
                                ),

                            godownId:
                                new mongoose.Types.ObjectId(
                                    String(
                                        stockIn.destinationGodownId
                                    )
                                ),
                        },
                    },

                    {
                        $group: {
                            _id: null,

                            totalIn: {
                                $sum: "$quantityIn",
                            },

                            totalOut: {
                                $sum: "$quantityOut",
                            },
                        },
                    },
                ]).session(session);

            const totalIn =
                previousBalance[0]?.totalIn || 0;

            const totalOut =
                previousBalance[0]?.totalOut || 0;

            const currentBalance = totalIn - totalOut;

            const newBalance = currentBalance + stockItem.quantity;

            await StockLedger.create(
                [
                    {
                        organizationId:
                            stockIn.organizationId,

                        facilityId:
                            stockIn.facilityId,

                        itemId:
                            stockItem.itemId,

                        sku:
                            stockItem.sku,

                        unitId:
                            stockItem.unitId,

                        godownId:
                            stockIn.destinationGodownId,

                        transactionType:
                            "STOCK_IN",

                        referenceId:
                            stockIn._id,

                        referenceModel:
                            "StockIn",

                        referenceNumber:
                            stockIn.stockInNumber,

                        quantityIn:
                            stockItem.quantity,

                        quantityOut: 0,

                        balanceQuantity:
                            newBalance,

                        rate:
                            stockItem.purchasePrice,

                        amount:
                            stockItem.amount,

                        batchNo:
                            stockItem.batchNo,

                        remarks:
                            stockItem.remark,

                        transactionDate:
                            stockIn.purchaseDate,

                        createdBy:
                            stockIn.createdBy,
                    },
                ],
                { session }
            );
        }

        await session.commitTransaction();

        return res.status(201).json({
            success: true,

            message:
                "Stock In created successfully",

            data: stockIn,
        });

    } catch (error: any) {

        await session.abortTransaction();

        console.log(
            "CREATE STOCK IN ERROR:",
            error
        );

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

                errors: Object.values(
                    error.errors
                ).map((err: any) => ({
                    field: err.path,
                    message: err.message,
                })),
            });
        }

        if (error.code === 11000) {

            return res.status(409).json({
                success: false,

                message:
                    "Duplicate entry found",
            });
        }

        return res.status(500).json({
            success: false,

            message:
                "Internal Server Error",

            error: error.message,
        });

    } finally {
        session.endSession();
    }
};


export const getAll = async (req: AuthRequest, res: Response) => {
    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const status = req.query.status as string;
        const godownId = req.query.godownId as string;
        const stockInNumber = req.query.stockInNumber as string;
        const vendorId = req.query.vendorId as string;

        const skip = (page - 1) * limit;

        const filter: any = {};

        if (status) {
            filter.status = status;
        }

        if (godownId) {
            filter.destinationGodownId = godownId;
        }

        if (stockInNumber) {
            filter.stockInNumber = {
                $regex: stockInNumber,
                $options: "i"
            };
        }

        if (vendorId) {
            filter.vendorId = vendorId;
        }

        const data = await StockIn.find(filter)
            .populate("destinationGodownId")
            .populate("vendorId")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await StockIn.countDocuments(filter);

        return res.status(200).json({
            success: true,
            message: "Data fetched successfully",
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            data
        });

    } catch (error: any) {

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });

    }
};


export const getById = async (req: AuthRequest, res: Response) => {
    try {

        const id = req.params.id as string;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ID",
            });
        }

        const data = await StockIn.findById(id)
            .populate("organizationId")
            .populate("facilityId")
            .populate("vendorId")
            .populate("destinationGodownId")
            .populate("createdBy")

            .populate({
                path: "items.itemId",
            })
            .populate({
                path: "items.unitId",
            });


        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Data not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Data fetched successfully",
            data,
        });

    } catch (error: any) {

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });

    }
};


export const getAllGodown = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user?.id;
        const godown = await Godown.find({ status: "active", userId: user }).select("_id godownName");

        return res.status(200).json({
            success: true,
            message: "Godowns fetched successfully",
            data: godown,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Something went wrong",
        });
    }
};


export const status = async (req: Request, res: Response) => {
    try {
        const statusValidation = [
            { label: "DRAFT", value: "draft" },
            { label: "COMPLETED", value: "completed" },
            { label: "CANCELLED", value: "cancelled" },
        ];

        return res.status(200).json({
            success: true,
            message: "Status fetched successfully",
            data: statusValidation,
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Something went wrong",
        });
    }
};


export const getLedger = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const user = req.user?.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ID",
            });
        }

        const ledgers = await StockLedger.findOne({
            referenceId: id,
            referenceModel: "StockIn",
            createdBy: user,
        });

        if (!ledgers) {
            return res.status(404).json({
                success: false,
                message: "Ledger not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Ledger fetched successfully",
            data: ledgers,
        });

    } catch (error: any) {
        console.log("GET LEDGER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch ledger",
        });
    }
};


export const getAllLedger = async (req: AuthRequest, res: Response) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const query: any = {
            createdBy: req.user?.id,
        };

        const skip = (Number(page) - 1) * Number(limit);

        const ledgers = await StockLedger.find(query)
            .sort({ transactionDate: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await StockLedger.countDocuments(query);

        return res.status(200).json({
            success: true,
            message: "Ledger fetched successfully",
            data: ledgers,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });

    } catch (error: any) {
        console.log("GET ALL LEDGER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch ledger",
        });
    }
};


export const cancel = async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const id = req.params.id as string;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Invalid ID",
            });
        }

        // ==================================================
        // ✅ FETCH STOCK IN
        // ==================================================

        const stockIn = await StockIn.findById(id).session(session);

        if (!stockIn) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "StockIn not found",
            });
        }

        if (stockIn.status === "cancelled") {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "StockIn already cancelled",
            });
        }

        // ==================================================
        // 🔁 REVERSE LEDGER ENTRIES
        // ==================================================

        for (const stockItem of stockIn.items) {

            // 🔹 Get current balance
            const previousBalance = await StockLedger.aggregate([
                {
                    $match: {
                        organizationId: stockIn.organizationId,
                        facilityId: stockIn.facilityId,
                        itemId: stockItem.itemId,
                        godownId: stockIn.destinationGodownId,
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalIn: { $sum: "$quantityIn" },
                        totalOut: { $sum: "$quantityOut" },
                    },
                },
            ]).session(session);

            const totalIn = previousBalance[0]?.totalIn || 0;
            const totalOut = previousBalance[0]?.totalOut || 0;

            const currentBalance = totalIn - totalOut;

            // 🔥 Reverse → subtract quantity
            const newBalance = currentBalance - stockItem.quantity;

            if (newBalance < 0) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: "Cannot cancel, stock mismatch",
                });
            }

            // 🔹 Create reversal ledger
            await StockLedger.create(
                [
                    {
                        organizationId: stockIn.organizationId,
                        facilityId: stockIn.facilityId,

                        itemId: stockItem.itemId,
                        sku: stockItem.sku,
                        unitId: stockItem.unitId,

                        godownId: stockIn.destinationGodownId,

                        transactionType: "REVERSAL",

                        referenceId: stockIn._id,
                        referenceModel: "StockIn",
                        referenceNumber: stockIn.stockInNumber,

                        quantityIn: 0,
                        quantityOut: stockItem.quantity,

                        balanceQuantity: newBalance,

                        rate: stockItem.purchasePrice,
                        amount: stockItem.amount,

                        batchNo: stockItem.batchNo,
                        remarks: `Cancel StockIn: ${stockIn.stockInNumber}`,

                        transactionDate: new Date(),

                        createdBy: req.user?.id,
                    },
                ],
                { session }
            );
        }

        // ==================================================
        // ✅ UPDATE STATUS
        // ==================================================

        stockIn.status = "cancelled";
        await stockIn.save({ session });

        // ==================================================
        // ✅ COMMIT
        // ==================================================

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Stock In cancelled successfully",
            data: stockIn,
        });

    } catch (error: any) {
        await session.abortTransaction();

        console.log("CANCEL STOCK IN ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to cancel Stock In",
        });

    } finally {
        session.endSession();
    }
};