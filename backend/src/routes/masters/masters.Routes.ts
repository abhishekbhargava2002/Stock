import express from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware";
const router = express.Router();
import { getAllMasters } from "../../controllers/masters/masters.Controller";


router.get("/", authenticate, authorize("super_admin"), getAllMasters);

export default router;