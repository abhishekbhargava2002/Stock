import mongoose from "mongoose";
import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { StockLedger } from '../../models/stock/stockLedger/stockLedger.Model';


export const getAllStockLedgers = async (req: AuthRequest, res: Response) => {
    try {
        const { page = 1, limit = 10 } = req.query as any;

        const skip = (Number(page) - 1) * Number(limit);

        const filter = {
            createdBy: req.user?.id,
        };

        const [data, total] = await Promise.all([
            StockLedger.find(filter)
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