import express from "express";
import validateIdMiddleware from "../middlewares/validateIdMiddleware.js";
import {
  deleteFileFromAws,
  getFileFromAws,
  renameFile,
  uploadToAws,
  uploadToAwsComplete,
} from "../controllers/fileController.js";

const router = express.Router();

router.param("parentDirId", validateIdMiddleware);
router.param("id", validateIdMiddleware);

router.get("/:id", getFileFromAws);

router.patch("/:id", renameFile);

router.post("/uploads/initiate", uploadToAws);
router.post("/uploads/complete", uploadToAwsComplete);
router.delete("/:id", deleteFileFromAws);

export default router;
