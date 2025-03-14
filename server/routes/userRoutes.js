import express from "express";

import {
  getUser,
  login,
  logout,
  register,
} from "../controllers/user.controller.js";
import { checkAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

router.get("/", checkAuth, getUser);

export default router;
