import express from 'express'
import {readdir} from 'fs/promises'

const app = express()

//Enable cors
app.use((_, res, next) => {
  res.set("Access-Control-Allow-Origin","*")
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

// serving Dir
app.get('/',async(_,res)=>{
  const filesList=await  readdir('./storage')
  res.json(filesList)
})

app.listen(4000, () => {
  console.log('Server is running on http://localhost:4000')
})