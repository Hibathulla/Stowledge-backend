import { prisma } from "./lib/prisma";
import express from "express";
import morgan from "morgan";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import stockMovementRoutes from "./routes/stockMovementRoutes";
import { API_PREFIX, API_URLS } from "./constants/apiUrls";
import { AppError } from "./utils/appError";
import { globalErrorHandler } from "./controllers/errorController";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import authRoutes from "./routes/authRoutes";
import cookieParser from "cookie-parser";

const app = express();

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// rate limiting middleware
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 15 minutes
  message: "Too many requests from this IP, please try again after an hour",
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use("/api", limiter); // Apply the rate limiting middleware to all requests

app.use(express.json({ limit: "10kb" })); // Body parser, reading data from body into req.body
app.use(cookieParser());

//Prevent Parameter pollution
app.use(hpp());

// Routes
app.use(`${API_PREFIX}${API_URLS.AUTH}`, authRoutes);
app.use(`${API_PREFIX}${API_URLS.USERS}`, userRoutes);
app.use(`${API_PREFIX}${API_URLS.PRODUCTS}`, productRoutes);
app.use(`${API_PREFIX}${API_URLS.STOCK_MOVEMENTS}`, stockMovementRoutes);

// Undefined route handler. Always keep this at the bottom of all routes.
app.use((req, res, next) => {
  const error = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(error);
});

app.use(globalErrorHandler);

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err);
  process.exit(1);
});

export { app };
