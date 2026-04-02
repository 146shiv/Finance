import mongoose from "mongoose";
import { env } from "../config/env.js";

export async function connectMongo() {
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected");
  });
  mongoose.connection.on("error", (error) => {
    console.error("MongoDB error", error.message);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });

  await mongoose.connect(env.mongoUri, {
    maxPoolSize: 20,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 10000,
  });
}

export async function disconnectMongo() {
  await mongoose.connection.close();
}
