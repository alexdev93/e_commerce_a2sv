import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/user.entity";
import { Product } from "../entities/product.entity";
import { Order } from "../entities/order.entity";
import "dotenv/config";

const {
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  DB_SYNC
} = process.env;


export const AppDataSource = new DataSource({
  type: "postgres",       
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: true,
  logging: true,
  entities: [User, Product, Order],
});
