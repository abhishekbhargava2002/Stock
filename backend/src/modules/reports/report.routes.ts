import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendList, sendSuccess } from "../../utils/apiResponse";
import { StockBalance, StockLedger } from "../stock/stock.models";

const router = Router();

router.get("/reports/stock-summary", asyncHandler(async (req, res) => sendList(res, "Stock summary fetched", await StockBalance.find(req.query).populate("itemId godownId facilityId"))));
router.get("/reports/movement-analysis", asyncHandler(async (req, res) => sendList(res, "Movement analysis fetched", await StockLedger.find(req.query).populate("itemId godownId facilityId").sort({ createdAt: -1 }))));
router.get("/reports/godown-wise", asyncHandler(async (req, res) => sendList(res, "Godown wise stock fetched", await StockBalance.find(req.query).populate("itemId godownId facilityId"))));
router.get("/reports/incentive-report", asyncHandler(async (_req, res) => sendList(res, "Incentive report fetched", [])));
router.get("/reports/dashboard", asyncHandler(async (_req, res) => sendSuccess(res, "Dashboard report fetched", { totalStockValue: 0, lowStockItems: 0, todayStockIn: 0, todayStockOut: 0 })));

export default router;
