import { createWriteStream } from "fs";
import { rm } from "fs/promises";
import path from "path";
import { Directory } from "../models/directory.model.js";
import { File } from "../models/file.model.js";

export const createFile = async (req, res) => {
  try {
    const user = req.user;
    const parentDirId = req.params.parentDirId || user.rootDirId;

    const parentDirData = await Directory.findOne({
      _id: parentDirId,
      userId: user._id,
    }).lean();

    if (!parentDirData) {
      return res.status(404).json({ error: "Parent directory not found!" });
    }

    const filename = req.headers.filename || "untitled";
    const extension = path.extname(filename);

    const insertedFile = new File({
      extension,
      name: filename,
      parentDirId: parentDirData._id,
      userId: user._id,
    });
    await insertedFile.save();

    const fullFileName = `${insertedFile.name}${extension}`;
    const writeStream = createWriteStream(`./storage/${fullFileName}`);
    req.pipe(writeStream);
    req.on("end", async () => {
      return res.status(201).json({ message: "File Uploaded" });
    });
    req.on("error", async () => {
      await File.deleteOne({ _id: insertedFile._id });
      return res.status(404).json({ message: "Could not upload file" });
    });
  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFile = async (req, res) => {
  const id = req.params.id;
  const user = req.user;

  const fileData = await File.findOne({
    _id: id,
    userId: user._id,
  }).lean();

  if (!fileData) {
    return res.status(404).json({ message: "File Not Found!" });
  }

  const filePath = `${process.cwd()}/storage/${fileData.name}${fileData.extension}`;

  if (req.query.action === "download") {
    return res.download(filePath, fileData.name);
  }

  return res.sendFile(filePath, (err) => {
    if (!res.headersSent && err) {
      return res.status(404).json({ error: "File not found!" });
    }
  });
};

export const updateFile = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;

  const fileData = await File.findOne({
    _id: id,
    userId: user._id,
  }).lean();

  if (!fileData) {
    return res.status(404).json({ error: "File not found!" });
  }

  try {
    await File.updateOne({ _id: id }, { $set: { name: req.body.filename } });
    return res.status(200).json({ message: "Renamed" });
  } catch (err) {
    err.status = 500;
    next(err);
  }
};

export const deleteFile = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;

  const fileData = await File.findOne({
    _id: id,
    userId: user._id,
  }).lean();

  if (!fileData) {
    return res.status(404).json({ error: "File Not Found" });
  }

  try {
    // remove file from system
    await rm(`./storage/${fileData.name}${fileData.extension}`, { force: true });
    // remove file from db
    await File.deleteOne({ _id: fileData._id });
    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (err) {
    console.log(err);
    if (err.code !== "ENOENT") {
      return next(err); // Only throw error if it's NOT a missing file
    }
  }
};
