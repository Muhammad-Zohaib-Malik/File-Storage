import express from "express";
import {
  createFile,
  deleteFile,
  getFile,
  updateFile,
} from "../controllers/file.controller.js";
import validateIdMiddleware from "../middleware/validateId.middleware.js";

const router = express.Router();

router.param("parentDirId",validateIdMiddleware );
router.param("id",validateIdMiddleware );


  
// Create
router.post("/:parentDirId?", createFile);
// Read
router.get("/:id", getFile);

// Update
router.patch("/:id", updateFile);

// Delete
router.delete("/:id", deleteFile);

export default router;
