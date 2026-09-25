import express from "express";
const router = express.Router();
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { createCategory, getAllCategory, updateCategory, dropDownCategoryParent, dropDownGroup, status} from '../../controllers/category/category.Controller';

router.post("/", authenticate, authorize("super_admin"), createCategory);
router.get("/", authenticate, authorize("super_admin"), getAllCategory);
router.put("/:id", authenticate, authorize("super_admin"), updateCategory);
router.get("/parent", authenticate, authorize("super_admin"), dropDownCategoryParent);
router.get("/group", authenticate, authorize("super_admin"), dropDownGroup);
router.get("/status", status);


export default router;