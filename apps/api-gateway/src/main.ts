import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import proxy from "express-http-proxy";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import initializeSiteConfig from "./lib/initializeSiteConfig";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());
app.set("trust proxy", 1);

// apply rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: true,
    keyGenerator: (req: any) => req.ip,
  })
);

app.use("/", proxy("http://localhost:6001"));

app.use("/gateway-health", (req, res) => {
  res.send({ status: "ok", message: "API Gateway is healthy" });
});

const port = process.env.PORT ? Number(process.env.PORT) : 8080;
const host = process.env.HOST ?? "localhost";
const server = app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
  try {
    initializeSiteConfig();
    console.log("[ ready ] Site config initialized");
  } catch (error) {
    console.error("Error initializing site config:", error);
  }
});
server.on("error", console.error);

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});
