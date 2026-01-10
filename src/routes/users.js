import { Router } from "express";
import {
  getusers,
  getuser,
  signupUser,
  updateUser,
  loginUser,
  becomecreator,
  deleteUser
} from "../controllers/usersController.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", getusers);
router.get("/:id", getuser);
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.put("/:id", authMiddleware, requireRole("admin"), updateUser);
router.put("/becomecreator/:id", authMiddleware, becomecreator);
router.delete("/:id", authMiddleware, requireRole("admin"), deleteUser);

export default router;
