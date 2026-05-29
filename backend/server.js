import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import router from "./routers/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Fix __dirname (ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =======================
// CORS CONFIG (PRODUCTION SAFE)
// =======================
app.use(
  cors({
    origin: "*", 
    credentials: true,
  })
);

// =======================
// MIDDLEWARE
// =======================
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));

// =======================
// ROUTES
// =======================
app.use("/api", router);

// =======================
// STATIC FILES (optional uploads only)
// =======================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =======================
// HEALTH CHECK ROUTE
// =======================
app.get("/", (req, res) => {
  res.send("Stack Overflow Clone API is running 🚀");
});

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
