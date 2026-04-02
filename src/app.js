import express from "express";
import crypto from "crypto";
import morgan from "morgan";
import { env, validateEnv } from "./config/env.js";
import { connectMongo, disconnectMongo } from "./db/mongo.js";
import apiRoutes from "./routes/index.routes.js";
import { globalErrorHandler, notFoundHandler } from "./validations/error.js";

const app = express();

morgan.token("reqId", (req, res) => res.locals?.requestId || "unknown");

app.use(express.json());
app.use((req, res, next) => {
  res.locals.requestId = req.headers["x-request-id"] || crypto.randomUUID();
  res.setHeader("x-request-id", res.locals.requestId);
  next();
});
app.use(
  morgan(":method :url :status :response-time ms reqId=:reqId", {
    immediate: false,
  }),
);

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy", requestId: res.locals.requestId });
});

app.use("/api/v1", apiRoutes);
app.use(notFoundHandler);
app.use(globalErrorHandler);

async function startServer() {
  validateEnv();
  await connectMongo();
  const server = app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });

  const shutdown = async () => {
    console.log("Shutting down server");
    server.close(async () => {
      await disconnectMongo();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
