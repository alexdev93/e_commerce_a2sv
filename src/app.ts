import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";
import userRoutes from "./routes/user.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", userRoutes);

app.get("/", (_req, res) => {
  res.send("🚀 Node.js + TypeScript + Mongoose API running");
});

// app.use("/api/users", userRoutes);

app.use(errorHandler);

export default app;
