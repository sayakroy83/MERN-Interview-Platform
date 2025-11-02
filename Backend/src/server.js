import express from 'express'
import {ENV} from "./lib/env.js"
import path from "path"
import { connectDB } from './lib/db.js'

const app = express()

const __dirname = path.resolve()

app.get('/health', (req, res)=> {
    res.status(200).json({msg: "API is up & running"})
})

app.get('/books', (req, res)=> {
    res.status(200).json({msg: "this one is for books"})
})


//app ready for deployment
if(ENV.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, "../Frontend/dist")))

    app.get("/{*any}", (req, res)=> {
        res.sendFile(path.join(__dirname, "../Frontend", "dist", "index.html"))
    })
}



const startServer = async ()=> {
    try {
      await connectDB();
      app.listen(ENV.PORT, ()=> console.log(`server is running on port ${ENV.PORT}`))
    } catch (error) {
        console.error("☠️ Error starting the server", error)
    }
}

startServer();