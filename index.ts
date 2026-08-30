import { prisma } from "./lib/prisma";
import express from "express";
import morgan from "morgan";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import { API_PREFIX, API_URLS } from "./constants/apiUrls";
import { AppError } from "./utils/appError";
import { globalErrorHandler } from "./controllers/errorController";

const app = express();

app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Routes
app.use(`${API_PREFIX}${API_URLS.USERS}`, userRoutes);
app.use(`${API_PREFIX}${API_URLS.PRODUCTS}`, productRoutes);

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

// async function main() {
//   // Create a new user with a post
//   const user = await prisma.user.create({
//     data: {
//       name: "Alice",
//       email: "alice@prisma.io",
//       posts: {
//         create: {
//           title: "Hello World",
//           content: "This is my first post!",
//           published: true,
//         },
//       },
//     },
//     include: {
//       posts: true,
//     },
//   });
//   console.log("Created user:", user);

//   // Fetch all users with their posts
//   const allUsers = await prisma.user.findMany({
//     include: {
//       posts: true,
//     },
//   });
//   console.log("All users:", JSON.stringify(allUsers, null, 2));
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });
