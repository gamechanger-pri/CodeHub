import express from "express";
import mongoose from "mongoose";
import cors from 'cors'
import userRoutes from "./routes/users.js";
import questionRoutes from './routes/Questions.js'
import answerRoutes from './routes/Answers.js'
import chatbotRoutes from './routes/chatbot.js'
import dotenv from 'dotenv'
const app = express();
dotenv.config();
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());


app.get("/",(req,res)=>{
    res.send("this is stack-overflow clone");
})
app.use("/user", userRoutes);
app.use("/questions",questionRoutes)
app.use("/answer",answerRoutes)
app.use("/api/v1/openai",chatbotRoutes);
const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`server running on port ${PORT}`);
//   });

  const CONNECTION_URL=process.env.CONNECTION_URL
  mongoose.connect(CONNECTION_URL,{useUnifiedTopology:true}).then(()=>app.listen(PORT,()=>{console.log(`connected`)}))
  .catch((error)=>console.log(error.message))