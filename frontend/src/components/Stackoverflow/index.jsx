import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import "./css/index.css";
import Main from "./Main";
import axios from "../../api/axios";
import { useSearchParams } from "react-router-dom";

function Index() {
  const [questions, setQuestions] = useState([]);
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");

  useEffect(() => {
    async function getQuestions() {
      try {
        const url = query ? `/question/search?q=${query}` : "/question";
        const res = await axios.get(url);

        const fetched = res.data?.data || [];
        setQuestions([...fetched].reverse());
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    }

    getQuestions();
  }, [query]);

  return (
    <div className="stack-index">
      <div className="stack-index-content">
        <Sidebar />
        <Main questions={questions} />
      </div>
    </div>
  );
}

export default Index;