import { createWriteStream } from "fs";
import { rm, writeFile } from "fs/promises";
import path from "path";
import { Router } from "express";
import filesData from "../filesDb.json" with { type: "json" };
import directoriesData from '../directoryDb.json' with {type: "json"}


const filesRoutes = Router();

filesRoutes.get("/:id", (req, res) => {
  const { id } = req.params;
  const fileData = filesData.find((file) => file.id === id);
  if (!fileData) {
    return res.status(404).json({ message: "File not found!" });
  }
  const filePath = `${process.cwd()}/storage/${id}${fileData.extension}`;
  if (req.query.action === "download") {
    res.set("Content-Disposition", `attachment;filename=${fileData.name}`);
  }
  res.sendFile(filePath, (err) => {
    if (!res.headersSent && err) {
      return res.status(404).json({ err: "File not found!" });
    }
  })
});


filesRoutes.post("/:parentDirId?", async (req, res) => {
  const parentDirId = req.params.parentDirId || directoriesData?.[0]?.id;
  const filename = req.headers.filename || "untitled"

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
        parentDirId
      });
      const parentDirData = directoriesData.find((directoryData) => directoryData.id === parentDirId)
      parentDirData.files.push(id)
      await writeFile("./filesDb.json", JSON.stringify(filesData));
      await writeFile("./directoryDb.json", JSON.stringify(directoriesData));
      res.status(201).json({ message: "File uploaded" });
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
    const parentDirData = directoriesData.find((directoryData) => directoryData.id === fileData.parentDirId)
    parentDirData.files = parentDirData.files.filter((fileId) => fileId !== id)
    console.log(parentDirData.files)
    await writeFile("./filesDb.json", JSON.stringify(filesData));
    await writeFile("./directoryDb.json", JSON.stringify(directoriesData));
    res.json({ message: "file deleted successfully" });
  } catch (err) {
    console.error("File deletion error:", err);
    res.status(500).json({ message: "Error deleting file" });
  }
});

filesRoutes.patch("/:id", async (req, res,next) => {
  const { id } = req.params;
  const { newFilename } = req.body;
  console.log(req.body)
  if (!newFilename) {
    return res.status(400).json({ message: "New file name is required" });
  }
  const fileData = filesData.find((file) => file.id === id);
  if (!fileData) {
    return res.status(404).json({ message: "File not found" });
  }
  fileData.name = newFilename;

  try {
    await writeFile("./filesDb.json", JSON.stringify(filesData));
   return  res.status(201).json({ message: "Renamed" });
  } catch (error) {
    res.status(500).json({ message: "Error updating file", error });
    next()
  }
});

export default filesRoutes;
