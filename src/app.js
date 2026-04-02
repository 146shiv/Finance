import express from "express";
import morgan from "morgan";
import { env, validateEnv } from "./config/env.js";
import { connectMongo } from "./db/mongo.js";
import apiRoutes from "./routes/index.routes.js";
import { globalErrorHandler, notFoundHandler } from "./validations/error.js";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy" });
});

app.use("/api/v1", apiRoutes);
app.use(notFoundHandler);
app.use(globalErrorHandler);

async function startServer() {
  validateEnv();
  await connectMongo();
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
