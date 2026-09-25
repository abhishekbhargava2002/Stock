import express from "express";
import {
    createItem,
    getItems,
    updateItem,
    updateItemStatus,
    group,
    categories,
    godown,
    unit,
} from "../../controllers/item/item.Controller";

import { authenticate, authorize, } from "../../middleware/auth.middleware";
import { upload } from "../../config/cloudinary";
const router = express.Router();

/* ================= ITEM ROUTES ================= */

// Create Item
router.post(
    "/",
    authenticate,
    authorize("super_admin"),
    upload.single("itemPhoto"),
    createItem
);

// Get Items
router.get(
    "/",
    authenticate,
    authorize("super_admin"),
    getItems
);

// Update Item
router.put(
    "/:id",
    authenticate,
    authorize("super_admin"),
    upload.single("itemPhoto"),
    updateItem
);

// Toggle Item Status
router.patch(
    "/:id/status",
    authenticate,
    authorize("super_admin"),
    updateItemStatus
);


// Groups
router.get(
    "/group",
    authenticate,
    authorize("super_admin"),
    group
);

// Categories
router.get(
    "/categories",
    authenticate,
    authorize("super_admin"),
    categories
);

// Godown
router.get(
    "/godown",
    authenticate,
    authorize("super_admin"),
    godown
);

// Units
router.get(
    "/unit",
    authenticate,
    authorize("super_admin"),
    unit
);

export default router;