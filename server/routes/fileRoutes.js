import express from "express";
import { createFile, deleteFile, getFile, updateFile } from "../controllers/file.controller.js";

const router = express.Router();

// Create
router.post("/:parentDirId?", createFile);
// Read
router.get("/:id", getFile);

// Update
router.patch("/:id", updateFile);

// Delete
router.delete("/:id", deleteFile);

export default router;
