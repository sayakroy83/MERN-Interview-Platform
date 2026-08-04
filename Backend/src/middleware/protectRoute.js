import { requireAuth } from "@clerk/express";
import User from '../models/User.js'

export const protectRoute = [
    requireAuth(),
    async (req, res, next) => {
        try {
            const clerkId = req.auth().userId;
            if(!clerkId) return res.status(401).json({msg: "unauthorized - invalid token"})

                console.log(req.auth());
            
            //find user in DB by clerkId
            const user = await User.findOne({clerkId})
            if(!user) return res.status(404).json({msg: "user not found"})
            
            //attach user to req
            req.user = user
            next()
        } catch (error) {
            console.error("error in protectRoute middleware", error)
            res.status(500).json({msg: "Internal server error"})
        }
    }
]