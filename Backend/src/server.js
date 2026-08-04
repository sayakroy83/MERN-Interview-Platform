import express from 'express'
import {ENV} from "./lib/env.js"
import path from "path"
import { connectDB } from './lib/db.js'
import cors from "cors"
import {serve} from "inngest/express"
import { inngest, functions } from './lib/inngest.js'
import { clerkMiddleware } from "@clerk/express"
import chatRoutes from "./routes/chatRoutes.js"
import sessionRoutes from "./routes/sessionRoutes.js"

const app = express()

const __dirname = path.resolve()

//middleware
app.use(express.json())
app.use(cors({origin:ENV.CLIENT_URL, credentials: true}))

app.use((req,res,next)=>{ //added by chatgpt
    console.log(req.headers.cookie);
    next();
})
app.use(clerkMiddleware()) //this adds a field to request object: req.auth()

app.use((req, res, next) => { //added by chatgpt
  console.log("\n========== INCOMING REQUEST ==========");
  console.log(req.method, req.originalUrl);
  console.log("Origin:", req.headers.origin);
  console.log("Cookie:", req.headers.cookie || "No cookies");
  console.log("Authorization:", req.headers.authorization || "No Authorization");
  console.log("======================================\n");
  next();
});

app.use('/api/inngest', serve({client:inngest, functions}))
app.use('/api/chat', chatRoutes)
app.use('/api/sessions', sessionRoutes)

app.get('/health', (req, res)=> {
    res.status(200).json({msg: "API is up & running"})
})

app.get("/test", (req, res) => {
    console.log("TEST ROUTE HIT");
    res.json({ ok: true });
});

//app ready for deployment
// if(ENV.NODE_ENV === 'production') {
//     app.use(express.static(path.join(__dirname, "../Frontend/dist")))

//     app.get("/{*any}", (req, res)=> {
//         res.sendFile(path.join(__dirname, "../Frontend", "dist", "index.html"))
//     })
// }



const startServer = async ()=> {
    try {
      await connectDB();
      app.listen(ENV.PORT, ()=> console.log(`server is running on port ${ENV.PORT}`))
    } catch (error) {
        console.error("☠️ Error starting the server", error)
    }
}

startServer();