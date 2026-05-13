import React from "react";
import "./css/AllQuestions.css";

import Avatar from "@mui/material/Avatar";
import { Link } from "react-router-dom";
import { stringAvatar } from "../../utils/Avatar";

function AllQuestions({ data }) {

  // truncate text
  function truncate(str, n) {
    return str?.length > n
      ? str.substr(0, n - 1) + "..."
      : str;
  }

  // safe tag parsing
  const tags = data?.tags || [];

  return (
    <div className="all-questions">

      <div className="all-questions-container">

        {/* LEFT SIDE */}
        <div className="all-questions-left">

          <div className="all-options">

            <div className="all-option">
              <p>{data?.votes || 0}</p>
              <span>votes</span>
            </div>

            <div className="all-option">
              <p>{data?.answerDetails?.length || 0}</p>
              <span>answers</span>
            </div>

            <div className="all-option">
              <small>{data?.views || 0} views</small>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="question-answer">

          {/* QUESTION TITLE */}
          <Link to={`/question?q=${data?._id}`}>
            {data?.title || "Untitled Question"}
          </Link>

          {/* QUESTION BODY */}
          <div
            style={{
              maxWidth: "90%",
            }}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: truncate(data?.body || "", 200),
              }}
            />
          </div>

          {/* TAGS */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {tags.map((tag, index) => (
              <p
                key={index}
                style={{
                  margin: "10px 5px",
                  padding: "5px 10px",
                  backgroundColor: "#007cd446",
                  borderRadius: "3px",
                }}
              >
                {tag}
              </p>
            ))}
          </div>

          {/* AUTHOR */}
          <div className="author">

            <small>
              {data?.created_at
                ? new Date(data.created_at).toLocaleString()
                : "No date"}
            </small>

            <div className="auth-details">

              <Avatar
                {...stringAvatar(
                    data?.user?.name || data?.user?.displayName || "Anonymous User"
                  )}
              />

              <p>
                {data?.user?.name || data?.user?.displayName || "Anonymous User"}
              </p>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default AllQuestions;