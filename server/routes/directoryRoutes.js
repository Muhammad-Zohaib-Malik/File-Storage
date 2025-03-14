import express from "express";

import {
  createDirectory,
  deleteDirectory,
  getDirectory,
  updateDirectory,
} from "../controllers/directory.controller.js";
import validateIdMiddleware from "../middleware/validateId.middleware.js";

const router = express.Router();

router.param("parentDirId",validateIdMiddleware );
router.param("id",validateIdMiddleware );


// Read
router.get("/:id?", getDirectory);

router.post("/:parentDirId?", createDirectory);

router.patch("/:id", updateDirectory);

router.delete("/:id", deleteDirectory);


export default router;
