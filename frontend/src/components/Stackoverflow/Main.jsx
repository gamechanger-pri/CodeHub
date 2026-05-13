import React from "react";
import "./css/Main.css";
import "./css/AllQuestions.css";
import { Link } from "react-router-dom";
import AllQuestions from "./AllQuestions";

function Main({ questions }) {
  return (
    <div className="main">
      <div className="main-container">
        <div className="main-top">
          <h2>All Questions</h2>
          <Link to="/add-question">
            <button>Ask Question</button>
          </Link>
        </div>
        <div className="main-desc">
          <p>{questions.length} questions</p>
        </div>
        {questions.map((question) => (
          <AllQuestions key={question._id} data={question} />
        ))}
      </div>
    </div>
  );
}

export default Main;