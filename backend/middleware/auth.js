import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not set");
      return res.status(500).json({ success: false, message: "Server misconfiguration" });
    }

    const decoded = jwt.verify(token, secret);

    // Attach basic user info to request (without password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid token - user missing" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message || error);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default authMiddleware;
