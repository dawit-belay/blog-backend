import { Router } from "express";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment
} from "../controllers/commentController.js";
const router = Router();

router.get("/", getComments);
router.post("/", createComment);
router.put("/:id", updateComment);
router.delete("/:id", deleteComment);

export default router;
