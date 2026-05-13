import React from "react";

import "./css/Sidebar.css";
import { Link } from "react-router-dom";
import PublicIcon from "@mui/icons-material/Public";

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-container">
        <div className="sidebar-options">
          <div className="sidebar-option">
            <Link to="/">Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
