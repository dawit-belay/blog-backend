import { Router } from "express";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost
} from "../controllers/postsController.js";
import { optionalAuthMiddleware, authMiddleware, requireRole } from "../middleware/auth.js";
import { validateCreatePost, validateUpdatePost } from "../utils/validators.js";

const router = Router();

router.get("/", optionalAuthMiddleware, getPosts);
router.get("/:id", getPost);
router.post("/", authMiddleware, requireRole("creator", "admin"), validateCreatePost, createPost);
router.put("/:id", authMiddleware, validateUpdatePost, updatePost);
router.delete("/:id", authMiddleware, deletePost);

export default router;
