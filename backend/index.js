import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import bodyParser from 'body-parser'
import userRoutes from './routes/userRoutes.js'


const app = express()
app.use(cors())
app.use(bodyParser)

app.use('/api/user', userRoutes)




app.listen(5000, ()=>{
    console.log('Server is running')
})