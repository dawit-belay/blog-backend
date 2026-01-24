import { Router } from "express";
import {
  getusers,
  getuser,
  signupUser,
  updateUser,
  loginUser,
  becomecreator,
  deleteUser,
  demoLogin
} from "../controllers/usersController.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import { validateSignup, validateLogin, validateUpdateUser, validateBecomeCreator } from "../utils/validators.js";

const router = Router();

router.get("/", getusers);
router.get("/:id", getuser);
router.post("/signup", validateSignup, signupUser);
router.post("/login", validateLogin, loginUser);
router.post("/demo", demoLogin);
router.put("/:id", authMiddleware, requireRole("admin"), validateUpdateUser, updateUser);
router.put("/becomecreator/:id", authMiddleware, validateBecomeCreator, becomecreator);
router.delete("/:id", authMiddleware, requireRole("admin"), deleteUser);

export default router;
