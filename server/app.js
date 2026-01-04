import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import loginActivityRoutes from "./routes/loginActivityRoutes.js";
import subscriptionRoutes from "./routes/subcriptionRoutes.js";
import webbhooksRoutes from "./routes/webhookRoutes.js";
import { checkAuth } from "./middlewares/authMiddleware.js";
import { connectDB } from "./config/db.js";
import logger from "./utils/logger.js";
import helmet from "helmet";
import { executeBashScript } from "./helper/executeBashScript.js";

// import createRateLimiter from "./utils/rateLimiter.js";

const mySecretKey = process.env.COOKIE_PARSER_SECRET;
await connectDB();

const app = express();
app.use("/webhooks", webbhooksRoutes);
app.use(cookieParser(mySecretKey));
app.use(express.json());
app.use(helmet());
// app.use(createRateLimiter());
const allowedOrigins = [process.env.CLIENT_URL1, process.env.CLIENT_URL2];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

const PORT = process.env.PORT || 4000;

app.post("/github-webhook", verifySignature, (req, res) => {
  res.status(200).send("OK");

  const commits = req.body.commits || [];

  let clientChanged = false;
  let serverChanged = false;

  for (const commit of commits) {
    const files = [
      ...(commit.added || []),
      ...(commit.modified || []),
      ...(commit.removed || []),
    ];

    for (const file of files) {
      if (file.startsWith("client/")) clientChanged = true;
      if (file.startsWith("server/")) serverChanged = true;

      if (clientChanged && serverChanged) break;
    }
    if (clientChanged && serverChanged) break;
  }

  if (!clientChanged && !serverChanged) {
    console.log("ℹ️ No deployable changes detected");
    return;
  }

  if (clientChanged) {
    console.log("📦 Client changed → Deploying frontend");
    executeBashScript("/home/ubuntu/deploy-client.sh", "CLIENT");
  }

  if (serverChanged) {
    console.log("⚙️ Server changed → Deploying backend");
    executeBashScript("/home/ubuntu/deploy-server.sh", "SERVER");
  }
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello World" });
});

app.get("/health", (req, res) => {
  logger.info("Health check successfully");
  res.status(200).json({ message: "Health check successfully" });
});

app.use("/directory", checkAuth, directoryRoutes);
app.use("/file", checkAuth, fileRoutes);
app.use("/user", userRoutes);
app.use("/latest-login", checkAuth, loginActivityRoutes);
app.use("/subscriptions", checkAuth, subscriptionRoutes);

app.use((err, req, res, next) => {
  logger.error("Error occurred:", err);
  res.status(err.status || 500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
