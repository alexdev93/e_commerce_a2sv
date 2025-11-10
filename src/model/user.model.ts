import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email?: string;
  password?: string;
  role?: "USER" | "ADMIN";
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
