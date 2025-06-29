import { errorMiddleware } from "@packages/error-handler/error-middleware";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 6004;

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000", // user-ui
      "http://localhost:3001", //seller-ui
      "http://localhost:3002", //admin-ui
      "http://localhost:8080",
    ], // Allow Gateway and frontend
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cookieParser());

// Health check
app.get("/", (req, res) => {
  res.send({ message: "Admin Service is healthy" });
});

// Admin routes
// app.use("/", orderRoutes);

// Error handling
app.use(errorMiddleware);

const server = app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
  console.log(`[ ready ] http://localhost:${port}/api-docs`);
});

server.on("error", console.error);
