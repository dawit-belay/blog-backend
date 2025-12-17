import { Router } from "express";
import {
  getcategorys,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from "../controllers/categoryController.js";
const router = Router();

router.get("/", getcategorys);
router.get("/:id", getCategory);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
