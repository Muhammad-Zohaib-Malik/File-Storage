import express from "express";
import { importFromDrive } from "../controllers/fileController.js";

const router = express.Router();

router.post("/import-from-drive", importFromDrive);

export default router;
