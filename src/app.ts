import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";
import userRoutes from "./routes/user.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";

const app = express();

app.use(cors());
app.use(express.json());

// const apiRouter = express.Router();

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/products", productRoutes)
app.use("/api/v1/orders", orderRoutes)

// app.use("/api/v1", apiRouter);

app.get("/", (_req, res) => {
  res.send("🚀 Node.js + TypeScript + Postgres API running");
});

app.use(errorHandler);

export default app;
