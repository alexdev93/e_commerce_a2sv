import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/user.entity";
import { Product } from "../entities/product.entity";

export const AppDataSource = new DataSource({
  type: "mongodb",
  host: process.env.DB_HOST || "localhost",
  port: 27017,
  database: process.env.DB_NAME || "a2sv_ecommerce",
  synchronize: true, // ⚠️ set to false in production
//   useUnifiedTopology: true,
  entities: [User, Product],
});
