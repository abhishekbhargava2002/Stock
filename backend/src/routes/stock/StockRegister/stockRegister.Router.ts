import express from "express";
const router = express.Router();
import { authenticate, authorize } from "../../../middleware/auth.middleware";

import { getAllStockLedgers, getStockLedgerById, godownDropDown, facilitiesDropDown, transactionTypeDropDown, dashBoard } from '../../../controllers/stock/stockRegister/stockRegister.Controller';

router.use(authenticate, authorize("super_admin"));

router.get("/", getAllStockLedgers);
router.get("/godowns", godownDropDown);
router.get("/facilities", facilitiesDropDown);
router.get("/models", transactionTypeDropDown);
router.get("/dashboard", dashBoard);

router.get("/:id", getStockLedgerById);

export default router;