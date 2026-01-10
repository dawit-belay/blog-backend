import { Router } from "express";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost
} from "../controllers/postsController.js";
import { optionalAuthMiddleware, authMiddleware, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", optionalAuthMiddleware, getPosts);
router.get("/:id", getPost);
router.post("/", authMiddleware, requireRole("creator", "admin"), createPost);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);

export default router;
