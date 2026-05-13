import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

import { Provider } from "react-redux";
import store from "./app/store";

import hljs from "highlight.js";
import "highlight.js/styles/github.css";

hljs.configure({
  languages: [
    "javascript",
    "ruby",
    "python",
    "c",
    "cpp",
    "java",
    "html",
    "css",
    "perl",
    "r",
    "matlab",
  ],
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);