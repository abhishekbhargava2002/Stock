import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: (process.env.MONGODB_URI || "").trim(),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  clientAppUrl: process.env.CLIENT_APP_URL || "http://localhost:3000",
};

if (!env.mongoUri) {
  throw new Error("MONGODB_URI is missing in backend/.env");
}

if (
  !env.mongoUri.startsWith("mongodb://") &&
  !env.mongoUri.startsWith("mongodb+srv://")
) {
  throw new Error("Invalid MONGODB_URI format.");
}