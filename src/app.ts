import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";
import userRoutes from "./routes/user.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  standardHeaders: true, 
  legacyHeaders: false, 
});

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", limiter);

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/products", productRoutes)
app.use("/api/v1/orders", orderRoutes)

app.get("/", (_req, res) => {
  res.send("🚀 Node.js + TypeScript + Postgres API running");
});

app.use(errorHandler);

export default app;
