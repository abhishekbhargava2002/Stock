import express from "express";
const router = express.Router();
import { register, login, getMe, logout, loginUser } from '../../controllers/auth/auth.Controller';
import { authenticate, authorize } from "../../middleware/auth.middleware";


router.post("/", register);
router.post("/trivoxa-access", login);
router.get("/", authenticate, authorize("trivoxa"), getMe);
router.post("/logout", authenticate, authorize("trivoxa"), logout);
router.post("/login", loginUser);

export default router;