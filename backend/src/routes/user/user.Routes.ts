import express from "express";
const router = express.Router();
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { getAllUser, getByIdUser, updateUser, toggleStatusUser } from '../../controllers/user/user.Controller'

router.get("/", authenticate, authorize("trivoxa"), getAllUser);
router.get("/:id", authenticate, authorize("trivoxa"), getByIdUser);
router.put("/:id", authenticate, authorize("trivoxa"), updateUser);
router.patch("/status/:id", authenticate, authorize("trivoxa"), toggleStatusUser);

export default router;