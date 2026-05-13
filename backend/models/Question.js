import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    body: {
      type: String,
      required: true,
    },

    tags: [
      {
        type: String,
      },
    ],

    user: {
      type: Object,
      required: true,
    },

    views: {
      type: Number,
      default: 0,
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

const Question = mongoose.model(
  "Questions",
  questionSchema
);

export default Question;