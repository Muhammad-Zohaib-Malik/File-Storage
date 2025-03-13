import express from 'express'
import cors from 'cors'
const app = express()
app.use(express.json())
import directoryRoutes from './routes/directory-route.js'
import filesRoutes from './routes/file-route.js'
import userRoutes from './routes/users-route.js'

app.use(cors())

app.use((err,req,res,next)=>{
   res.status(500).json({message:"Something went wrong"})
})

app.use('/directory',directoryRoutes)
app.use('/file',filesRoutes)  
app.use('/users',userRoutes)  




app.listen(4000, () => {
  console.log('Server is running on http://localhost:4000')
})