import { errorMiddleware } from "@packages/error-handler/error-middleware";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
dotenv.config();

// @ts-ignore
const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 6002;

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Auth Service is healthy" });
});

app.use(errorMiddleware);

const server = app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
  console.log(`[ ready ] http://localhost:${port}/api-docs`);
});

server.on("error", console.error);

// process.on("SIGTERM", () => {
//   console.log("SIGTERM signal received: closing HTTP server");
//   server.close(() => {
//     console.log("HTTP server closed");
//   });
// });
