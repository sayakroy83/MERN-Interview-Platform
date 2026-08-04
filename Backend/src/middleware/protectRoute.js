import { requireAuth } from "@clerk/express";
import User from "../models/User.js";

export const protectRoute = [
  (req, res, next) => {
    console.log(">>> protectRoute START");
    next();
  },

  requireAuth(),

  async (req, res, next) => {
    console.log(">>> AFTER requireAuth");

    try {
      const auth = req.auth();

      console.log("AUTH OBJECT:");
      console.log(auth);

      console.log("USER ID:", auth?.userId);

      if (!auth?.userId) {
        return res.status(401).json({
          message: "No userId returned by Clerk",
        });
      }

      const user = await User.findOne({
        clerkId: auth.userId,
      });

      console.log("Mongo user:", user);

      if (!user) {
        return res.status(404).json({
          message: "Mongo user not found",
        });
      }

      req.user = user;

      next();
    } catch (err) {
      console.error("protectRoute error");
      console.error(err);

      res.status(500).json({
        message: err.message,
      });
    }
  },
];