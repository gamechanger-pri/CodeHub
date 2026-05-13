import React, { useState } from "react";
import "./index.css";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import axios from "../../api/axios";
import { TagsInput } from "react-tag-input-component";
import { useSelector } from "react-redux";
import { selectUser } from "../../feature/userSlice";
import { useNavigate } from "react-router-dom";

function Index() {
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState([]);

  const modules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
    ],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !body) {
      alert("Title and body required");
      return;
    }

    try {
      // Ensure we send an array of trimmed strings for tags
      const normalizedTags = (tags || [])
        .map((t) => {
          if (!t) return "";
          if (typeof t === "string") return t.trim();
          if (typeof t === "object") return (t.value || t.label || "").toString().trim();
          return String(t).trim();
        })
        .filter(Boolean);

      await axios.post("/question", {
        title,
        body,
        tags: normalizedTags,
      });

      alert("Question added successfully");
      navigate("/");
    } catch (err) {
      console.error("Error adding question:", err);
    }
  };

  return (
    <div className="add-question">
      <div className="add-question-container">

        <h1>Ask a public question</h1>

        <div className="question-option">
          <h3>Title</h3>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. How to reverse an array?"
          />
        </div>

        <div className="question-option">
          <h3>Body</h3>
          <ReactQuill
            value={body}
            onChange={setBody}
            modules={modules}
            theme="snow"
          />
        </div>

        <div className="question-option">
          <h3>Tags</h3>
          <TagsInput value={tags} onChange={setTags} />
        </div>

        <button onClick={handleSubmit} className="button">
          Add your question
        </button>

      </div>
    </div>
  );
}

export default Index;