import mongoose from "mongoose"
import {ENV} from "./env.js"

export const connectDB = async(req, res)=> {
    try {
        if(!ENV.DB_URL) {
            throw new Error("DB_URL is not defined in enviroment variables");
        }
        const conn = await mongoose.connect(ENV.DB_URL)
        console.log("MongoDB connection successfull✅ :", conn.connection.host)
    } catch (error) {
        console.error("❌ Error connecting mongoDB", error)
        process.exit(1) //0 means success and 1 means fail
    }
}