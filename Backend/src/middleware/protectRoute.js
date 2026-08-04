import { requireAuth } from "@clerk/express";
import User from "../models/User.js";

export const protectRoute = [
  requireAuth(),

  async (req, res, next) => {
    try {
      console.log("\n========== AUTH DEBUG ==========");

      console.log("\nRequest URL:");
      console.log(req.method, req.originalUrl);

      console.log("\nCookies:");
      console.log(req.headers.cookie || "No cookies");

      console.log("\nAuthorization Header:");
      console.log(req.headers.authorization || "No Authorization header");

      console.log("\nreq.auth():");
      console.dir(req.auth(), { depth: null });

      const auth = req.auth();

      console.log("\nAuthentication Status:");
      console.log("isAuthenticated:", auth?.isAuthenticated);
      console.log("userId:", auth?.userId);
      console.log("sessionId:", auth?.sessionId);
      console.log("sessionStatus:", auth?.sessionStatus);
      console.log("tokenType:", auth?.tokenType);

      const clerkId = auth?.userId;

      if (!clerkId) {
        console.log("\n❌ No Clerk userId found.");
        return res.status(401).json({
          success: false,
          message: "Authentication failed",
          auth,
        });
      }

      console.log("\nLooking up Mongo user...");
      const user = await User.findOne({ clerkId });

      console.log("Mongo User:");
      console.dir(user, { depth: null });

      if (!user) {
        console.log("❌ Mongo user not found");
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      console.log("✅ Authentication successful");
      console.log("===============================\n");

      req.user = user;
      next();

    } catch (error) {
      console.error("\n🔥 protectRoute Error:");
      console.error(error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
];