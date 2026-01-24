import { Router } from "express";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost
} from "../controllers/postsController.js";
import { optionalAuthMiddleware, authMiddleware, requireRole } from "../middleware/auth.js";
import { validateCreatePost, validateUpdatePost, validatePagination } from "../utils/validators.js";

const router = Router();

router.get("/", validatePagination, optionalAuthMiddleware, getPosts);
router.get("/:id", getPost);
router.post("/", authMiddleware, requireRole("creator", "admin", "demo"), validateCreatePost, createPost);
router.put("/:id", authMiddleware, validateUpdatePost, updatePost);
router.delete("/:id", authMiddleware, deletePost);

export default router;
