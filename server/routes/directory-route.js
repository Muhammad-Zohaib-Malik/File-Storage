import { readdir, stat, mkdir } from 'fs/promises'
import path from 'path'
import { Router } from 'express'
const directoryRoutes=Router()

directoryRoutes.get('/?*', async (req, res) => {
  const dirname = path.join("/", req.params[0])

  const fullDirPath = `./storage/${dirname ? dirname : ''}`
  try {
    const filesList = await readdir(fullDirPath)
    const resData = []
    for (const item of filesList) {
      const stats = await stat(`${fullDirPath}/${item}`)
      resData.push({ name: item, isDirectory: stats.isDirectory() })
    }
    res.json(resData)

  } catch (err) {
    res.json({ error: err.message })

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