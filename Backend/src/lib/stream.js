import { StreamChat } from "stream-chat"
import { ENV } from "./env.js"

const apiKey = ENV.STREAM_API_KEY
const apiSecret = ENV.STREAM_API_SECRET

if(!apiKey || !apiSecret) {
    console.error("STREAM_API_KEY or STREAM_API_SECRET is missing")
}

export const chatClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async(userData) => {  //upsert means both creating and updating the data
    try {
        await chatClient.upsertUser(userData)
        console.log("stream user upserted successfully:", userData)
    } catch (error) {
        console.error("Error upserting stream user:", error)
    }
}

export const deleteStreamUser = async(userId) => {  
    try {
        await chatClient.upsertUser([userId])
        console.log("stream user deleted successfully:", userId)
    } catch (error) {
        console.error("Error deleting stream user:", error)
    }
}

//todo: add another method to generate token