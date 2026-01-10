import { Router } from "express";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost
} from "../controllers/postsController.js";
import { optionalAuthMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/", optionalAuthMiddleware, getPosts);
router.get("/:id", getPost);
router.post("/", createPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

export default router;
