import express from 'express'
import { createWriteStream } from 'fs'
import cors from 'cors'
import { readdir, rename, rm, stat } from 'fs/promises'

const app = express()
app.use(express.json())

app.use(cors())


// app.get("/files/:filename", (req, res) => {
//   const { filename } = req.params
//   if (req.query.action === "download") {
//     res.set('Content-Disposition', 'attachment')
//   }
//   res.sendFile(`${import.meta.dirname}/storage/${filename}`)
// })


  app.get("/files/*", (req, res) => {
      const {0:filePath}=req.params
    if (req.query.action === "download") {
      res.set('Content-Disposition', 'attachment')
    }
    res.sendFile(`${import.meta.dirname}/storage/${filePath}`)
  })
  
app.post('/files/*', async (req, res) => {
  const writeStream = await createWriteStream(`./storage/${req.params[0]}`)
  req.pipe(writeStream)
  req.on("end", () => {
    res.json({ message: "File uploaded" })
  })
})

app.delete("/files/*", async (req, res) => {
  const { 0:filePath } = req.params
  const fileDelete = `${import.meta.dirname}/storage/${filePath}`
  try {
    await rm(fileDelete,{recursive:true})
    res.json({ message: "file deleted successfully" })
  } catch (err) {
    res.sendStatus(404).json({ message: "file not found" })
  }
})

app.patch("/files/*", async (req, res) => {
  const { 0:filePath } = req.params
  await rename(`./storage/${filePath}`, `./storage/${req.body.newFilename}`)
  res.json({ message: "Renamed" });
})

// serving Dir
app.get('/directory/?*', async (req, res) => {
  const {0:dirname}=req.params
  // console.log(dirname)
  const fullDirPath = `./storage/${dirname ? dirname : ''}`
  const filesList = await readdir(fullDirPath)
  const resData = []
  for (const item of filesList) {
    const stats = await stat(`${fullDirPath}/${item}`)
    resData.push({ name: item, isDirectory: stats.isDirectory() })
  }
  res.json(resData)
})

app.listen(4000, () => {
  console.log('Server is running on http://localhost:4000')
})