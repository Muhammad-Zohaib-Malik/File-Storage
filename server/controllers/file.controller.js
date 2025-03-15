import { createWriteStream } from "fs";
import { rm } from "fs/promises";
import path from "path";
import { ObjectId } from "mongodb";

export const createFile = async (req, res) => {
  try {
    const user = req.user;
    const db = req.db;
    const parentDirId = req.params.parentDirId || user.rootDirId;
    const dirCollection = db.collection("directories");
    const fileCollection = db.collection("files");

    // Check if parent directory exists
    const parentDirData = await dirCollection.findOne({
      _id: new ObjectId(parentDirId),
      userId: user._id,
    });
    if (!parentDirData) {
      return res.status(404).json({ error: "Parent directory not found!" });
    }

    const filename = req.headers.filename || "untitled";
    const extension = path.extname(filename);

    const insertedFile = await fileCollection.insertOne({
      extension,
      name: filename,
      parentDirId: parentDirData._id,
      userId: user._id,
    });
    const fileId = insertedFile.insertedId.toString();
    const fullFileName = `${fileId}${extension}`;
    const writeStream = createWriteStream(`./storage/${fullFileName}`);
    req.pipe(writeStream);
    req.on("end", async () => {
      return res.status(201).json({ message: "File Uploaded" });
    });
    req.on("error", async () => {
      await fileCollection.deleteOne({ _id: insertedFile.insertedId });
      return res.status(404).json({ message: "Could not upload file" });
    });
  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFile = async (req, res) => {
  const id = req.params.id;
  const db = req.db;
  const user = req.user;
  const fileCollection = db.collection("files");

  const fileData = await fileCollection.findOne({
    _id: new ObjectId(id),
    userId: user._id,
  });
  console.log(fileData);

  if (!fileData) {
    return res.status(404).json({ message: "File Not Found!" });
  }

  const filePath = `${process.cwd()}/storage/${id}${fileData.extension}`;

  if (req.query.action === "download") {
    // res.set("Content-Disposition", `attachment; filename=${fileData.name}`);
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
  const db = req.db;
  const user = req.user;
  const fileCollection = db.collection("files");
  const fileData = await fileCollection.findOne({
    _id: new ObjectId(id),
    userId: user._id,
  });

  // Check if file exists
  if (!fileData) {
    return res.status(404).json({ error: "File not found!" });
  }

  try {
    await fileCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name: req.body.filename } }
    );
    return res.status(200).json({ message: "Renamed" });
  } catch (err) {
    err.status = 500;
    next(err);
  }
};

export const deleteFile = async (req, res, next) => {
  const { id } = req.params;
  const db = req.db;
  const user = req.user;
  const fileCollection = db.collection("files");
  const fileData = await fileCollection.findOne({
    _id: new ObjectId(id),
    userId: user._id,
  });

  if (!fileData) {
    return res.status(404).json({ error: "File Not Found" });
  }

  try {
    // remove file from system
    await rm(`./storage/${id}${fileData.extension}`);
    // remove file from db
    await fileCollection.deleteOne({ _id: fileData._id });
    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (err) {
    next(err);
  }
};
