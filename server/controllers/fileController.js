import { createWriteStream } from "fs";
import { rm } from "fs/promises";
import path from "path";
import Directory from "../models/directoryModel.js";
import File from "../models/fileModel.js";
import { google } from "googleapis";
import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";
const window = new JSDOM("").window;
const purify = DOMPurify(window);

export const uploadFile = async (req, res, next) => {
  const parentDirId = req.params.parentDirId || req.user.rootDirId;
  try {
    const parentDirData = await Directory.findOne({
      _id: parentDirId,
      userId: req.user._id,
    });

    // Check if parent directory exists
    if (!parentDirData) {
      return res.status(404).json({ error: "Parent directory not found!" });
    }

    const filename = purify.sanitize(req.headers?.filename || "untitled");
    const filesize = req.headers?.filesize;
    const extension = path.extname(filename);

    if (filesize > 1024 * 1024 * 50) {
      console.log("destroy")
      return res.destroy();
    }

    const insertedFile = await File.insertOne({
      extension,
      name: filename,
      size: filesize,
      parentDirId: parentDirData._id,
      userId: req.user._id,
    });

    const fileId = insertedFile.id;

    const fullFileName = `${fileId}${extension}`;
    const filePath = `./storage/${fullFileName}`;

    const writeStream = createWriteStream(filePath);
    let totolFileSize = 0;
    let aborted = false;

    req.on("data", async (chunk) => {
      if (aborted) return;
      totolFileSize += chunk.length;
      if (totolFileSize > filesize) {
        aborted = true;
        writeStream.close();
        await insertedFile.deleteOne();
        await rm(filePath);
        req.destroy();
      }
      const isEmpty = writeStream.write(chunk);
      if (!isEmpty) {
        req.pause();
        writeStream.on("drain", () => {
          req.resume();
        });
      }
    });

    req.on("end", () => {
      if (!aborted) {
        writeStream.end();
      }
    });

    req.on('end', () => {
      console.log({ filesize })
      console.log({ totolFileSize })
    })


    writeStream.on("finish", () => {
      if (!aborted) {
        return res.status(201).json({ message: "File uploaded successfully" });
      }
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const getFile = async (req, res) => {
  const { id } = req.params;
  const fileData = await File.findOne({
    _id: id,
    userId: req.user._id,
  }).lean();
  // Check if file exists
  if (!fileData) {
    return res.status(404).json({ error: "File not found!" });
  }

  // If "download" is requested, set the appropriate headers
  const filePath = `${process.cwd()}/storage/${id}${fileData.extension}`;

  if (req.query.action === "download") {
    return res.download(filePath, fileData.name);
  }

  // Send file
  return res.sendFile(filePath, (err) => {
    if (!res.headersSent && err) {
      return res.status(404).json({ error: "File not found!" });
    }
  });
};

export const renameFile = async (req, res, next) => {
  const { id } = req.params;
  const file = await File.findOne({
    _id: id,
    userId: req.user._id,
  });

  let { newFilename } = req.body;
  newFilename = purify.sanitize(newFilename);

  // Check if file exists
  if (!file) {
    return res.status(404).json({ error: "File not found!" });
  }

  try {
    file.name = newFilename;
    await file.save();
    return res.status(200).json({ message: "Renamed" });
  } catch (err) {
    console.log(err);
    err.status = 500;
    next(err);
  }
};

export const deleteFile = async (req, res, next) => {
  const { id } = req.params;
  const file = await File.findOne({
    _id: id,
    userId: req.user._id,
  }).select("extension");

  if (!file) {
    return res.status(404).json({ error: "File not found!" });
  }

  try {
    await rm(`./storage/${id}${file.extension}`);
    await file.deleteOne();
    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (err) {
    next(err);
  }
};

export const importFromDrive = async (req, res, next) => {
  const parentDirId = req.params.parentDirId || req.user.rootDirId;
  const { fileId, fileName, access_token } = req.body;

  if (!fileId || !fileName || !access_token) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const parentDirData = await Directory.findOne({
      _id: parentDirId,
      userId: req.user._id,
    });

    if (!parentDirData) {
      return res.status(404).json({ error: "Parent directory not found!" });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token });

    const drive = google.drive({ version: "v3", auth });

    const { data } = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    const extension = path.extname(fileName);

    const newFile = await File.create({
      extension,
      name: fileName,
      userId: req.user._id,
      parentDirId: parentDirData._id,
    });

    const internalFileId = newFile._id.toString();
    const fullFileName = `${internalFileId}${extension}`;
    const writeStream = createWriteStream(`./storage/${fullFileName}`);

    data
      .on("error", (err) => {
        console.error("❌ Error downloading file:", err);
        return res.status(500).json({ error: "Download failed" });
      })
      .pipe(writeStream)
      .on("finish", () => {
        console.log(`✅ Downloaded: ${fileName}`);
        return res.status(200).json({
          message: "File imported successfully",
          fileName,
          fileId: internalFileId,
        });
      });
  } catch (err) {
    console.error("❌ Google Drive import error:", err);
    return next(err);
  }
};
