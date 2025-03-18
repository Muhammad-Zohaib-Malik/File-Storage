import { rm } from "fs/promises";
import { ObjectId } from "mongodb";

export const createDirectory = async (req, res, next) => {
  const user = req.user;
  const db = req.db;
  const dirCollection = db.collection("directories");
  const parentDirId = req.params.parentDirId
    ? new ObjectId(req.params.parentDirId)
    : user.rootDirId;
  const dirname = req.headers.dirname || "New Folder";
  const parentDir = await dirCollection.findOne({
    _id: parentDirId,
  });
  if (!parentDir)
    return res
      .status(404)
      .json({ message: "Parent Directory Does not exist!" });

  try {
    await dirCollection.insertOne({
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
  const db = req.db;
  const user = req.user;
  const _id = req.params.id ? new ObjectId(req.params.id) : user.rootDirId;
  const dirCollection = db.collection("directories");
  const directoryData = await dirCollection.findOne({
    _id,
  });
  if (!directoryData) {
    return res
      .status(404)
      .json({ error: "Directory not found or you do not have access to it!" });
  }

  const files = await db
    .collection("files")
    .find({ parentDirId: directoryData._id })
    .toArray();
  const directories = await dirCollection.find({ parentDirId: _id }).toArray();
  return res.status(200).json({
    ...directoryData,
    files: files.map((file) => ({ ...file, id: file._id })),
    directories: directories.map((dir) => ({ ...dir, id: dir._id })),
  });
};

export const updateDirectory = async (req, res, next) => {
  const user = req.user;
  const db = req.db;
  const { id } = req.params;
  const { newDirName } = req.body;
  const dirCollection = db.collection("directories");
  try {
    await dirCollection.updateOne(
      { _id: new ObjectId(id), userId: user._id },
      { $set: { name: newDirName } }
    );
    dirData.name = newDirName;
    return res.status(200).json({ message: "Directory Renamed!" });
  } catch (err) {
    next(err);
  }
};

export const deleteDirectory = async (req, res, next) => {
  const user = req.user;
  const db = req.db;
  const { id } = req.params;
  const filesCollection = db.collection("files");
  const dirCollection = db.collection("directories");
  const dirObjId = new ObjectId(id);

  async function getDirectoryContents(id) {
    let files = await filesCollection
      .find({ parentDirId: id }, { projection: { extension: 1 } })
      .toArray();
    let directories = await dirCollection
      .find({ parentDirId: id }, { projection: { _id: 1 } })
      .toArray();

    for (const { _id } of directories) {
      const { files: childFiles, directories: childDirectories } =
        await getDirectoryContents(_id);
      files = [...files, ...childFiles];
      directories = [...directories, ...childDirectories];
    }

    return { files, directories };
  }

  const { files, directories } = await getDirectoryContents(dirObjId);
  console.log(files, directories);
  for (const { _id, extension } of files) {
    await rm(`./storage/${_id.toString()}${extension}`);
  }

  await filesCollection.deleteMany({
    _id: { $in: files.map(({ _id }) => _id) },
  });
  await dirCollection.deleteMany({
    _id: { $in: [...directories.map(({ _id }) => _id), dirObjId] },
  });

  return res.status(201).json({});
};
