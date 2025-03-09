import { mkdir } from 'fs/promises'
import path from 'path'
import { Router } from 'express'
const directoryRoutes = Router()
import directoriesData from '../directoryDb.json' with {type: "json"}
import filesData from "../filesDb.json" with { type: "json" };


directoryRoutes.get('/:id?', async (req, res) => {
  const { id } = req.params
  if (!id) {
    const directoryData=directoriesData[0]
    const files=directoryData.files.map((fileId)=>
    filesData.find((file)=>file.id===fileId)
    )
    res.json({...directoryData,files})
  }
  else {
    const directoryData = directoriesData.find((folder) => folder.id === id);
    if (!directoryData) {
      return res.status(404).json({ message: "File not found!" });
    }
    res.json(directoryData)
  }




})

directoryRoutes.post('/*', async (req, res) => {
  try {
    const dirname = path.join("/", req.params[0])
    await mkdir(`./storage/${dirname}`)
    res.json({ message: "Directory created" })

  } catch (error) {
    res.json({ err: err.message })
  }
})

export default directoryRoutes