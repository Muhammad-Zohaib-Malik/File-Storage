import { rm, writeFile } from 'fs/promises'
import { Router } from 'express'
const directoryRoutes = Router()
import directoriesData from '../directoryDb.json' with {type: "json"}
import filesData from "../filesDb.json" with { type: "json" };


directoryRoutes.get('/:id?', async (req, res) => {
  const id = req.params.id || directoriesData?.[0]?.id

  const directoryData = directoriesData.find((folder) => folder.id === id)
  if (!directoryData) {
    return res.status(404).json({ message: 'Directory not found' });
  }

  const files = directoryData.files.map((fileId) =>
    filesData.find((file) => file.id === fileId)
  )
  const directories = directoryData.directories.map((dirId) => directoriesData.find((dir) => dir.id === dirId)).map(({ id, name }) => ({ id, name }))
  res.status(200).json({ ...directoryData, files, directories })

})

directoryRoutes.post('/:parentDirId?', async (req, res,next) => {
  const parentDirId = req.params.parentDirId || directoriesData[0].id
  const dirname = req.headers.dirname || "New Folder"
  const id = crypto.randomUUID()
  if (!parentDirId) {
    return res.status(400).json({ message: "No valid parent directory found" });
  }
  const parentDir = directoriesData.find((dir) => dir.id === parentDirId)
  if (!parentDir) {
    return res.status(404).json({ message: "Parent directory not found" });
  }

  parentDir.directories.push(id)
  directoriesData.push({
    id,
    name: dirname,
    parentDirId,
    files: [],
    directories: []
  })
  try {
    await writeFile('./directoryDb.json', JSON.stringify(directoriesData))
    res.status(201).json({ message: "Directory created" })
  } catch (error) {

    console.error("Error deleting directory:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
    next(error)
  }
})

directoryRoutes.delete('/:id', async (req, res,next) => {
  try {
    const { id } = req.params
    const dirIndex = directoriesData.findIndex((directory) => directory.id === id)
    if (dirIndex === -1) {
      return res.status(404).json({ message: "Directory Not Found" })
    }
    const directoryData = directoriesData[dirIndex]
    directoriesData.splice(dirIndex, 1)


    for await (const fileId of directoryData.files) {
      const fileIndex = filesData.findIndex((file) => file.id === fileId)
      if (fileIndex !== -1) {
        const fileData = filesData[fileIndex];
        await rm(`./storage/${fileData.id}${fileData.extension}`);
        filesData.splice(fileIndex, 1);
      }
    }

    for await (const dirId of directoryData.directories) {
      const dirIndex = directoriesData.findIndex((Id) => Id.id === dirId)
      directoriesData.splice(dirIndex, 1)
    }

    const parentDirData = directoriesData.find((dirData) => dirData.id === directoryData.parentDirId)
    parentDirData.directories = parentDirData.directories.filter((dirId) => dirId !== id)

    await writeFile('./filesDb.json', JSON.stringify(filesData))
    await writeFile('./directoryDb.json', JSON.stringify(directoriesData))
    res.status(200).json({ message: "Directory Deleted!" });
  } catch (error) {
    console.error("Error deleting directory:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
    next(error)
  }
})

directoryRoutes.patch('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const { newDirName } = req.body;

    const dirData = directoriesData.find((dir) => dir.id == id);

    if (!dirData) {
      return res.status(404).json({ message: "Directory not found" });
    }

    dirData.name = newDirName;

    res.status(200).json({ message: "Directory updated successfully", dirData });
  } catch (error) {
    console.error("Error deleting directory:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
    next(error)
  }
})

export default directoryRoutes