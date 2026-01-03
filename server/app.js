import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import loginActivityRoutes from "./routes/loginActivityRoutes.js";
import subscriptionRoutes from "./routes/subcriptionRoutes.js";
import webbhooksRoutes from "./routes/webhookRoutes.js";
import { spawn } from "child_process";
import { checkAuth } from "./middlewares/authMiddleware.js";
import { connectDB } from "./config/db.js";
import logger from "./utils/logger.js";
import helmet from "helmet";
import crypto from "crypto";
import { verifyGithubSignature } from "./middlewares/verifyGithubSignature.js";
import SendmailTransport from "nodemailer/lib/sendmail-transport/index.js";
import { sendDeploymentNotification } from "./utils/nodemailer.js";
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

app.post("/github-webhook", verifyGithubSignature, (req, res) => {
  res.json({ message: "Ok" });

  const bashChildProcess = spawn("bash", ["/home/ubuntu/deploy-frontend.sh"]);

  let output = "";
  let errorOutput = "";

  bashChildProcess.stdout.on("data", (data) => {
    output += data.toString();
    process.stdout.write(data);
  });

  bashChildProcess.stderr.on("data", (data) => {
    errorOutput += data.toString();
    process.stderr.write(data);
  });

  bashChildProcess.on("close", async (code) => {
    // const notifyEmail =
    //   req.body.repository.owner?.email || process.env.DEPLOY_NOTIFY_EMAIL;

    // try {
    if (code == 0) {
      // await sendDeploymentNotification({
      //   email: notifyEmail,
      //   repoName: req.body.repository.name,
      //   branchName: req.body.ref.replace("refs/heads/", ""),
      //   status: "success",
      //   commit: req.body.head_commit.message,
      // });

      console.log("✅ Script execution completed.");
    } else {
      // await sendDeploymentNotification({
      //   email: notifyEmail,
      //   repoName: req.body.repository.name,
      //   branchName: req.body.ref.replace("refs/heads/", ""),
      //   status: "failed",
      //   commit:
      //     req.body.head_commit.message +
      //     "\n\n--- ERROR LOG ---\n" +
      //     errorOutput,
      // });

      console.error(`❌ Script execution failed with code ${code}`);
    }
    // } catch (err) {
    //   console.error("❌ Error sending deployment email", err);
    // }
  });

  bashChildProcess.on("error", (err) => {
    console.error("Error in spawning the process!", err);
  });
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
