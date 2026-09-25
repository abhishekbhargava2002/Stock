import express from "express";
const router = express.Router();
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { getAllFacility, getFacilityById, updateFacility, getStateDropdown, getCityDropdown } from '../../controllers/facility/facility.Controller';

router.get("/state", authenticate, getStateDropdown);
router.get("/city", authenticate, getCityDropdown);
router.get("/", authenticate, authorize("trivoxa"), getAllFacility);
router.get("/:id", authenticate, authorize("trivoxa"), getFacilityById);
router.put("/:id", authenticate, authorize("trivoxa"), updateFacility);

export default router;