import React from "react";
import Sidebar from "../Stackoverflow/Sidebar";
import MainQuestion from "./MainQuestion";
import "./index.css";

function Index() {
  return (
    <div className="stack-index">

      <div className="stack-index-content">

        <Sidebar />

        <div className="stack-main">
          <MainQuestion />
        </div>

      </div>

    </div>
  );
}

export default Index;