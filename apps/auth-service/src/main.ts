import cookieParser from "cookie-parser";
import express from "express";
import { errorMiddleware } from "../../../packages/error-handler/error-middleware";

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const app = express();

app.get("/", (req, res) => {
  res.send({ message: "Auth Service is healthy" });
});

app.use(express.json());
app.use(cookieParser());
app.use(errorMiddleware);

const server = app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});

server.on("error", console.error);

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});
