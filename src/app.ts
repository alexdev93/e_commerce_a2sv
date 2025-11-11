import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";
import userRoutes from "./routes/user.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", userRoutes);
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)

app.get("/", (_req, res) => {
  res.send("🚀 Node.js + TypeScript + Mongoose API running");
});

// app.use("/api/users", userRoutes);

app.use(errorHandler);

export default app;
