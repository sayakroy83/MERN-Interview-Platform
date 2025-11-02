import mongoose from "mongoose"
import {ENV} from "./env.js"

export const connectDB = async(req, res)=> {
    try {
        const conn = await mongoose.connect(ENV.DB_URL)
        console.log("MongoDB connection successfull✅ :", conn.connection.host)
    } catch (error) {
        console.error("❌ Error connecting mongoDB", error)
        process.exit(1) //0 means success and 1 means fail
    }
}