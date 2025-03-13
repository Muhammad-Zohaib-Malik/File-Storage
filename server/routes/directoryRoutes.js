import express from "express";

import { createDirectory, deleteDirectory, getDirectory, updateDirectory } from "../controllers/directory.controller.js";

const router = express.Router();

// Read
router.get("/:id?", getDirectory);

router.post("/:parentDirId?", createDirectory);

router.patch('/:id', updateDirectory)

router.delete("/:id", deleteDirectory);

export default router;
