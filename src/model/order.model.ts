import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./user.model";
import { IProduct } from "./product.model";

export interface IOrderItem {
  product: IProduct["_id"];
  quantity: number;
}

export interface IOrder extends Document {
  user: IUser["_id"];
  items: IOrderItem[];
  totalPrice: number;
  status?: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  createdAt?: Date;
  updatedAt?: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", orderSchema);
