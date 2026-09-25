import express from "express";
const router = express.Router();
import { authenticate, authorize } from '../../middleware/auth.middleware'
import {
    createGroup,
    getAllGroups,
    updateGroup,
    updateGroupStatus,
    status,
} from "../../controllers/group/group.Controller";


router.post("/", authenticate, authorize("super_admin"), createGroup);
router.get("/", authenticate, authorize("super_admin"), getAllGroups);
router.get("/status", status);
router.put("/:id", authenticate, authorize("super_admin"), updateGroup);
router.patch("/:id/status", authenticate, authorize("super_admin"), updateGroupStatus);

export default router;