import express from "express";
import {
  checkAuth,
  checkForAdminOwner,
  checkForRole,
} from "../middlewares/authMiddleware.js";

import {
  deleteUsingRoleByHardDelete,
  deleteUsingRoleBySoftDelete,
  getAllUsers,
  getCurrentUser,
  login,
  loginWithGoogle,
  logout,
  logoutFromAllDevices,
  logoutUsingRole,
  register,
  sendOTP,
  verifyOTP,
} from "../controllers/userController.js";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/", checkAuth, getCurrentUser);
router.post("/logout", logout);
router.post("/logout-all", checkAuth, logoutFromAllDevices);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/google", loginWithGoogle);
router.get("/all", checkAuth, checkForRole, getAllUsers);

//logout by admin and Manager
router.post("/:userId/logout", checkAuth, checkForRole, logoutUsingRole);
//delete by admin and Owner and softDelete
router.delete(
  "/:userId",
  checkAuth,
  checkForAdminOwner,
  deleteUsingRoleBySoftDelete
);

//delete by admin and Owner for hardDelete
router.delete(
  "/:userId/hard",
  checkAuth,
  checkForAdminOwner,
  deleteUsingRoleByHardDelete
);

export default router;
