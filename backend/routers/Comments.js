import express from "express";
import mongoose from "mongoose";

import Comment from "../models/Comments.js";

const router = express.Router();

// Add Comment
router.post("/:id", async (req, res) => {
  try {
    // Validate question_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID format",
      });
    }

    const newComment = await Comment.create({
        question_id: new mongoose.Types.ObjectId(req.params.id),
        comment: req.body.comment,
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
    });

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: newComment,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Error while adding comment",
    });
  }
});

export default router;