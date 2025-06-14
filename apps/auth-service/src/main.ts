import { errorMiddleware } from "@packages/error-handler/error-middleware";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import swaggerUi from "swagger-ui-express";
import AuthRouter from "./routes/auth.routes";

dotenv.config();

// @ts-ignore
import swaggerDocument from "./swagger-output.json";

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000", // user-ui
      "http://localhost:6003", //seller-ui
      "http://localhost:8080",
    ], // Allow Gateway and frontend
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/", (req, res) => {
  res.send({ message: "Auth Service is healthy" });
});

// Optional: Add a base /api route for debugging
app.get("/api", (req, res) => {
  res.send({ message: "Auth Service API" });
});

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs-json", (req, res) => {
  res.send(swaggerDocument);
});

// Auth routes
app.use("/", AuthRouter);

// Error handling
app.use(errorMiddleware);

const server = app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
  console.log(`[ ready ] http://localhost:${port}/api-docs`);
});

server.on("error", console.error);
