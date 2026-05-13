import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    question_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Questions",
      required: true,
    },

    answer: {
      type: String,
      required: true,
    },

    user: {
      type: Object,
      required: true,
    },

    votes: {
      type: Number,
      default: 0,
    },

    voters: [
      {
        userId: { type: String },
        vote: { type: Number },
      },
    ],

    comment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comments",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const Answer = mongoose.model(
  "Answers",
  answerSchema
);

export default Answer;