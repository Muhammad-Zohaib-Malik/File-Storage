import { createWriteStream } from "fs";
import { rm, writeFile } from "fs/promises";
import path from "path";
import { Router } from "express";
import filesData from "../filesDb.json" with { type: "json" };

const filesRoutes = Router();

filesRoutes.get("/:id", (req, res) => {
  const { id } = req.params;
  const fileData = filesData.find((file) => file.id === id);
  if (!fileData) {
    return res.status(404).json({ message: "File not found!" });
  }
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  res.sendFile(`${process.cwd()}/storage/${id}${fileData.extension}`, (err) => {
    if (err) {
      res.json({ err: "File not found!" });
    }
  });
});

filesRoutes.post("/:filename", async (req, res) => {
  const { filename } = req.params;
  if (!filename) {
    return res.status(400).json({ message: "Invalid filename" });
  }
  const extension = path.extname(filename);
  if (!extension) {
    return res.status(400).json({ message: "File extension is required" });
  }
  const id = crypto.randomUUID();
  const fullFileName = `${id}${extension}`;
  const writeStream = createWriteStream(`./storage/${fullFileName}`);
  req.pipe(writeStream);
  req.on("end", async () => {
    try {
      filesData.push({
        id,
        extension,
        name: filename,
      });
      await writeFile("./filesDb.json", JSON.stringify(filesData));
      res.json({ message: "File uploaded" });
    } catch (error) {
      console.error("Error saving file metadata:", error);
      res.status(500).json({ message: "Error updating file database", error: error.message });
    }

  });
});

filesRoutes.delete("/:id", async (req, res) => {
  const { id } = req.params
  const fileIndex = filesData.findIndex((file) => file.id === id);
  if (fileIndex === -1) {
    return res.status(404).json({ message: "File not found!" });
  }
  const fileData = filesData[fileIndex]
  try {
    await rm(`./storage/${id}${fileData.extension}`)
    filesData.splice(fileIndex, 1)
    await writeFile("./filesDb.json", JSON.stringify(filesData));
    res.json({ message: "file deleted successfully" });
  } catch (err) {
    console.error("File deletion error:", err);
    res.status(500).json({ message: "Error deleting file" });
  }
});

filesRoutes.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { newFileName } = req.body;
  if (!newFileName) {
    return res.status(400).json({ message: "New file name is required" });
  }
  const fileData = filesData.find((file) => file.id === id);
  if (!fileData) {
    return res.status(404).json({ message: "File not found" });
  }
  fileData.name = newFileName;

  try {
    await writeFile("./filesDb.json", JSON.stringify(filesData));
    res.json({ message: "Renamed" });
  } catch (error) {
    res.status(500).json({ message: "Error updating file", error });
  }
});

export default filesRoutes;
