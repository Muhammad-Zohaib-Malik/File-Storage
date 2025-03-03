import { createWriteStream } from 'fs'
import { rename, rm } from 'fs/promises'
import path from 'path'
import { Router } from 'express'

const filesRoutes=Router()

filesRoutes.get("/*", (req, res) => {
  const filePath = path.join("/", req.params[0])
  if (req.query.action === "download") {
    res.set('Content-Disposition', 'attachment')
  }
    console.log(`${import.meta.dirname}/storage/${filePath}`)
  res.sendFile(`${process.cwd()}/storage/${filePath}`, (err) => {
    if (err) {
      res.json({ err: "File not found!" })
    }
  })
})

filesRoutes.post('/*', async (req, res) => {
  const filePath = path.join("/", req.params[0])
  const writeStream = await createWriteStream(`./storage/${filePath}`)
  req.pipe(writeStream)
  req.on("end", () => {
    res.json({ message: "File uploaded" })
  })
})

filesRoutes.delete("/*", async (req, res) => {
  const filePath = path.join("/", req.params[0])
  const fileDelete = `${import.meta.dirname}/storage/${filePath}`
  try {
    await rm(fileDelete, { recursive: true })
    res.json({ message: "file deleted successfully" })
  } catch (err) {
    res.sendStatus(404).json({ message: "file not found" })
  }
})

filesRoutes.patch("/*", async (req, res) => {
  const filePath = path.join("/", req.params[0])
  await rename(`./storage/${filePath}`, `./storage/${req.body.newFilename}`)
  res.json({ message: "Renamed" });
})


export default filesRoutes