import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useSearchParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../feature/userSlice";
import Avatar from "@mui/material/Avatar";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import HistoryIcon from "@mui/icons-material/History";
import { stringAvatar, stringToHash } from "../../utils/Avatar";
import "./MainQuestion.css";

function MainQuestion() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("q");
  const user = useSelector(selectUser);

  const [questionData, setQuestionData] = useState(null);
  const [answer, setAnswer] = useState("");
  const [comment, setComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [error, setError] = useState(null);

  // Validate ObjectId format (24 hex characters)
  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  // Extracted refresh function to avoid code duplication
  const refreshQuestion = async () => {
    if (!id || !isValidObjectId(id)) {
      setError("Invalid question ID format");
      setQuestionData(null);
      return;
    }
    try {
      setError(null);
      const res = await axios.get(`/question/${id}`);
      const payload = res.data?.data ?? res.data;
      const question = Array.isArray(payload) ? payload[0] : payload;
      if (!question) {
        setError("Question not found");
        setQuestionData(null);
        return;
      }
      setQuestionData(question);
      setVoteCount(question?.votes || 0);
    } catch (err) {
      console.error(err);
      setError("Failed to load question. Please try again.");
      setQuestionData(null);
    }
  };

  useEffect(() => {
    refreshQuestion();
  }, [id]);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    try {
      await axios.post("/answer", {
        question_id: id,
        answer,
      });
      setAnswer("");
      // Refresh question data to show new answer
      await refreshQuestion();
    } catch (err) {
      console.error(err);
      setError("Failed to post answer. Please try again.");
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    try {
      await axios.post(`/comment/${id}`, {
        comment,
      });
      setComment("");
      setShowCommentBox(false);
      // Refresh question data
      await refreshQuestion();
    } catch (err) {
      console.error(err);
      setError("Failed to post comment. Please try again.");
    }
  };

  const handleVote = async (type) => {
    try {
      // Call backend to register vote; backend uses auth middleware so token must be present
      await axios.post(`/question/${id}/vote`, { type });
      // Refresh question to get updated votes
      await refreshQuestion();
    } catch (err) {
      console.error("Vote failed:", err);
      setError("Failed to register vote. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "asked just now";
    if (diffInSeconds < 3600) return `asked ${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `asked ${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `asked ${Math.floor(diffInSeconds / 86400)} days ago`;
    return `asked on ${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  if (error) {
    return (
      <div className="question-error" style={{ padding: "40px", textAlign: "center" }}>
        <h2 style={{ color: "#c0392b" }}>Error</h2>
        <p>{error}</p>
        <Link to="/" style={{ color: "#0074cc", marginTop: "20px", display: "inline-block" }}>
          Return to Home
        </Link>
      </div>
    );
  }

  if (!questionData) {
    return (
      <div className="question-loading">
        <div className="loading-spinner"></div>
        <p>Loading question...</p>
      </div>
    );
  }

  const tags = questionData.tags || [];
  const answers = questionData.answerDetails || [];
  const comments = questionData.comments || [];

  return (
    <div className="main-question">
      {/* HEADER */}
      <div className="question-header">
        <div className="question-header-top">
          <h1 className="question-title">{questionData.title}</h1>
          <Link to="/add-question">
            <button className="ask-question-btn">Ask Question</button>
          </Link>
        </div>
        <div className="question-meta">
          <span className="meta-item">{formatDate(questionData.created_at)}</span>
          <span className="meta-item">Viewed {questionData.views || 0} time{questionData.views !== 1 ? "s" : ""}</span>
          <span className="meta-item">Modified {formatDate(questionData.updated_at || questionData.created_at).replace("asked", "")}</span>
        </div>
      </div>

      {/* QUESTION CONTENT */}
      <div className="question-content">
        {/* VOTING SIDEBAR */}
        <div className="voting-sidebar">
          <button className="vote-btn upvote" onClick={() => handleVote("up")}>
            <ArrowUpwardIcon />
          </button>
          <div className="vote-count">{voteCount}</div>
          <button className="vote-btn downvote" onClick={() => handleVote("down")}>
            <ArrowDownwardIcon />
          </button>
          <button className="action-btn bookmark">
            <BookmarkBorderIcon />
          </button>
          <button className="action-btn history">
            <HistoryIcon />
          </button>
        </div>

        {/* QUESTION BODY */}
        <div className="question-body">
          <div
            className="question-text"
            dangerouslySetInnerHTML={{ __html: questionData.body }}
          />

          {/* TAGS */}
          <div className="question-tags">
            {tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>

          {/* AUTHOR CARD */}
          <div className="post-author-card">
            <div className="post-actions">
              <button className="action-link">Edit</button>
              <button className="action-link">Delete</button>
            </div>
            <div className="author-info">
              <div className="author-time">
                {formatDate(questionData.created_at).replace("asked ", "asked ")}
              </div>
              <div className="author-details">
                <Avatar
                    {...stringAvatar(questionData.user?.name || questionData.user?.displayName || "Anonymous")}
                  className="author-avatar"
                />
                <div className="author-meta">
                  <span className="author-name">
                    {questionData.user?.name || questionData.user?.displayName || "Anonymous"}
                  </span>
                  <span className="author-reputation">{(stringToHash(questionData.user?.name || questionData.user?.displayName || "Anonymous") % 5000) + 100}</span>
                </div>
              </div>
            </div>
          </div>

          {/* COMMENTS SECTION */}
          <div className="comments-section">
            {comments.length > 0 && (
              <div className="comments-list">
                {comments.map((comment, index) => (
                  <div key={index} className="comment">
                    <span className="comment-text">{comment.comment}</span>
                      <span className="comment-author">— {comment.user?.name || comment.user?.displayName || "Anonymous"}</span>
                    <span className="comment-date">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {!showCommentBox ? (
              <button
                className="add-comment-btn"
                onClick={() => setShowCommentBox(true)}
              >
                Add a comment
              </button>
            ) : (
              <div className="comment-box">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows="3"
                />
                <div className="comment-actions">
                  <button className="post-comment-btn" onClick={handleComment}>
                    Add Comment
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setShowCommentBox(false);
                      setComment("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ANSWERS SECTION */}
      <div className="answers-section">
        <div className="answers-header">
          <h2>{answers.length} Answer{answers.length !== 1 ? "s" : ""}</h2>
          <div className="answers-sort">
            <label>Sorted by:</label>
            <select defaultValue="votes">
              <option value="votes">Highest score (default)</option>
              <option value="newest">Date modified (newest first)</option>
              <option value="oldest">Date created (oldest first)</option>
            </select>
          </div>
        </div>

        {answers.map((answer) => (
          <div key={answer._id} className="answer-item">
            <div className="answer-voting-sidebar">
                  <button className="vote-btn upvote" onClick={async () => {
                    try {
                      await axios.post(`/answer/${answer._id}/vote`, { type: 'up' });
                      await refreshQuestion();
                    } catch (e) {
                      console.error('Answer vote failed', e);
                    }
                  }}>
                    <ArrowUpwardIcon />
                  </button>
                  <div className="vote-count">{answer.votes || 0}</div>
                  <button className="vote-btn downvote" onClick={async () => {
                    try {
                      await axios.post(`/answer/${answer._id}/vote`, { type: 'down' });
                      await refreshQuestion();
                    } catch (e) {
                      console.error('Answer vote failed', e);
                    }
                  }}>
                    <ArrowDownwardIcon />
                  </button>
              <div className={`accepted-badge ${answer.isAccepted ? "accepted" : ""}`}>
                {answer.isAccepted && "✓"}
              </div>
            </div>

            <div className="answer-content">
              <div
                className="answer-text"
                dangerouslySetInnerHTML={{ __html: answer.answer }}
              />

              <div className="post-author-card">
                <div className="post-actions">
                  <button className="action-link">Edit</button>
                  <button className="action-link">Delete</button>
                </div>
                <div className="author-info">
                  <div className="author-time">
                    answered {new Date(answer.created_at).toLocaleString()}
                  </div>
                  <div className="author-details">
                    <Avatar
                      {...stringAvatar(answer.user?.name || answer.user?.displayName || "Anonymous")}
                      className="author-avatar"
                    />
                    <div className="author-meta">
                      <span className="author-name">
                        {answer.user?.name || answer.user?.displayName || "Anonymous"}
                      </span>
                      <span className="author-reputation">{(stringToHash(answer.user?.name || answer.user?.displayName || "Anonymous") % 3000) + 50}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* YOUR ANSWER SECTION */}
      <div className="your-answer-section">
        <h2>Your Answer</h2>
        <div className="answer-editor">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your answer here..."
            rows="12"
          />
        </div>
        <div className="answer-actions">
          <button className="post-answer-btn" onClick={handleSubmit}>
            Post Your Answer
          </button>
        </div>
      </div>

      {/* RELATED QUESTIONS HINT */}
      <div className="related-hint">
        <p>
          Not the answer you're looking for? Browse other questions tagged{" "}
          {tags.map((tag, index) => (
            <span key={index}>
              <span className="tag-link">{tag}</span>
              {index < tags.length - 1 ? ", " : ""}
            </span>
          ))}{" "}
          or{" "}
          <Link to="/add-question" className="ask-link">ask your own question</Link>.
        </p>
      </div>
    </div>
  );
}

export default MainQuestion;