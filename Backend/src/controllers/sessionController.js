import Session from "../models/Session.js"
import { chatClient, streamClient } from "../lib/stream.js"


export async function createSession(req, res) {
    try {
        console.log("========== CREATE SESSION ==========");
        console.log("Body:", req.body);
        console.log("User:", req.user);

        const { problem, difficulty } = req.body;

        const userId = req.user._id;
        const clerkId = req.user.clerkId;

        console.log("Step 1");

        const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        console.log("Step 2");

        const session = await Session.create({
            problem,
            difficulty,
            host: userId,
            callId,
        });

        console.log("Step 3 - MongoDB session created");

        await streamClient.video
            .call("default", callId)
            .getOrCreate({
                data: {
                    created_by_id: clerkId,
                    custom: {
                        problem,
                        difficulty,
                        sessionId: session._id.toString(),
                    },
                },
            });

        console.log("Step 4 - Stream Video created");

        const channel = chatClient.channel("messaging", callId, {
            name: `${problem} Session`,
            created_by_id: clerkId,
            members: [clerkId],
        });

        console.log("Step 5");

        await channel.create();

        console.log("Step 6");

        return res.status(201).json({ session });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: err.message,
            stack: err.stack,
        });
    }
}

export async function getActiveSessions(_, res) {
    try {
        const sessions = await Session.find({status: "active"})
         .populate("host", "name profileImage email clerkId")
         .populate("participant", "name profileImage email clerkId")
         .sort({createdAt: -1})
         .limit(20);

        res.status(200).json({sessions})

    } catch (error) {
        console.log("Error in getActiveSessions controller:", error.message)
        res.status(500).json({msg: "Interval server error"})
    }
}

export async function getMyRecentSessions(req, res) {
    try {
        const userId = req.user._id

        //get sessions where user is either host or participant
        const sessions = await Session.find({
            status: "completed", 
            $or: [{host:userId}, {participant:userId}]
        })
        .sort({createdAt: -1})
        .limit(20)

        res.status(200).json({sessions})
    } catch (error) {
        console.log("Error in getMyRecentSessions controller:", error.message)
        res.status(500).json({msg: "Internal server error"})
    }
}

export async function getSessionById(req, res) {
    try {
        const {id} = req.params

        const session = await Session.findById(id)
         .populate("host", "name email profileImage clerkId")
         .populate("participant", "name email profileImage clerkId")
        
        if(!session) return res.status(404).json({msg: "Session not found"})

        res.status(200).json({session})
    } catch (error) {
        console.log("Error in getSessionById controller:", error.message)
        res.status(500).json({msg: "Internal server error"})
    }
}

export async function joinSession(req, res) {
    try {
        const {id} = req.params
        const userId = req.user._id
        const clerkId = req.user.clerkId

        const session = await Session.findById(id)

        if(!session) return res.status(404).json({msg: "Session not found"})

        if(session.status !== "active") {
            return res.status(400).json({msg: "Cannot join a completed session"})
        }

        if(session.host.toString() === userId.toString()) {
            return res.status(400).json({msg: "Host cannot join their own session as participant"})
        }

        if(session.participant) return res.status(409).json({msg: "Session is full"})

        session.participant = userId
        await session.save()

        const channel = chatClient.channel("messaging", session.callId)
        await channel.addMembers([clerkId])

        res.status(200).json({session})
    } catch (error) {
        console.log("Error in joinSession controller:", error.message)
        res.status(500).json({msg: "Internal server error"})
    }
}

export async function endSession(req, res) {
    try {
        const {id} = req.params
        const userId = req.user._id
        
        const session = await Session.findById(id)

        if(!session) return res.status(404).json({msg: "Session not found"})
        
        if(session.host.toString() !== userId.toString()) {
            return res.status(403).json({msg: "only the host can end the session"})
        }

        if(session.status === "completed") {
            return res.status(400).json({msg: "Session is already completed"})
        }


        //delete stream video call
        const call = streamClient.video.call("default", session.callId)
        await call.delete({hard: true})

        //delete stream chat channel
        const channel = chatClient.channel("messaging", session.callId)
        await channel.delete()

        session.status = "completed"
        await session.save()

        res.status(200).json({msg: "Session ended successfully"})
    } catch (error) {
        console.log("Error in endSession controller:", error.message)
        res.status(500).json({msg: "Internal server error"})
    }
}