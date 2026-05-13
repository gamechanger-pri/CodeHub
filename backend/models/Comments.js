import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    question_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Questions",
      required: true,
    },

    comment: {
      type: String,
      required: true,
    },

    user: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const Comment = mongoose.model(
  "Comments",
  commentSchema
);

export default Comment;