import { Router } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendList, sendSuccess } from "../../utils/apiResponse";
import { applyStockMovement } from "../../utils/stockLedger";
import { ManualAdjustment, StockBalance, StockIn, StockLedger, StockOut, StockTransfer } from "./stock.models";

const router = Router();

router.get("/balance", asyncHandler(async (req, res) => sendList(res, "Stock balance fetched", await StockBalance.find(req.query).populate("itemId godownId facilityId"))));
router.get("/ledger", asyncHandler(async (req, res) => sendList(res, "Stock ledger fetched", await StockLedger.find(req.query).populate("itemId godownId facilityId").sort({ createdAt: -1 }))));

router.post("/stock-in", asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  let doc;
  await session.withTransaction(async () => {
    const totalQuantity = req.body.items.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0);
    const totalValue = req.body.items.reduce((sum: number, item: any) => sum + Number(item.quantity || 0) * Number(item.rate || 0), 0);
    [doc] = await StockIn.create([{ ...req.body, totalQuantity, totalValue }], { session });
    for (const item of req.body.items) {
      await applyStockMovement({
        organizationId: req.body.organizationId,
        facilityId: req.body.facilityId,
        godownId: req.body.destinationGodownId,
        itemId: item.itemId,
        transactionType: "STOCK_IN",
        quantityIn: Number(item.quantity),
        unitId: item.unitId,
        rate: Number(item.rate || 0),
        referenceType: "StockIn",
        referenceId: (doc as any)._id,
        remarks: item.remark,
        createdBy: req.body.createdBy,
        session,
      });
    }
  });
  await session.endSession();
  return sendSuccess(res, "Stock in created and ledger updated", doc, 201);
}));
router.get("/stock-in", asyncHandler(async (req, res) => sendList(res, "Stock in fetched", await StockIn.find(req.query).sort({ createdAt: -1 }))));
router.get("/stock-in/:id/ledger", asyncHandler(async (req, res) => sendList(res, "Stock in ledger fetched", await StockLedger.find({ referenceId: req.params.id }).sort({ createdAt: -1 }))));

router.post("/stock-transfer", asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  let doc;
  await session.withTransaction(async () => {
    const totalQuantity = req.body.items.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0);
    [doc] = await StockTransfer.create([{ ...req.body, totalQuantity }], { session });
    for (const item of req.body.items) {
      await applyStockMovement({ organizationId: req.body.organizationId, facilityId: req.body.sourceFacilityId, godownId: req.body.sourceGodownId, itemId: item.itemId, transactionType: "STOCK_TRANSFER_OUT", quantityOut: Number(item.quantity), unitId: item.unitId, rate: Number(item.rate || 0), referenceType: "StockTransfer", referenceId: (doc as any)._id, remarks: item.remark, createdBy: req.body.createdBy, session });
      await applyStockMovement({ organizationId: req.body.organizationId, facilityId: req.body.destinationFacilityId, godownId: req.body.destinationGodownId, itemId: item.itemId, transactionType: "STOCK_TRANSFER_IN", quantityIn: Number(item.quantity), unitId: item.unitId, rate: Number(item.rate || 0), referenceType: "StockTransfer", referenceId: (doc as any)._id, remarks: item.remark, createdBy: req.body.createdBy, session });
    }
  });
  await session.endSession();
  return sendSuccess(res, "Stock transfer created and ledger updated", doc, 201);
}));
router.get("/stock-transfer", asyncHandler(async (req, res) => sendList(res, "Stock transfers fetched", await StockTransfer.find(req.query).sort({ createdAt: -1 }))));

router.post("/stock-out", asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  let doc;
  await session.withTransaction(async () => {
    const totalQuantity = req.body.items.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0);
    const totalValue = req.body.items.reduce((sum: number, item: any) => sum + Number(item.quantity || 0) * Number(item.rate || 0), 0);
    [doc] = await StockOut.create([{ ...req.body, totalQuantity, totalValue }], { session });
    for (const item of req.body.items) {
      await applyStockMovement({ organizationId: req.body.organizationId, facilityId: req.body.sourceFacilityId, godownId: req.body.godownId, itemId: item.itemId, transactionType: "STOCK_OUT", quantityOut: Number(item.quantity), unitId: item.unitId, rate: Number(item.rate || 0), referenceType: "StockOut", referenceId: (doc as any)._id, remarks: item.remark, createdBy: req.body.createdBy, session });
    }
  });
  await session.endSession();
  return sendSuccess(res, "Stock out created and ledger updated", doc, 201);
}));
router.get("/stock-out", asyncHandler(async (req, res) => sendList(res, "Stock outs fetched", await StockOut.find(req.query).sort({ createdAt: -1 }))));

router.post("/manual-adjustments", asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  let doc;
  await session.withTransaction(async () => {
    const difference = Number(req.body.physicalQuantity) - Number(req.body.systemQuantity);
    [doc] = await ManualAdjustment.create([{ ...req.body, difference }], { session });
    await applyStockMovement({ organizationId: req.body.organizationId, facilityId: req.body.facilityId, godownId: req.body.godownId, itemId: req.body.itemId, transactionType: difference >= 0 ? "MANUAL_ADJUSTMENT_INCREASE" : "MANUAL_ADJUSTMENT_DECREASE", quantityIn: difference > 0 ? difference : 0, quantityOut: difference < 0 ? Math.abs(difference) : 0, referenceType: "ManualAdjustment", referenceId: (doc as any)._id, remarks: req.body.remark, createdBy: req.body.createdBy, session });
  });
  await session.endSession();
  return sendSuccess(res, "Manual adjustment created and ledger updated", doc, 201);
}));
router.get("/manual-adjustments", asyncHandler(async (req, res) => sendList(res, "Manual adjustments fetched", await ManualAdjustment.find(req.query).sort({ createdAt: -1 }))));

export default router;
