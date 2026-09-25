import express from "express";
const router = express.Router();
import { upload } from '../../config/cloudinary';
import {
    create,
    getAll,
    getById,
    update,
    cancel,
    itemDropDown,
    godownDropDown,
    facilityDropDown,
} from "../../controllers/dailySale/dailySale.Controller";

import {
    authenticate,
    authorize,
} from "../../middleware/auth.middleware";

router.use(authenticate, authorize("super_admin"));

// Dropdown APIs
router.get("/items", itemDropDown);
router.get("/godowns", godownDropDown);
router.get("/facilities", facilityDropDown);

// CRUD APIs
router.post("/", upload.single("attachment"), create);
router.get("/", getAll);
router.get("/:id", getById);
router.put("/:id", upload.single("attachment"), update);
router.patch("/:id/cancel", cancel);

export default router;