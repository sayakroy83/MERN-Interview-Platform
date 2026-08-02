import { requireAuth } from "@clerk/express";
import User from "../models/User.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      console.log("========== AUTH DEBUG ==========");
      console.log("Headers:");
      console.log(req.headers);

      console.log("Auth:");
      console.log(req.auth());

      const clerkId = req.auth().userId;

      console.log("Clerk ID:", clerkId);

      if (!clerkId) {
        return res.status(401).json({ msg: "No clerkId" });
      }

      const user = await User.findOne({ clerkId });

      console.log("Mongo User:", user);

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      req.user = user;
      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: err.message });
    }
  },
];