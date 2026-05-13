import express from "express";

import questionRouter from "./Question.js";
import answerRouter from "./Answer.js";
import commentRouter from "./Comments.js";
import authRouter from "./auth.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Test Route
router.get("/", (req, res) => {
  res.send("Welcome to Stack Overflow Clone API");
});

// Routes
router.use("/auth", authRouter);

// Protect question/answer/comment routes with auth middleware
router.use("/question", authMiddleware, questionRouter);

router.use("/answer", authMiddleware, answerRouter);

router.use("/comment", authMiddleware, commentRouter);

export default router;