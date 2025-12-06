import mongoose from "mongoose";

export const connectMongoDB = async () => {
  // set and validate mongodb url
  const mongoURL = process.env.MONGO_URI;

  if (!mongoURL) {
    throw new Error(" MONGO_URI is missing in environment variables.");
  }

  try {
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(mongoURL);
    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(" MongoDB connection failed:", error);
    throw error;
  }
};

// Optional shutdown handling
export const disconnectMongoDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("📦 MongoDB Disconnected.");
  } catch (error) {
    console.error(" Error during MongoDB disconnection", error);
  }
};
