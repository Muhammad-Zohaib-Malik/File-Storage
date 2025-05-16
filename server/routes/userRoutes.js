import express from "express";
import checkAuth from "../middlewares/authMiddleware.js";
import {
  getAllUsers,
  getCurrentUser,
  login,
  loginWithGoogle,
  logout,
  logoutFromAllDevices,
  register,
  sendOTP,
  verifyOTP,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/", checkAuth, getCurrentUser);

router.post("/logout", logout);
router.post("/logout-all",checkAuth, logoutFromAllDevices);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/google", loginWithGoogle);
router.get("/all",checkAuth, getAllUsers);






export default router;
