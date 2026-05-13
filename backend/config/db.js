import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGO_URL;
    if (!uri) {
      console.error("Missing MONGO_URI / MONGO_URL environment variable");
      process.exit(1);
    }

    await mongoose.connect(uri);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("MongoDB connection error:", error);

    process.exit(1);
  }
};

export default connectDB;