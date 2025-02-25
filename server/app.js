import express from 'express'
import { createWriteStream } from 'fs'
// import cors from 'cors'
import { readdir, rename, rm } from 'fs/promises'

const app = express()
app.use(express.json())
// app.use(cors({
//     origin: 'http://localhost:5173', // Allow frontend origin
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Allow PATCH
// }))

// Enable cors manually
app.use((_, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers":"*"
  })
  next()
})

app.get("/:filename", (req, res) => {
  const { filename } = req.params
  if (req.query.action === "download") {
    res.set('Content-Disposition', 'attachment')
  }
  res.sendFile(`${import.meta.dirname}/storage/${filename}`)
})

app.post('/:filename',(req,res)=>{
  const writeStream=createWriteStream(`./storage/${req.params.filename}`)
  req.pipe(writeStream)
  req.on("end",()=>{
    res.json({message:"File uploaded"})
  })
})

app.delete("/:filename", async (req, res) => {
  const { filename } = req.params
  const filePath = `${import.meta.dirname}/storage/${filename}`
  try {
    await rm(filePath)
    res.json({ message: "file deleted successfully" })
  } catch (err) {
    res.sendStatus(404).json({ message: "file not found" })
  }
})

app.patch("/:filename", async (req, res) => {
  const { filename } = req.params
  const { newFileName } = req.body
  await rename(`./storage/${filename}`,`./storage/${newFileName}`)
      res.sendStatus(201).json({ message: "file rename successfully" })
})

// serving Dir
app.get('/', async (_, res) => {
    const filesList = await readdir('./storage')  
    res.json(filesList)
  })

app.listen(4000, () => {
  console.log('Server is running on http://localhost:4000')
})