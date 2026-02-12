import mongoose from "mongoose";

const MONGO_DB_URI = process.env.MONGO_DB_URI


if (!MONGO_DB_URI) {
  console.error("❌ MONGO_DB_URI is missing");
  throw new Error("Database configuration error");
}

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_DB_URI);
        console.log("Database connected successfully");
    }catch (error) {
        console.error("Error connecting to Database:", error);
        throw new Error("Database connection failed: " + error.message);
    }
}