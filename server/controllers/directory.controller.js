import { rm } from "fs/promises";

import { Directory } from "../models/directory.model.js";
import { File } from "../models/file.model.js";
import { isModuleNamespaceObject } from "util/types";

export const createDirectory = async (req, res, next) => {
  const user = req.user;
  const parentDirId = req.params.parentDirId || user.rootDirId;
  const dirname = req.headers.dirname || "New Folder";
  const parentDir = await Directory.findOne({
    _id: parentDirId,
  });

  if (!parentDir)
    return res
      .status(404)
      .json({ message: "Parent Directory Does not exist!" });

  try {
    await Directory.create({
      name: dirname,
      parentDirId,
      userId: user._id,
    });
    return res.status(200).json({ message: "Directory Created!" });
  } catch (err) {
    next(err);
  }
};

export const getDirectory = async (req, res) => {
  const user = req.user;
  const _id = req.params.id || user.rootDirId;

  const directoryData = await Directory.findOne({
    _id,
  }).lean();
  if (!directoryData) {
    return res
      .status(404)
      .json({ error: "Directory not found or you do not have access to it!" });
  }

  const files = await File.find({ parentDirId: directoryData._id }).lean();
  const directories = await Directory.find({ parentDirId: _id }).lean();
  return res.status(200).json({
    ...directoryData,
    files: files.map((file) => ({ ...file, id: file._id })),
    directories: directories.map((dir) => ({ ...dir, id: dir._id })),
  });
};

export const updateDirectory = async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;
  const { newDirName } = req.body;
  try {
    await Directory.updateOne(
      { _id, userId: user._id },
      { $set: { name: newDirName } }
    );
    dirData.name = newDirName;
    return res.status(200).json({ message: "Directory Renamed!" });
  } catch (err) {
    next(err);
  }
};

export const deleteDirectory = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const dirObjId = id;

    const directoryData = await Directory.findOne({
      _id: dirObjId,
      userId: user._id,
    }).lean();

    if (!directoryData) {
      return res.status(404).json({ error: "Directory Not Found" });
    }

    async function getDirectoryContents(id) {
      let files = await File.find(
        { parentDirId: id },
        { _id: 1, name: 1, extension: 1 }
      ).lean();

      let directories = await Directory.find(
        { parentDirId: id },
        { _id: 1 }
      ).lean();

      for (const { _id } of directories) {
        const { files: childFiles, directories: childDirectories } =
          await getDirectoryContents(_id);
        files = [...files, ...childFiles];
        directories = [...directories, ...childDirectories];
      }

      return { files, directories };
    }

    const { files, directories } = await getDirectoryContents(dirObjId);

    for (const { name, extension } of files) {
      try {
        await rm(`./storage/${name}${extension}`);
      } catch (err) {
        console.error(`Failed to delete file: ${_id}${extension}`, err);
      }
    }

    await File.deleteMany({
      _id: { $in: files.map(({ _id }) => _id) },
    });

    await Directory.deleteMany({
      _id: { $in: [...directories.map(({ _id }) => _id), dirObjId] },
    });

    return res.status(200).json({ message: "Directory deleted successfully" });
  } catch (error) {
    console.error("Error deleting directory:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
