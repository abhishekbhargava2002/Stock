import { ZodError } from "zod";
import mongoose from "mongoose";
import { Request, Response } from "express";
import { User } from "../../models/user/user.model";
import { AuthRequest } from '../../middleware/auth.middleware';
import { DailySale } from '../../models/dailySale/dailySale.Model';
import { StockLedger } from '../../models/stock/stockLedger/stockLedger.Model';
import { createDailySaleSchema, updateDailySaleSchema } from '../../validations/dailySale/dailySale.Validation';
import Item from "../../models/item/item.Model";
import { Godown } from "../../models/godown/godown.Model";
import { Facility } from "../../models/facilities/facilities.model";



export const create = async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        if (req.body.items && typeof req.body.items === "string") {
            req.body.items = JSON.parse(req.body.items);
        }

        const user = await User.findById(req.user?.id).session(session);

        if (!user) {
            await session.abortTransaction();

            return res.status(403).json({
                success: false,
                message: "User not found",
            });
        }

        const validatedData = createDailySaleSchema.parse(req.body);

        const {
            facilityId,
            godownId,
            saleDate,
            items,
            totalAmount,
            remark,
        } = validatedData;

        let attachment = "";

        if ((req as any).file) {
            attachment = (req as any).file.path;
        }

        // Facility Validation
        const facility = await Facility.findById(
            facilityId
        ).session(session);

        if (!facility) {
            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "Facility not found",
            });
        }

        // Godown Validation
        const godown = await Godown.findOne({
            _id: godownId,
            userId: user._id,
        }).session(session);

        if (!godown) {
            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "Godown not found",
            });
        }

        /*
        ===================================
        VALIDATE ITEMS & STOCK
        ===================================
        */

        const stockValidationData: any[] = [];

        for (const saleItem of items) {
            const item = await Item.findById(saleItem.itemId).session(session);

            if (!item) {
                await session.abortTransaction();

                return res.status(404).json({
                    success: false,
                    message: `Item not found: ${saleItem.itemId}`,
                });
            }

            const latestLedger = await StockLedger.findOne({
                organizationId: user.organization,
                facilityId,
                godownId,
                itemId: saleItem.itemId,
            })
                .sort({
                    transactionDate: -1,
                    createdAt: -1,
                })
                .session(session);

            const availableStock =
                latestLedger?.balanceQuantity || 0;

            if (availableStock < Number(saleItem.quantity)) {
                await session.abortTransaction();

                return res.status(400).json({
                    success: false,
                    message: `${item.itemName} has insufficient stock. Available ${availableStock}, Required ${saleItem.quantity}`,
                });
            }

            stockValidationData.push({
                item,
                latestLedger,
                availableStock,
                quantity: Number(saleItem.quantity),
                rate: Number(saleItem.sellingPrice),
            });
        }

        /*
        ===================================
        CREATE DAILY SALE
        ===================================
        */

        const dailySale = await DailySale.create(
            [
                {
                    facilityId,
                    godownId,
                    saleDate,
                    items,
                    totalAmount,
                    remark,
                    attachment,
                    status: "active",
                    organizationId:
                        user.organization,
                    createdBy: user._id,
                },
            ],
            { session }
        );

        const saleDoc = dailySale[0];



        /*
===================================
CREATE STOCK LEDGER
===================================
*/

        for (const stockItem of stockValidationData) {
            const latestLedger = await StockLedger.findOne({
                organizationId: user.organization,
                facilityId,
                godownId,
                itemId: stockItem.item._id,
            })
                .sort({
                    createdAt: -1,
                })
                .session(session);

            const currentBalance = Number(
                latestLedger?.balanceQuantity || 0
            );

            const quantityOut = Number(stockItem.quantity);

            const newBalance =
                currentBalance - quantityOut;

            if (newBalance < 0) {
                return res.status(400).json({
                    success: false,
                    message: `${stockItem.item.itemName} has insufficient stock. Available ${currentBalance}, Required ${quantityOut}`
                })
            }

            await StockLedger.create(
                [
                    {
                        organizationId:
                            user.organization,

                        facilityId,

                        godownId,

                        itemId:
                            stockItem.item._id,

                        sku:
                            stockItem.item.skuCode,

                        unitId:
                            latestLedger?.unitId,

                        transactionType:
                            "DAILY_SALE",

                        referenceId:
                            saleDoc._id,

                        referenceModel:
                            "DailySale",

                        quantityIn: 0,

                        quantityOut,

                        balanceQuantity:
                            newBalance,

                        rate:
                            stockItem.rate,

                        amount:
                            Number((quantityOut * stockItem.rate).toFixed(2)),

                        remarks: remark || "Daily Sale",

                        transactionDate:
                            saleDate,

                        createdBy:
                            user._id,
                    },
                ],
                { session }
            );
        }




        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: "Daily sale created successfully",
            data: saleDoc,
        });
    } catch (error: any) {
        await session.abortTransaction();

        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: error.errors,
            });
        }

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Internal Server Error",
        });
    } finally {
        await session.endSession();
    }
};


