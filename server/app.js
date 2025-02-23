import express from 'express'

import {readdir,rm} from 'fs/promises'

const app = express()

//Enable cors
app.use((_, res, next) => {
  res.set({
    "Access-Control-Allow-Origin":"*",
    "Access-Control-Allow-Methods":"*"
  })
  next()
})  

app.get("/:filename",(req,res)=>{
  const {filename}=req.params
  if(req.query.action==="download")
  {
    res.set('Content-Disposition','attachment')
  }
  res.sendFile(`${import.meta.dirname}/storage/${filename}`)
})

app.delete("/:filename",async(req,res)=>{
  const {filename}=req.params
  const filePath=`${import.meta.dirname}/storage/${filename}`
  try{
   await rm(filePath)
    res.json({message:"file deleted successfully"})
  }catch(err){
    res.sendStatus(404).json({message:"file not found"})
  }
})

// serving Dir
app.get('/',async(_,res)=>{
  const filesList=await  readdir('./storage')
  res.json(filesList)
})

app.listen(4000, () => {
  console.log('Server is running on http://localhost:4000')
})