import express from 'express'
import { createWriteStream } from 'fs'
import cors from 'cors'
import { readdir, rename, rm, stat,mkdir } from 'fs/promises'
import path from 'path'
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
     const filePath=path.join("/",req.params[0])
    if (req.query.action === "download") {
      res.set('Content-Disposition', 'attachment')
    }
    res.sendFile(`${import.meta.dirname}/storage/${filePath}`,(err)=>{
      if(err)
      {
        res.json({err:"File not found!"})
      }
    })
  })
  
app.post('/files/*', async (req, res) => {
 const filePath=path.join("/",req.params[0])
  const writeStream = await createWriteStream(`./storage/${filePath}`)
  req.pipe(writeStream)
  req.on("end", () => {
    res.json({ message: "File uploaded" })
  })
})

app.delete("/files/*", async (req, res) => {
  const filePath=path.join("/",req.params[0])
  const fileDelete = `${import.meta.dirname}/storage/${filePath}`
  try {
    await rm(fileDelete,{recursive:true})
    res.json({ message: "file deleted successfully" })
  } catch (err) {
    res.sendStatus(404).json({ message: "file not found" })
  }
})

app.patch("/files/*", async (req, res) => {
  const filePath=path.join("/",req.params[0])
  await rename(`./storage/${filePath}`, `./storage/${req.body.newFilename}`)
  res.json({ message: "Renamed" });
})

// serving Dir
app.get('/directory/?*', async (req, res) => {
 const dirname=path.join("/",req.params[0])

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
  res.json({error:err.message})
  
 }
})

app.post('/directory/*',async(req,res)=>{
  try {
     const dirname=path.join("/",req.params[0])
 await mkdir(`./storage/${dirname}`)
 res.json({message:"Directory created"})
    
  } catch (error) {
      res.json({err:err.message})
  }
})

app.listen(4000, () => {
  console.log('Server is running on http://localhost:4000')
})