export const getAll = async (req: AuthRequest, res: Response) => {
    try {
        const { page = 1, limit = 10 } = req.query as any;

        const skip = (Number(page) - 1) * Number(limit);

        const filter = {
            createdBy: req.user?.id,
        };

        const [data, total] = await Promise.all([
            DailySale.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),

            DailySale.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(total / Number(limit));

        return res.status(200).json({
            success: true,
            message: "Daily sales fetched successfully",
            data,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages,
            },
        });
    } catch (error: any) {
        console.log("GET DAILY SALES ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
};


export const getById = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid daily sale ID",
            });
        }

        const data = await DailySale.findOne({
            _id: id,
            createdBy: req.user?.id,
        })
            .populate("facilityId")
            .populate("godownId")
            .populate("items.itemId", "itemName skuCode");

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Daily sale not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Daily sale fetched successfully",
            data,
        });
    } catch (error: any) {
        console.log("GET DAILY SALE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
};


export const update = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid daily sale id",
            });
        }

        if (
            req.body.items &&
            typeof req.body.items === "string"
        ) {
            req.body.items = JSON.parse(req.body.items);
        }

        const validatedData = updateDailySaleSchema.parse(req.body);

        const dailySale = await DailySale.findOne({
            _id: id,
            createdBy: req.user?.id,
            status: "active",
        });

        if (!dailySale) {
            return res.status(404).json({
                success: false,
                message: "Daily sale not found",
            });
        }

        let attachment = dailySale.attachment;

        if ((req as any).file) {
            attachment = (req as any).file.path;
        }

        const updatedSale =
            await DailySale.findByIdAndUpdate(
                id,
                {
                    ...validatedData,
                    attachment,
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

        return res.status(200).json({
            success: true,
            message: "Daily sale updated successfully",
            data: updatedSale,
        });
    } catch (error: any) {
        console.error(
            "UPDATE DAILY SALE ERROR:",
            error
        );

        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: error.errors,
            });
        }

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Internal Server Error",
        });
    }
};


export const cancel = async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { id } = req.params;
        const { reason } = req.body;

        const user = await User.findById(
            req.user?.id
        ).session(session);

        if (!user) {
            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const dailySale = await DailySale.findOne({
            _id: id,
            organizationId: user.organization,
        }).session(session);

        if (!dailySale) {
            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "Daily sale not found",
            });
        }

        if (dailySale.status === "cancelled") {
            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "Daily sale is already cancelled",
            });
        }

        /*
        ===================================
        RESTORE STOCK
        ===================================
        */

        const saleLedgers = await StockLedger.find({
            referenceId: dailySale._id,
            referenceModel: "DailySale",
            transactionType: "DAILY_SALE",
        }).session(session);

        if (!saleLedgers.length) {
            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message:
                    "No stock ledger entries found for this daily sale",
            });
        }

        for (const ledger of saleLedgers) {
            const latestLedger = await StockLedger.findOne({
                organizationId: ledger.organizationId,
                facilityId: ledger.facilityId,
                godownId: ledger.godownId,
                itemId: ledger.itemId,
            })
                .sort({
                    createdAt: -1,
                })
                .session(session);

            const currentBalance =
                latestLedger?.balanceQuantity || 0;

            const restoreQty = Number(
                ledger.quantityOut || 0
            );

            const newBalance =
                currentBalance + restoreQty;

            await StockLedger.create(
                [
                    {
                        organizationId:
                            ledger.organizationId,

                        facilityId:
                            ledger.facilityId,

                        itemId:
                            ledger.itemId,

                        sku: ledger.sku,

                        unitId:
                            ledger.unitId,

                        godownId:
                            ledger.godownId,

                        transactionType:
                            "REVERSAL",

                        referenceId:
                            dailySale._id,

                        referenceModel:
                            "DailySale",

                        referenceNumber:
                            ledger.referenceNumber,

                        quantityIn:
                            restoreQty,

                        quantityOut: 0,

                        balanceQuantity:
                            newBalance,

                        rate:
                            ledger.rate,

                        amount:
                            restoreQty *
                            Number(
                                ledger.rate || 0
                            ),

                        batchNo:
                            ledger.batchNo || "",

                        remarks:
                            reason ||
                            "Daily Sale Cancellation",

                        transactionDate:
                            new Date(),

                        createdBy:
                            user._id,
                    },
                ],
                { session }
            );
        }



        /*
        ===================================
        UPDATE DAILY SALE
        ===================================
        */

        dailySale.status = "cancelled";

        await dailySale.save({ session });

        /*
        ===================================
        COMMIT
        ===================================
        */

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message:
                "Daily sale cancelled successfully",
            data: dailySale,
        });
    } catch (error: any) {
        await session.abortTransaction();

        console.error(
            "CANCEL DAILY SALE ERROR:",
            error
        );

        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: error.errors,
            });
        }

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Internal Server Error",
        });
    } finally {
        await session.endSession();
    }
};


export const itemDropDown = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user?.id;

        const items = await Item.find({
            isActive: true,
            userId: user,
        }).select("_id itemName");

        return res.status(200).json({
            success: true,
            message: "Items fetched successfully",
            data: items
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

        const godowns = await Godown.find({
            userId: user,
            status: "active"
        }).select(" _id  godownName");

        return res.status(200).json({
            success: true,
            message: "Godowns fetched successfully",
            data: godowns
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


export const facilityDropDown = async (req: AuthRequest, res: Response) => {
    try {
        const facilities = await Facility.find({
            status: "active"
        }).select("_id name");

        return res.status(200).json({
            success: true,
            message: "Facilities fetched successfully",
            data: facilities,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};