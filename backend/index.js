import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import bodyParser from 'body-parser'
import userRoutes from './routes/userRoutes.js'

dotenv.config()

const PORT = process.env.PORT || 5555;

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.use('/api/user', userRoutes)
app.get('/', (req, res)=>{
    return res.status(200).send('Active')
})



app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})