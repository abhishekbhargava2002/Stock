import mongoose from "mongoose";
import dns from "dns";
import { env } from "./env";

dns.setDefaultResultOrder("ipv4first");

// Force Node.js to use public DNS for MongoDB SRV lookup
dns.setServers(["8.8.8.8", "1.1.1.1"]);

export async function connectDB() {
  console.log(
    "MongoDB URI host:",
    env.mongoUri.split("@")[1]?.split("/")[0] || "MONGODB_URI_NOT_FOUND"
  );

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });

    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed", error);
    process.exit(1);
  }
}