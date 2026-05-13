import express from "express";
import mongoose from "mongoose";

import Answer from "../models/Answers.js";

const router = express.Router();

// Add Answer
router.post("/", async (req, res) => {
  try {
    // Validate question_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.body.question_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID format",
      });
    }

    const user = req.user;

    const answerData = new Answer({
      question_id: new mongoose.Types.ObjectId(req.body.question_id),
      answer: req.body.answer,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

    const savedAnswer = await answerData.save();

    res.status(201).json({
      success: true,
      data: savedAnswer,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Answer not added successfully",
    });
  }
});

export default router;

// Vote on an answer
router.post("/:id/vote", async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'up' or 'down'

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid answer ID" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.user._id.toString();

    const answer = await Answer.findById(id);
    if (!answer) return res.status(404).json({ success: false, message: "Answer not found" });

    const existing = (answer.voters || []).find((v) => v.userId === userId);
    const voteValue = type === "up" ? 1 : type === "down" ? -1 : 0;
    if (voteValue === 0) return res.status(400).json({ success: false, message: "Invalid vote type" });

    let voteDelta = 0;
    if (!existing) {
      answer.voters.push({ userId, vote: voteValue });
      voteDelta = voteValue;
    } else if (existing.vote === voteValue) {
      answer.voters = answer.voters.filter((v) => v.userId !== userId);
      voteDelta = -voteValue;
    } else {
      existing.vote = voteValue;
      voteDelta = voteValue * 2;
    }

    answer.votes = (answer.votes || 0) + voteDelta;
    await answer.save();

    return res.status(200).json({ success: true, data: { votes: answer.votes, voters: answer.voters } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to process vote" });
  }
});