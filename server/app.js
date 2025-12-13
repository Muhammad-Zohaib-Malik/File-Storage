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
import rateLimit from "./utils/rateLimiter.js";

const mySecretKey = process.env.COOKIE_PARSER_SECRET;
await connectDB();

const app = express();
app.use("/webhooks", webbhooksRoutes);
app.use(cookieParser(mySecretKey));
app.use(express.json());
app.use(helmet());
app.use(rateLimit);
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
const PORT = process.env.PORT || 4000;

app.use("/directory", checkAuth, directoryRoutes);
app.use("/file", checkAuth, fileRoutes);
app.use("/user", userRoutes);
app.use("/latest-login", checkAuth, loginActivityRoutes);
app.use("/subscriptions", checkAuth, subscriptionRoutes);

app.use((err, req, res, next) => {
  logger.error("Error occurred:", err);
  res.status(err.status || 500).json({ error: "Something went wrong!" });
});

app.get("/health", (req, res) => {
  logger.info("Health check successful");
  res.status(200).json({ message: "Health check successful" });
});

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
