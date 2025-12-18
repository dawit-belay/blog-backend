import { Router } from "express";
import {
  getusers,
  getuser,
  signupUser,
  updateUser,
  loginUser,
  deleteUser
} from "../controllers/usersController.js";
const router = Router();

router.get("/", getusers);
router.get("/:id", getuser);
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
