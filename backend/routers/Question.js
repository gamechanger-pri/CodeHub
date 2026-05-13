import express from "express";
import mongoose from "mongoose";

import Question from "../models/Question.js";

const router = express.Router();

// Escape special regex characters to prevent injection attacks
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


// Add Question
router.post("/", async (req, res) => {
  try {

    // use authenticated user from middleware
    const user = req.user;

    const questionData = new Question({
      title: req.body.title,
      body: req.body.body,
      tags: req.body.tags,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

    const savedQuestion = await questionData.save();

    res.status(201).json({ success: true, data: savedQuestion });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Question not added successfully",
    });
  }
});




// Get All Questions
router.get("/", async (req, res) => {
  try {
    const questionDetails = await Question.aggregate([
      {
        $lookup: {
          from: "comments",
          let: { question_id: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$question_id", "$$question_id"] } } },
            { $project: { _id: 1, comment: 1, created_at: 1 } },
          ],
          as: "comments",
        },
      },
      {
        $lookup: {
          from: "answers",
          let: { question_id: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$question_id", "$$question_id"] } } },
            { $project: { _id: 1 } },
          ],
          as: "answerDetails",
        },
      },
      { $project: { __v: 0 } },
    ]);

    res.status(200).json({ success: true, data: questionDetails });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error retrieving questions" });
  }
});


// Search Questions
router.get("/search", async (req, res) => {
  const query = req.query.q || "";
  try {
    const escapedQuery = escapeRegex(query);
    const regex = new RegExp(escapedQuery, "i");
    const questionDetails = await Question.aggregate([
      {
        $match: {
          $or: [
            { title: regex },
            { body: regex },
            { tags: { $elemMatch: { $regex: regex } } },
          ],
        },
      },
      {
        $lookup: {
          from: "comments",
          let: { question_id: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$question_id", "$$question_id"] } } },
            { $project: { _id: 1, comment: 1, created_at: 1 } },
          ],
          as: "comments",
        },
      },
      {
        $lookup: {
          from: "answers",
          let: { question_id: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$question_id", "$$question_id"] } } },
            { $project: { _id: 1 } },
          ],
          as: "answerDetails",
        },
      },
      { $project: { __v: 0 } },
    ]);
    res.status(200).json({ success: true, data: questionDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error performing search" });
  }
});

// Search Suggestions (lightweight for dropdown)
router.get("/suggestions", async (req, res) => {
  const query = req.query.q || "";
  if (!query.trim()) {
    return res.status(200).json({ success: true, data: [] });
  }
  try {
    const escapedQuery = escapeRegex(query);
    const regex = new RegExp(escapedQuery, "i");
    const suggestions = await Question.find(
      {
        $or: [
          { title: regex },
          { tags: { $elemMatch: { $regex: regex } } },
        ],
      },
      { _id: 1, title: 1, tags: 1 }
    )
      .limit(8)
      .lean();
    res.status(200).json({ success: true, data: suggestions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching suggestions" });
  }
});

// Get Single Question (must be LAST to avoid catching /search, /suggestions)
router.get("/:id", async (req, res) => {
  try {
    // Validate id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID format",
      });
    }

    // increment views count atomically first
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      await Question.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).lean();
    }

    const questionDetails = await Question.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.id),
        },
      },
      {
        $lookup: {
          from: "answers",
          let: { question_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$question_id", "$$question_id"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                user: 1,
                answer: 1,
                question_id: 1,
                created_at: 1,
                votes: 1,
                isAccepted: 1,
              },
            },
          ],
          as: "answerDetails",
        },
      },
      {
        $lookup: {
          from: "comments",
          let: { question_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$question_id", "$$question_id"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                question_id: 1,
                user: 1,
                comment: 1,
                created_at: 1,
              },
            },
          ],
          as: "comments",
        },
      },
      {
        $project: {
          __v: 0,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: questionDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Question not found",
    });
  }
});


// Vote on a question (up/down)
router.post("/:id/vote", async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // expected 'up' or 'down'

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid question ID" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.user._id.toString();

    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ success: false, message: "Question not found" });

    const existing = (question.voters || []).find((v) => v.userId === userId);

    const voteValue = type === "up" ? 1 : type === "down" ? -1 : 0;
    if (voteValue === 0) {
      return res.status(400).json({ success: false, message: "Invalid vote type" });
    }

    let voteDelta = 0;

    if (!existing) {
      // add new vote
      question.voters.push({ userId, vote: voteValue });
      voteDelta = voteValue;
    } else if (existing.vote === voteValue) {
      // undo existing vote
      question.voters = question.voters.filter((v) => v.userId !== userId);
      voteDelta = -voteValue;
    } else {
      // flip vote
      existing.vote = voteValue;
      voteDelta = voteValue * 2;
    }

    question.votes = (question.votes || 0) + voteDelta;
    await question.save();

    return res.status(200).json({ success: true, data: { votes: question.votes, voters: question.voters } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to process vote" });
  }
});

export default router;